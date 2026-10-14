import test from "node:test";
import assert from "node:assert/strict";
import ERPProject from "../models/Project.js";
import ERPPayment from "../models/Payment.js";
import { updatePayment, addPayment } from "./payment.controller.js";
import { calculateProjectPaymentSummary } from "../utils/paymentSummary.js";
import { validatePaymentTerms } from "./srs.controller.js";

const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const project = { _id: "p1", clientEmail: "client@example.com", totalPayment: 50000, srsLockedAt: new Date(), srsPaymentTerms: {
  breakdown: [{ id: "advance", label: "Advance", amount: 10000, due: "Approval" }],
} };
const mockProject = (t) => t.mock.method(ERPProject, "findOne", (query) => {
  assert.equal(query.manager, "manager");
  return { populate: () => ({ lean: async () => project }) };
});

test("receipts remain editable after SRS lock and keep reference and instalment allocation", async (t) => {
  mockProject(t);
  t.mock.method(ERPPayment, "findById", async () => ({ project: "p1" }));
  let saved;
  t.mock.method(ERPPayment, "findByIdAndUpdate", async (id, update) => {
    saved = update;
    return { toObject: () => ({ _id: id, ...update }) };
  });
  t.mock.method(ERPPayment, "find", () => ({ sort: () => ({ lean: async () => [{ ...saved, _id: "receipt" }] }) }));
  const res = response();
  await updatePayment({ params: { paymentId: "receipt" }, erpUser: { _id: "manager", role: "manager" }, body: {
    amount: 5000, status: "paid", method: "UPI", paymentDate: "2026-10-13", instalmentId: "advance", transactionReference: "UTR-123",
  } }, res);
  assert.equal(res.code, 200);
  assert.equal(saved.instalmentLabel, "Advance");
  assert.equal(res.body.payment.transactionReference, "UTR-123");
  assert.equal(res.body.payment.paymentDate, "2026-10-13");
  assert.equal(res.body.summary.paidAmount, 5000);
  assert.equal(res.body.summary.dueAmount, 45000);
});

test("receipt cannot target an instalment outside the project", async (t) => {
  mockProject(t);
  t.mock.method(ERPPayment, "create", async () => assert.fail("Invalid receipt created"));
  const res = response();
  await addPayment({ erpUser: { _id: "manager", role: "manager" }, body: {
    projectId: "p1", amount: 1000, method: "UPI", instalmentId: "another-project-row",
  } }, res);
  assert.equal(res.code, 400);
});

test("pending and failed transfers do not reduce the received balance", () => {
  const summary = calculateProjectPaymentSummary(project, [
    { amount: 7000, status: "paid" }, { amount: 4000, status: "paid" },
    { amount: 6000, status: "pending" }, { amount: 3000, status: "failed" },
  ]);
  assert.equal(summary.paidAmount, 11000); assert.equal(summary.dueAmount, 39000);
});

test("detailed instalment fields persist and invalid dates are rejected", () => {
  const terms = { total: 10000, breakdown: [{ id: "advance", label: "Advance", amount: 10000, due: "Approval", dueDate: "2026-11-20", description: "Discovery and wireframes" }] };
  assert.deepEqual(validatePaymentTerms(terms).breakdown[0], terms.breakdown[0]);
  terms.breakdown[0].dueDate = "2026-02-30";
  assert.throws(() => validatePaymentTerms(terms), /valid instalment due date/);
});
