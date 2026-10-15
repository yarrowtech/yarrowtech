import express from "express";
import externalApiKey, { externalFailureLimiter } from "../../middleware/externalApiKey.js";
import {
  getLockedSrs,
  listLockedSrs,
  resendLockedSrsWebhook,
  updateLockedSrs,
} from "../controllers/externalSrs.controller.js";

const router = express.Router();

// Server-to-server only: every route needs the shared API key.
router.use(externalFailureLimiter, externalApiKey);

// Authenticated index: tells the connected system what this API offers.
router.get("/", (req, res) =>
  res.json({
    success: true,
    name: "YarrowTech SRS External API",
    version: 1,
    auth: {
      headers: ["x-api-key", "x-client-id", "x-timestamp", "x-signature"],
      signature: "hex HMAC-SHA256 of `${timestamp}.${METHOD}.${path}.${sha256(rawBody)}` with the signing secret",
      timestampTolerance: "5 minutes",
    },
    endpoints: [
      { method: "GET", path: "/api/erp/external/srs", purpose: "List locked SRS documents (limit, skip)" },
      { method: "GET", path: "/api/erp/external/srs/:key", purpose: "Full locked SRS (key = project _id or YT-26-0001)" },
      { method: "PUT", path: "/api/erp/external/srs/:key", purpose: "Edit a locked SRS; body needs the current revision" },
      { method: "POST", path: "/api/erp/external/srs/:key/resend", purpose: "Push the srs.locked webhook again" },
    ],
    webhook: { event: "srs.locked", headers: ["X-Signature: sha256=<hex>", "X-Api-Key"] },
  })
);

router.get("/srs", listLockedSrs);
router.get("/srs/:key", getLockedSrs);
router.put("/srs/:key", updateLockedSrs);
router.post("/srs/:key/resend", resendLockedSrsWebhook);

export default router;
