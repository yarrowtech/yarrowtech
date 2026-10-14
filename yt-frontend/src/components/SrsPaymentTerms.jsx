import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import API from "../services/axiosInstance";
import "../styles/SrsPaymentTerms.css";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value) || 0);
const date = (value) => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "Not recorded";
const cents = (p) => Math.round(Number(p.amount) * 100) || 0;
const norm = (v) => String(v || "").trim().toLowerCase();

/* Assign every paid payment to an instalment: by id first, then by instalment name.
   Payments that match neither stay unallocated (still counted in the overall received total). */
const allocatePayments = (payments = [], breakdown = []) => {
  const rowId = (row, i) => row.id || `legacy-${i}`;
  const paid = breakdown.map(() => 0);
  let unallocated = 0;
  payments.filter((p) => p.status === "paid").forEach((p) => {
    let index = breakdown.findIndex((row, i) => p.instalmentId && rowId(row, i) === p.instalmentId);
    if (index === -1) {
      const wanted = norm(p.instalmentLabel);
      const same = wanted ? breakdown.map((row, i) => (norm(row.label) === wanted ? i : -1)).filter((i) => i !== -1) : [];
      if (same.length === 1) index = same[0];
    }
    if (index === -1) unallocated += cents(p); else paid[index] += cents(p);
  });
  return { paid: paid.map((c) => c / 100), unallocated: unallocated / 100 };
};
const paidFor = (payments) => payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + cents(p), 0) / 100;

export function SrsPaymentHistory({ project, payments, onRecord, onEdit }) {
  const [loaded, setLoaded] = useState(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (payments !== undefined) return;
    let active = true;
    setLoaded(null); setError("");
    API.get(`/erp/client/project/${project._id}/payments`).then((res) => {
      if (active) setLoaded(res.data.payments || []);
    }).catch(() => { if (active) setError("Unable to load payment history. Please retry."); });
    return () => { active = false; };
  }, [project._id, payments, refresh]);
  const entries = payments ?? loaded;
  const total = project.srsPaymentTerms?.updatedAt ? project.srsPaymentTerms.total : project.totalPayment || 0;
  const received = entries ? paidFor(entries) : 0;
  const breakdown = project.srsPaymentTerms?.breakdown || [];
  const allocation = allocatePayments(entries || [], breakdown);
  const unallocated = allocation.unallocated;
  return <section className="srs-payment-history">
    <div className="srs-payment-actions"><h4>Client Payments & Outstanding Balance</h4>
      {onRecord && <button type="button" className="pd-btn pd-btn--primary" onClick={onRecord}>Record client payment</button>}
      {payments === undefined && <button type="button" className="req-cancel" onClick={() => setRefresh((n) => n + 1)}>Refresh payments</button>}
    </div>
    <p>Payment records are updated as money is received. The agreed payment terms remain locked.</p>
    {error ? <p role="alert">{error}</p> : !entries ? <p>Loading payment history...</p> : <>
      <div className="srs-payment-totals"><div>Total payable<strong>{money(total)}</strong></div><div>Received (paid)<strong>{money(received)}</strong></div><div>Balance due<strong>{money(Math.max(0, total - received))}</strong></div>{received > total && <div>Excess received<strong>{money(received - total)}</strong></div>}</div>
      {breakdown.length > 0 && <div className="srs-payment-table-wrap"><table className="srs-payment-table"><thead><tr><th>Instalment</th><th>Expected</th><th>Received</th><th>Balance</th><th>Status</th></tr></thead><tbody>{breakdown.map((row, i) => {
        const paid = allocation.paid[i];
        const outstanding = Math.max(0, Math.round((row.amount - paid) * 100) / 100);
        const over = Math.max(0, Math.round((paid - row.amount) * 100) / 100);
        const state = outstanding === 0 ? (over > 0 ? "Paid (excess)" : "Paid") : paid > 0 ? "Partially paid" : "Unpaid";
        return <tr key={row.id || i}><td>{row.label}</td><td>{money(row.amount)}</td><td>{money(paid)}</td><td>{money(outstanding)}</td><td><span className={`srs-pay-state srs-pay-state--${state.startsWith("Paid") ? "paid" : paid > 0 ? "part" : "unpaid"}`}>{state}</span></td></tr>;
      })}</tbody></table></div>}
      {unallocated > 0 && <p className="srs-payment-status srs-payment-status--warn">{money(unallocated)} was received but does not match any current instalment name. It is counted in the received total; edit that payment and pick its instalment.</p>}
      {entries.length ? <div className="srs-payment-table-wrap"><table className="srs-payment-table"><thead><tr><th>Payment date</th><th>Amount sent</th><th>Method</th><th>Instalment / type</th><th>Reference / invoice</th><th>Status</th><th>Notes</th>{onEdit && <th>Action</th>}</tr></thead><tbody>{entries.map((p) => <tr key={p._id}><td>{date(p.paymentDate)}</td><td>{money(p.amount)}</td><td>{p.method}</td><td>{p.instalmentLabel || p.paymentType || "Unallocated"}</td><td>{p.transactionReference || "No transaction reference"}<br />{p.invoiceNo}</td><td>{p.status}</td><td>{p.notes || "—"}</td>{onEdit && <td><button type="button" className="pd-btn" onClick={() => onEdit(p)}>Edit</button></td>}</tr>)}</tbody></table></div> : <p>No client payments recorded yet.</p>}
      <p>Pending and failed entries do not reduce the balance due.</p>
    </>}
  </section>;
}
export function SrsPaymentSummary({ project }) {
  const terms = project.srsPaymentTerms;
  if (!terms?.updatedAt) return <p>The manager has not set payment terms yet.</p>;
  return <div className="srs-payment-summary">
    <p><strong>Total project amount: {money(terms.total)}</strong></p>
    <div className="srs-payment-table-wrap"><table className="srs-payment-table">
      <thead><tr><th>Instalment & details</th><th>Amount / share</th><th>Due date / milestone</th></tr></thead>
      <tbody>{terms.breakdown.map((row, i) => <tr key={i}><td><strong>{row.label}</strong>{row.description && <p>{row.description}</p>}</td><td>{money(row.amount)}<br />{terms.total > 0 ? `${(row.amount / terms.total * 100).toFixed(1)}%` : ""}</td><td>{row.due}{row.dueDate && <p>Due: {date(row.dueDate)}</p>}</td></tr>)}</tbody>
      <tfoot><tr><th>Total</th><th>{money(terms.total)}</th><td /></tr></tfoot>
    </table></div>
    {terms.notes && <p className="srs-payment-notes">{terms.notes}</p>}
    <p>{project.requirements?.paymentApproved === "yes" && project.requirements?.paymentApprovedOn && project.requirements?.approved === "yes"
      ? `Payment terms approved by ${project.requirements.approvalName || "client"} on ${project.requirements.paymentApprovedOn}.`
      : "Waiting for client approval of payment terms."}</p>
  </div>;
}

const toCents = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

const newRow = (label = "", amount = "", due = "") => ({ label, amount, due, dueDate: "", description: "" });

export default function SrsPaymentTerms({ project, onSaved, payments, onRecordPayment, onEditPayment }) {
  const terms = project.srsPaymentTerms;
  const [editing, setEditing] = useState(false);
  const [total, setTotal] = useState("");
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState("");
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const begin = () => {
    setTotal(terms?.total ?? project.totalPayment ?? "");
    setRows(terms?.breakdown?.length
      ? terms.breakdown.map((row, i) => ({ ...row, id: row.id || `legacy-${i}` }))
      : [newRow("Advance", "", "On project approval")]);
    setNotes(terms?.notes || ""); setRevision(project.srsRevision || 0);
    setTouched(false); setEditing(true);
  };
  const update = (i, key, value) => setRows((prev) => prev.map((row, n) => (n === i ? { ...row, [key]: value } : row)));

  /* Money is compared in whole paise so 0.1 + 0.2 style errors cannot block saving */
  const totalCents = toCents(total);
  const allocatedCents = rows.reduce((sum, row) => sum + (toCents(row.amount) || 0), 0);
  const remainingCents = (totalCents || 0) - allocatedCents;

  const rowErrors = rows.map((row) => ({
    label: !String(row.label || "").trim() ? "Enter a name" : "",
    amount: toCents(row.amount) === null ? "Enter an amount" : toCents(row.amount) === 0 ? "Must be above 0" : "",
    due: !String(row.due || "").trim() ? "Enter when it is due" : "",
  }));
  const rowsValid = rowErrors.every((e) => !e.label && !e.amount && !e.due);
  const totalError = totalCents === null || totalCents === 0 ? "Enter the total project amount" : "";
  const balanceError = !totalError && remainingCents !== 0
    ? remainingCents > 0
      ? `${money(remainingCents / 100)} is still unallocated. Add it to an instalment or add another.`
      : `Instalments exceed the total by ${money(-remainingCents / 100)}.`
    : "";
  const canSave = !totalError && rows.length > 0 && rowsValid && !balanceError;

  const fillRemaining = (i) => {
    const others = rows.reduce((sum, row, n) => sum + (n === i ? 0 : toCents(row.amount) || 0), 0);
    const value = ((totalCents || 0) - others) / 100;
    if (value > 0) update(i, "amount", String(value));
  };
  const splitEvenly = () => {
    if (!totalCents || !rows.length) return;
    const base = Math.floor(totalCents / rows.length);
    const extra = totalCents - base * rows.length;
    setRows((prev) => prev.map((row, n) => ({ ...row, amount: String((base + (n === prev.length - 1 ? extra : 0)) / 100) })));
  };

  const save = async () => {
    setTouched(true);
    if (!canSave) {
      toast.error(totalError || balanceError || "Complete every instalment before saving");
      return;
    }
    setSaving(true);
    try {
      const res = await API.put(`/erp/${localStorage.getItem("erp_role") === "admin" ? "admin" : "manager"}/projects/${project._id}/srs-payment-terms`, {
        total: totalCents / 100,
        breakdown: rows.map((row) => ({ ...row, label: row.label.trim(), due: row.due.trim(), amount: toCents(row.amount) / 100 })),
        notes,
        revision,
      });
      onSaved?.(res.data.project); setEditing(false);
      toast.success("Payment terms saved. Client approval is required.");
    } catch (err) { toast.error(err?.response?.data?.message || "Unable to save payment terms"); }
    finally { setSaving(false); }
  };

  const err = (msg) => (touched && msg ? <small className="srs-payment-error">{msg}</small> : null);

  return <section className="pd-card srs-payment">
    <h3>Payment Terms & Breakdown</h3>
    {!editing && <SrsPaymentSummary project={project} />}
    {!project.srsLockedAt && !editing && <button type="button" className="pd-btn pd-btn--primary" onClick={begin}>{terms?.updatedAt ? "Edit payment terms" : "Set payment terms"}</button>}
    {editing && !project.srsLockedAt && <fieldset disabled={saving} className="srs-payment-editor">
      <legend>Set the payment schedule</legend>
      <p className="srs-payment-help">Split the project amount into instalments. The instalments must add up exactly to the total.</p>

      <div className="srs-payment-top">
        <label className="srs-payment-total-field">Total project amount (INR)
          <input type="number" min="0" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
          {err(totalError)}
        </label>
        <button type="button" className="pd-btn" onClick={splitEvenly} disabled={!totalCents || !rows.length}>Split total evenly</button>
      </div>

      {rows.map((row, i) => <div className="srs-payment-row" key={row.id || i}>
        <div className="srs-payment-row-head"><strong><span>{String(i + 1).padStart(2, "0")}</span> Instalment {i + 1}</strong>
          <button type="button" className="pd-btn srs-payment-remove" aria-label={`Remove instalment ${i + 1}`} disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, n) => n !== i))}>Remove</button></div>
        <label>Instalment name *<input value={row.label} maxLength={200} onChange={(e) => update(i, "label", e.target.value)} placeholder="e.g. Advance" />{err(rowErrors[i].label)}</label>
        <label>Amount (INR) *<input type="number" min="0" step="0.01" value={row.amount} onChange={(e) => update(i, "amount", e.target.value)} />
          {err(rowErrors[i].amount)}
          {remainingCents !== 0 && totalCents > 0 && <button type="button" className="srs-payment-fill" onClick={() => fillRemaining(i)}>Use remaining balance</button>}
        </label>
        <label>Milestone / when due *<input value={row.due} maxLength={300} onChange={(e) => update(i, "due", e.target.value)} placeholder="e.g. On design approval" />{err(rowErrors[i].due)}</label>
        <label>Due date (optional)<input type="date" value={row.dueDate || ""} onChange={(e) => update(i, "dueDate", e.target.value)} /></label>
        <label className="srs-payment-row-detail">What this instalment covers (optional)<textarea rows={2} value={row.description || ""} maxLength={1000} onChange={(e) => update(i, "description", e.target.value)} placeholder="Deliverables, work covered and conditions for payment" /></label>
      </div>)}

      <div className="srs-payment-allocation">
        <button type="button" className="pd-btn" disabled={rows.length >= 30} onClick={() => setRows([...rows, newRow("", remainingCents > 0 ? String(remainingCents / 100) : "")])}>+ Add instalment</button>
        <div><span>Total</span><strong>{money((totalCents || 0) / 100)}</strong></div>
        <div><span>Allocated</span><strong>{money(allocatedCents / 100)}</strong></div>
        <div className={remainingCents === 0 && totalCents ? "srs-balance-ok" : "srs-balance-bad"}><span>Remaining</span><strong>{money(remainingCents / 100)}</strong></div>
      </div>
      <div className={`srs-payment-status ${canSave ? "srs-payment-status--ok" : "srs-payment-status--warn"}`} role="status">
        {canSave ? "Instalments add up to the total. Ready to save." : totalError || balanceError || "Fill in every instalment's name, amount and milestone."}
      </div>

      <label>Payment notes<textarea rows={3} value={notes} maxLength={3000} onChange={(e) => setNotes(e.target.value)} placeholder="Include taxes, payment methods or other agreed conditions." /></label>
      <div className="srs-payment-editor-footer"><p>Saving requires the client to approve the payment terms and SRS again.</p><div className="srs-payment-actions"><button type="button" className="pd-btn" onClick={() => setEditing(false)}>Cancel</button><button type="button" className="pd-btn pd-btn--primary" onClick={save} disabled={!canSave}>{saving ? "Saving..." : "Save payment terms"}</button></div></div>
    </fieldset>}
    <SrsPaymentHistory project={project} payments={payments} onRecord={onRecordPayment} onEdit={onEditPayment} />
  </section>;
}
