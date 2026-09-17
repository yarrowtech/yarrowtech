/* -------------------------------------------------------
   Thin server-to-server client for the EFNBMMS product API.
   Used so a browser on this website never talks to the
   EFNBMMS backend directly (no CORS exposure, no API keys
   in frontend code).
------------------------------------------------------- */

const getBaseUrl = () => {
  const base = String(process.env.EFNBMMS_API_BASE_URL || "").trim();
  if (!base) {
    throw new Error("EFNBMMS_API_BASE_URL is not configured");
  }
  return base.replace(/\/$/, "");
};

const request = async (path, options = {}) => {
  const url = `${getBaseUrl()}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || `EFNBMMS request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const getEfnbmmsPlans = () => request("/api/subscriptions/plans");

export const createEfnbmmsSignupOrder = (payload) =>
  request("/api/subscriptions/admin-signup/order", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const verifyEfnbmmsSignupPayment = (payload) =>
  request("/api/subscriptions/admin-signup/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });

/* -------------------------------------------------------
   VENDOR SIDE
   Unlike admin signup, EFNBMMS creates the vendor account
   for free first, then requires a logged-in vendor (JWT)
   to pick and pay for a subscription plan. So this client
   also exposes a login call and lets callers forward the
   vendor's bearer token to the plan order/verify routes.
------------------------------------------------------- */

export const getEfnbmmsVendorPlans = () => request("/api/vendor-subscriptions/plans");

export const createEfnbmmsVendorSignup = (payload) =>
  request("/api/vendor/self-signup/global", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginEfnbmmsVendor = (payload) =>
  request("/api/vendor/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const createEfnbmmsVendorSubscriptionOrder = (payload, vendorToken) =>
  request("/api/vendor-subscriptions/me/order", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${vendorToken}` },
  });

export const verifyEfnbmmsVendorSubscriptionPayment = (payload, vendorToken) =>
  request("/api/vendor-subscriptions/me/verify", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${vendorToken}` },
  });
