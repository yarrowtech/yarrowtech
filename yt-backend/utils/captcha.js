import crypto from "crypto";

/* Captcha for the public EFNBMMS signup forms.

   Providers (chosen automatically):
     turnstile  a real Cloudflare Turnstile secret is set in TURNSTILE_SECRET_KEY
     builtin    default: our own image captcha, no third-party account needed
     off        CAPTCHA_MODE=off

   Both providers end the same way: a signed, short-lived "captcha pass" that the
   order/signup routes require. */

const PASS_TTL_MS = 30 * 60 * 1000;
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L lookalikes

const secret = () =>
  process.env.CAPTCHA_SECRET || process.env.JWT_SECRET || process.env.TURNSTILE_SECRET_KEY || "";

const hmac = (value) => crypto.createHmac("sha256", secret()).update(value).digest("hex");

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export const captchaProvider = () => {
  if (String(process.env.CAPTCHA_MODE || "").toLowerCase() === "off") return "off";
  const ts = process.env.TURNSTILE_SECRET_KEY || "";
  // Cloudflare's published dummy keys start with 1x/2x/3x0000 and must not count as real.
  if (ts && !/^[123]x0{10,}/.test(ts)) return "turnstile";
  return "builtin";
};

export const isCaptchaEnabled = () => captchaProvider() !== "off" && Boolean(secret());

/* ───────── Cloudflare Turnstile ───────── */
export const verifyTurnstileToken = async (token, ip) => {
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: String(token),
        ...(ip ? { remoteip: ip } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => ({}));
    return data.success === true;
  } catch {
    return false;
  }
};

/* ───────── Built-in image captcha ───────── */
const answerHash = (code, nonce, exp) => hmac(`answer|${String(code).toUpperCase()}|${nonce}|${exp}`);

const usedChallenges = new Map(); // id -> expiry, single use
const markUsed = (id, exp) => {
  const now = Date.now();
  for (const [key, expiry] of usedChallenges) if (expiry < now) usedChallenges.delete(key);
  usedChallenges.set(id, exp);
};

const rand = (min, max) => min + (crypto.randomInt(0, 1000) / 1000) * (max - min);

const renderSvg = (code) => {
  const width = 230;
  const height = 76;
  const colors = ["#1f2937", "#7c2d12", "#1e3a8a", "#14532d", "#581c87"];
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`];
  parts.push(`<rect width="100%" height="100%" fill="#fbf6ee"/>`);

  // light background noise behind the letters (kept faint so the code stays readable)
  for (let i = 0; i < 40; i += 1) {
    parts.push(`<circle cx="${rand(0, width).toFixed(0)}" cy="${rand(0, height).toFixed(0)}" r="${rand(0.6, 1.5).toFixed(1)}" fill="#9ca3af" fill-opacity="0.45"/>`);
  }
  for (let i = 0; i < 3; i += 1) {
    parts.push(
      `<path d="M${rand(0, 30).toFixed(0)} ${rand(10, height - 10).toFixed(0)} Q${rand(60, 170).toFixed(0)} ${rand(0, height).toFixed(0)} ${rand(width - 30, width).toFixed(0)} ${rand(10, height - 10).toFixed(0)}" stroke="${colors[i % colors.length]}" stroke-opacity="0.3" stroke-width="1.4" fill="none"/>`
    );
  }

  // evenly spaced letters with a gentle tilt, so they never overlap
  const slot = (width - 36) / code.length;
  [...code].forEach((char, i) => {
    const x = 20 + i * slot + slot / 2;
    const y = 49 + rand(-4, 4);
    const rotate = rand(-13, 13).toFixed(0);
    const size = rand(34, 40).toFixed(0);
    parts.push(
      `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" text-anchor="middle" font-family="Verdana,Arial,sans-serif" font-weight="700" font-size="${size}" fill="${colors[crypto.randomInt(0, colors.length)]}" transform="rotate(${rotate} ${x.toFixed(0)} ${y.toFixed(0)})">${char}</text>`
    );
  });

  parts.push(`</svg>`);
  return parts.join("");
};

export const createChallenge = () => {
  const code = Array.from(crypto.randomBytes(5), (b) => CHARS[b % CHARS.length]).join("");
  const exp = Date.now() + CHALLENGE_TTL_MS;
  const nonce = crypto.randomBytes(8).toString("hex");
  const payload = `${exp}.${nonce}.${answerHash(code, nonce, exp)}`;
  const id = `${payload}.${hmac(`challenge|${payload}`)}`;
  return { id, image: `data:image/svg+xml;base64,${Buffer.from(renderSvg(code)).toString("base64")}` };
};

export const verifyChallenge = (id, answer) => {
  const parts = String(id || "").split(".");
  if (parts.length !== 4) return false;
  const [exp, nonce, hash, signature] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  if (!safeEqual(signature, hmac(`challenge|${exp}.${nonce}.${hash}`))) return false;
  if (usedChallenges.has(id)) return false;

  markUsed(id, Number(exp)); // every attempt consumes the challenge
  const given = String(answer || "").trim();
  if (given.length < 4 || given.length > 8) return false;
  return safeEqual(hash, answerHash(given, nonce, exp));
};

/* ───────── Pass ───────── */
export const issueCaptchaPass = () => {
  const expires = String(Date.now() + PASS_TTL_MS);
  return `${expires}.${hmac(`pass|${expires}`)}`;
};

export const isValidCaptchaPass = (pass) => {
  const [expires, signature] = String(pass || "").split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  return safeEqual(signature, hmac(`pass|${expires}`));
};
