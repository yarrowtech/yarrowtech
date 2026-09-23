import rateLimit from "express-rate-limit";

// Relies on app.set("trust proxy", 1) in server.js so req.ip is the real client IP.
const limiter = (windowMinutes, limit, message, extra = {}) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message },
    ...extra,
  });

/* Whole API — generous cap that only stops floods/scrapers. */
export const apiLimiter = limiter(
  15,
  1000,
  "Too many requests. Please slow down and try again shortly."
);

/* Login endpoints — only failed attempts count, so real users aren't locked out. */
export const loginLimiter = limiter(
  15,
  10,
  "Too many failed login attempts. Please try again in 15 minutes.",
  { skipSuccessfulRequests: true }
);

/* Forgot / reset password — stops email bombing and token guessing. */
export const passwordResetLimiter = limiter(
  60,
  5,
  "Too many password reset requests. Please try again in an hour."
);

/* Public forms (contact, demo, career, register, signup) — stops spam. */
export const formLimiter = limiter(
  60,
  10,
  "Too many submissions. Please try again later."
);

/* Payment order/verify — stops abuse of the payment gateway. */
export const paymentLimiter = limiter(
  15,
  20,
  "Too many payment requests. Please try again shortly."
);
