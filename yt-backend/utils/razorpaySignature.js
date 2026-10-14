import crypto from "crypto";

/* Verifies a Razorpay Checkout payment signature on OUR side:
   HMAC-SHA256(order_id + "|" + payment_id, key_secret) must equal razorpay_signature.

   Enabled when EFNBMMS_RAZORPAY_KEY_SECRET is set (the Razorpay account's key secret
   used by the EFNBMMS orders). When it is not set the check is skipped and the
   EFNBMMS server remains the only verifier. */

export const isRazorpayCheckEnabled = () => Boolean(process.env.EFNBMMS_RAZORPAY_KEY_SECRET);

export const isValidRazorpaySignature = ({
  razorpay_order_id: orderId,
  razorpay_payment_id: paymentId,
  razorpay_signature: signature,
}) => {
  const secret = process.env.EFNBMMS_RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(String(signature));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
