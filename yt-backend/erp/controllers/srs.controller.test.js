import test from "node:test";
import assert from "node:assert/strict";
import ERPProject from "../models/Project.js";
import ERPUser from "../models/User.js";
import { approveProjectSrs, editableSrsFilter, validatePaymentTerms, saveSrsPaymentTerms } from "./srs.controller.js";
import ERPClient from "../models/Client.js";
import { updateProjectRequirements, deleteProjectDocument, uploadProjectDocumentFile } from "./client.controller.js";
import cloudinary from "../../utils/cloudinary.js";

const response = () => ({
  code: 200, body: null,
  status(code) { this.code = code; return this; },
  json(body) { this.body = body; return this; },
});
const project = () => ({ _id: "project", srsRevision: 3,
  srsPaymentTerms: { updatedAt: new Date(), total: 100, breakdown: [{ label: "Advance", amount: 100, due: "On approval" }] },
  requirements: { approved: "yes", approvalName: "Client", paymentApproved: "yes" } });
const request = () => ({ erpUser: { _id: "manager" }, params: { id: "project" }, body: { agree: true, revision: 3 } });

test("locked SRS rejects uploads and cleans up the uploaded file", async (t) => {
  t.mock.method(ERPClient, "findById", async () => ({ _id: "client" }));
  t.mock.method(ERPProject, "findOne", async () => ({ ...project(), srsLockedAt: new Date() }));
  t.mock.method(ERPProject, "findOneAndUpdate", async () => assert.fail("Locked attachments changed"));
  const cleanup = t.mock.method(cloudinary.uploader, "destroy", async () => ({}));
  const res = response();
  await uploadProjectDocumentFile({ erpUser: { _id: "client" }, params: { projectId: "project" },
    file: { filename: "temporary-upload" } }, res);
  assert.equal(res.code, 409);
  assert.equal(cleanup.mock.calls[0].arguments[0], "temporary-upload");
});

test("manager agreement records identity and atomically locks the reviewed revision", async (t) => {
  t.mock.method(ERPProject, "findOne", async (filter) => {
    assert.equal(filter.manager, "manager"); return project();
  });
  t.mock.method(ERPUser, "findById", async () => ({ name: "Manager" }));
  t.mock.method(ERPProject, "findOneAndUpdate", async (filter, update) => {
    assert.equal(filter.srsRevision, 3);
    assert.equal(filter.srsLockedAt, null);
    assert.equal(filter["requirements.approved"], "yes");
    assert.equal(update.$set.srsManagerId, "manager");
    assert.equal(update.$set.srsManagerName, "Manager");
    assert.ok(update.$set.srsLockedAt instanceof Date);
    assert.equal(update.$inc.srsRevision, 1);
    return { ...project(), ...update.$set };
  });
  const res = response(); await approveProjectSrs(request(), res);
  assert.equal(res.code, 200); assert.ok(res.body.project.srsLockedAt);
});

for (const [name, value, code] of [
  ["unassigned manager", null, 404],
  ["already locked", { ...project(), srsLockedAt: new Date() }, 409],
  ["client has not approved", { ...project(), requirements: {} }, 400],
  ["outdated review", { ...project(), srsRevision: 4 }, 409],
  ["missing payment approval", { ...project(), requirements: { approved: "yes", approvalName: "Client" } }, 400],
  ["missing payment terms", { ...project(), srsPaymentTerms: null }, 400],
]) {
  test(`rejects ${name}`, async (t) => {
    t.mock.method(ERPProject, "findOne", async () => value);
    t.mock.method(ERPUser, "findById", async () => ({ name: "Manager" }));
    const write = t.mock.method(ERPProject, "findOneAndUpdate", async () => assert.fail("Unexpected write"));
    const res = response(); await approveProjectSrs(request(), res);
    assert.equal(res.code, code); assert.equal(write.mock.callCount(), 0);
  });
}

test("payment breakdown validates totals, required milestones and decimal amounts", () => {
  const terms = { total: 0.3, breakdown: [{ label: "Advance", amount: 0.1, due: "Start" }, { label: "Final", amount: 0.2, due: "Delivery" }] };
  assert.equal(validatePaymentTerms(terms).total, 0.3);
  assert.throws(() => validatePaymentTerms({ ...terms, total: 1 }), /add up/);
  assert.throws(() => validatePaymentTerms({ ...terms, total: -1 }), /valid total/);
  assert.throws(() => validatePaymentTerms({ ...terms, total: 0.301 }), /valid total/);
  assert.throws(() => validatePaymentTerms({ ...terms, breakdown: [{ label: "Advance", amount: 0.3, due: "" }] }), /due date/);
});

test("manager payment changes clear both client approvals and update contract total atomically", async (t) => {
  t.mock.method(ERPProject, "findOne", async (filter) => { assert.equal(filter.manager, "manager"); return project(); });
  t.mock.method(ERPProject, "findOneAndUpdate", async (filter, update) => {
    assert.equal(filter.srsRevision, 3); assert.equal(filter.srsLockedAt, null);
    assert.equal(update.$set["requirements.approved"], "");
    assert.equal(update.$set["requirements.paymentApproved"], "");
    assert.equal(update.$set.totalPayment, 100);
    assert.equal(update.$set.srsPaymentTerms.updatedBy, "manager");
    assert.equal(update.$inc.srsRevision, 1);
    return project();
  });
  const req = request(); req.body = { revision: 3, total: 100, breakdown: [{ label: "Advance", amount: 100, due: "On approval" }] };
  const res = response(); await saveSrsPaymentTerms(req, res); assert.equal(res.code, 200);
});

test("manager cannot change locked payment terms", async (t) => {
  t.mock.method(ERPProject, "findOne", async () => ({ ...project(), srsLockedAt: new Date() }));
  t.mock.method(ERPProject, "findOneAndUpdate", async () => assert.fail("Locked payment terms changed"));
  const res = response(); await saveSrsPaymentTerms(request(), res); assert.equal(res.code, 409);
});

test("client must explicitly approve payments before SRS approval", async (t) => {
  t.mock.method(ERPClient, "findById", async () => ({ _id: "client" }));
  t.mock.method(ERPProject, "findOne", async () => project());
  t.mock.method(ERPProject, "findOneAndUpdate", async () => assert.fail("Unapproved payments accepted"));
  const res = response();
  await updateProjectRequirements({ erpUser: { _id: "client" }, params: { projectId: "project" }, body: {
    srsRevision: 3, approved: "yes", approvalName: "Client", functionalRequirements: [{ title: "Login" }],
  } }, res);
  assert.equal(res.code, 400); assert.match(res.body.message, /payment terms/);
});

test("client approval is bound to the payment terms actually reviewed", async (t) => {
  const current = project();
  t.mock.method(ERPClient, "findById", async () => ({ _id: "client" }));
  t.mock.method(ERPProject, "findOne", async () => current);
  t.mock.method(ERPProject, "findOneAndUpdate", async (filter, update) => {
    assert.equal(update.$set.requirements.paymentApproved, "yes");
    assert.ok(update.$set.requirements.paymentApprovedOn);
    assert.equal(update.$set.srsPaymentTerms, undefined);
    return { requirements: update.$set.requirements, srsRevision: 4 };
  });
  const req = { erpUser: { _id: "client" }, params: { projectId: "project" }, body: {
    srsRevision: 3, approved: "yes", approvalName: "Client", paymentApproved: "yes",
    functionalRequirements: [{ title: "Login" }], paymentTermsUpdatedAt: "2020-01-01T00:00:00.000Z",
  } };
  const stale = response(); await updateProjectRequirements(req, stale); assert.equal(stale.code, 409);
  req.body.paymentTermsUpdatedAt = current.srsPaymentTerms.updatedAt.toISOString();
  const fresh = response(); await updateProjectRequirements(req, fresh); assert.equal(fresh.code, 200);
});

test("concurrent edit prevents manager approval", async (t) => {
  t.mock.method(ERPProject, "findOne", async () => project());
  t.mock.method(ERPUser, "findById", async () => ({ name: "Manager" }));
  t.mock.method(ERPProject, "findOneAndUpdate", async () => null);
  const res = response(); await approveProjectSrs(request(), res);
  assert.equal(res.code, 409);
});

test("legacy projects match only missing or zero revision and unlocked state", () => {
  assert.deepEqual(editableSrsFilter({ _id: "legacy" }), {
    _id: "legacy", srsLockedAt: null,
    $or: [{ srsRevision: 0 }, { srsRevision: { $exists: false } }],
  });
});

for (const [name, handler] of [["save", updateProjectRequirements], ["delete attachment", deleteProjectDocument]]) {
  test(`client cannot ${name} after mutual agreement`, async (t) => {
    t.mock.method(ERPClient, "findById", async () => ({ _id: "client" }));
    t.mock.method(ERPProject, "findOne", async () => ({
      ...project(), srsLockedAt: new Date(), requirementDocuments: { id: () => ({}) },
    }));
    t.mock.method(ERPProject, "findOneAndUpdate", async () => assert.fail("Locked document was changed"));
    const res = response();
    await handler({ erpUser: { _id: "client" }, params: { projectId: "project", docId: "doc" }, body: {} }, res);
    assert.equal(res.code, 409);
  });
}
