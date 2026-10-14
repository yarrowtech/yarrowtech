import crypto from "crypto";
import rateLimit from "express-rate-limit";

/* Two-gate protection for the other project's admin system.

   Gate 1  API key        header  x-api-key         (SRS_EXTERNAL_API_KEY)
   Gate 2  Signed request headers x-client-id       (SRS_EXTERNAL_CLIENT_ID)
                                  x-timestamp       (unix seconds, +/- 5 minutes)
                                  x-signature       hex HMAC-SHA256 with SRS_EXTERNAL_SIGNING_SECRET
           over the string       `${timestamp}.${METHOD}.${path}.${sha256(rawBody)}`
           The signing secret is never sent, so a leaked or sniffed API key alone is useless.
   Gate 3  Optional IP allow-list (SRS_EXTERNAL_ALLOWED_IPS, comma separated)

   Every failure returns the same generic 401 so a caller cannot tell which gate failed. */

const MAX_SKEW_SECONDS = 300;
const UNAUTHORIZED = { message: "Unauthorized" };

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const normalizeIp = (ip = "") => String(ip).replace(/^::ffff:/, "").trim();

export const signRequest = ({ secret, timestamp, method, path, rawBody = "" }) => {
  const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${String(method).toUpperCase()}.${path}.${bodyHash}`)
    .digest("hex");
};

/* Failed attempts only: 10 per 15 minutes per IP, then the IP is blocked for the window. */
export const externalFailureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many failed attempts. Try again later." },
});

export default function externalApiKey(req, res, next) {
  const apiKey = process.env.SRS_EXTERNAL_API_KEY;
  const signingSecret = process.env.SRS_EXTERNAL_SIGNING_SECRET;
  const clientId = process.env.SRS_EXTERNAL_CLIENT_ID;

  if (!apiKey || apiKey.length < 24 || !signingSecret || signingSecret.length < 32 || !clientId) {
    return res.status(503).json({ message: "External SRS API is not configured" });
  }

  // Gate 3 (optional): caller address
  const allowed = String(process.env.SRS_EXTERNAL_ALLOWED_IPS || "")
    .split(",")
    .map((ip) => normalizeIp(ip))
    .filter(Boolean);
  if (allowed.length && !allowed.includes(normalizeIp(req.ip))) {
    return res.status(401).json(UNAUTHORIZED);
  }

  // Gate 1: API key
  const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const providedKey = String(req.headers["x-api-key"] || bearer || "");
  const keyOk = safeEqual(providedKey, apiKey);

  // Gate 2: project identity + signature
  const timestamp = String(req.headers["x-timestamp"] || "");
  const signature = String(req.headers["x-signature"] || "");
  const providedClient = String(req.headers["x-client-id"] || "");
  const fresh = /^\d{10}$/.test(timestamp) && Math.abs(Date.now() / 1000 - Number(timestamp)) <= MAX_SKEW_SECONDS;
  const expected = signRequest({
    secret: signingSecret,
    timestamp,
    method: req.method,
    path: req.originalUrl.split("?")[0],
    rawBody: req.rawBody ? req.rawBody.toString("utf8") : "",
  });
  const sigOk = fresh && safeEqual(signature, expected);
  const clientOk = safeEqual(providedClient, clientId);

  if (!(keyOk && sigOk && clientOk)) {
    return res.status(401).json(UNAUTHORIZED);
  }
  next();
}
