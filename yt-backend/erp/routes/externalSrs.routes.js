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

router.get("/srs", listLockedSrs);
router.get("/srs/:key", getLockedSrs);
router.put("/srs/:key", updateLockedSrs);
router.post("/srs/:key/resend", resendLockedSrsWebhook);

export default router;
