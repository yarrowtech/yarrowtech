/* -------------------------------------------------------
   Server-to-server client for EFNBMMS's legal/policy API —
   the real Terms & Conditions / Privacy Policy content shown
   in the signup consent step. OAuth2 client-credentials: the
   client secret must never reach the browser, so this (and
   the token cache) lives entirely on the backend.
------------------------------------------------------- */

const getBaseUrl = () => {
  const base = String(process.env.EFNBMMS_POLICY_API_URL || "").trim();
  if (!base) throw new Error("EFNBMMS_POLICY_API_URL is not configured");
  return base.replace(/\/$/, "");
};

let cachedToken = null;
let cachedTokenExpiresAt = 0;

const fetchAccessToken = async () => {
  const clientId = String(process.env.EFNBMMS_POLICY_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.EFNBMMS_POLICY_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) {
    throw new Error("EFNBMMS_POLICY_CLIENT_ID / EFNBMMS_POLICY_CLIENT_SECRET are not configured");
  }

  const response = await fetch(`${getBaseUrl()}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.data?.access_token) {
    const error = new Error(data?.error || `EFNBMMS policy auth failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data.data;
};

// Caches the token in memory for its lifetime (minus a safety margin) so
// every signup-page load doesn't re-authenticate against the policy API.
const getAccessToken = async () => {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const { access_token: token, expires_in: expiresIn } = await fetchAccessToken();
  cachedToken = token;
  cachedTokenExpiresAt = now + Math.max(0, (Number(expiresIn) || 0) - 60) * 1000;
  return cachedToken;
};

const policyRequest = async (path, retrying = false) => {
  const token = await getAccessToken();

  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !retrying) {
    // Token may have been revoked/expired early server-side — refresh once.
    cachedToken = null;
    return policyRequest(path, true);
  }

  if (!response.ok || data?.success === false) {
    const error = new Error(data?.error || `EFNBMMS policy request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data.data;
};

// The API's own `type` query param doesn't actually filter server-side, so
// we fetch the full list and match by `type` here instead.
const TYPE_MATCHERS = {
  privacy: (type) => type === "PRIVACY_POLICY",
  terms: (type) => String(type || "").includes("TERM"),
};

export const getEfnbmmsPolicyDocument = async (docType) => {
  const matches = TYPE_MATCHERS[docType];
  if (!matches) throw new Error(`Unknown policy docType: ${docType}`);

  const { items = [] } = await policyRequest("/policies");
  const policy = items.find((item) => matches(item.type) && item.status === "PUBLISHED");

  if (!policy?.currentVersion?.content) {
    return null;
  }

  return {
    title: policy.title,
    updatedAt: policy.currentVersion.publishedAt
      ? `Last updated ${new Date(policy.currentVersion.publishedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      : "",
    content: String(policy.currentVersion.content)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  };
};
