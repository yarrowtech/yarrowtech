import { isCaptchaEnabled, isValidCaptchaPass } from "../utils/captcha.js";

/* Blocks public signup/order calls that did not first pass the captcha.
   No-op when captcha is not configured. The pass is removed from the body so it is
   never forwarded to the EFNBMMS server. */
export default function requireCaptchaPass(req, res, next) {
  if (!isCaptchaEnabled()) return next();

  const pass = req.body?.captchaPass;
  if (req.body) delete req.body.captchaPass;

  if (!isValidCaptchaPass(pass)) {
    return res.status(400).json({
      success: false,
      code: "CAPTCHA_REQUIRED",
      message: "Please complete the security check and try again.",
    });
  }
  next();
}
