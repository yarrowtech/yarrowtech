import ERPProject from "../models/Project.js";
import logger from "../../utils/logger.js";
import { buildSrsPayload, signBody } from "./srsExport.js";

/* Push the locked SRS to the other project's admin. Never throws: a webhook
   failure must not undo the lock. The status is stored on the project so it can
   be re-sent or fetched later through the pull API. */
export const sendSrsLockedWebhook = async (project) => {
  const url = process.env.SRS_WEBHOOK_URL;
  if (!url) return;

  const body = JSON.stringify({
    event: "srs.locked",
    sentAt: new Date().toISOString(),
    data: buildSrsPayload(project),
  });
  const headers = { "Content-Type": "application/json", "User-Agent": "yarrowtech-erp-webhook" };
  if (process.env.SRS_WEBHOOK_SECRET) {
    headers["X-Signature"] = `sha256=${signBody(body, process.env.SRS_WEBHOOK_SECRET)}`;
  }
  if (process.env.SRS_EXTERNAL_API_KEY) headers["X-Api-Key"] = process.env.SRS_EXTERNAL_API_KEY;

  let status = "sent";
  let error = "";
  try {
    const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      status = "failed";
      error = `HTTP ${res.status}`;
    }
  } catch (err) {
    status = "failed";
    error = String(err?.message || err).slice(0, 300);
  }

  if (status === "failed") logger.error({ projectId: project.projectId, error }, "SRS webhook failed");
  try {
    await ERPProject.updateOne(
      { _id: project._id },
      { $set: { srsWebhookStatus: status, srsWebhookAt: new Date(), srsWebhookError: error } }
    );
  } catch (err) {
    logger.error({ err }, "Failed to store SRS webhook status");
  }
};
