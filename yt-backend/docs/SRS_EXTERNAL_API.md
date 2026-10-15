# YarrowTech SRS External API

Private server-to-server API. It gives the connected admin system each project's
agreed (locked) Software Requirements Specification and lets that system change a
locked SRS. Nobody inside the YarrowTech ERP can edit a locked SRS.

**Base URL:** `https://api.yarrowtech.in`
**Resource prefix:** `/api/erp/external`

> If a request to `/api/erp/external/srs` returns `404 {"message":"Route not found"}`,
> the YarrowTech backend with this API has not been deployed yet. A deployed server
> answers `401 Unauthorized` (or `503 External SRS API is not configured`) instead.

## Credentials (sent to you privately)

| Name | Use |
|---|---|
| `SRS_API_KEY` | sent as header `x-api-key` |
| `SRS_CLIENT_ID` | sent as header `x-client-id` |
| `SRS_SIGNING_SECRET` | signs each request, never sent |
| `SRS_WEBHOOK_SECRET` | verifies the webhooks YarrowTech sends you |

## Authentication: two gates, four headers on every request

| Header | Value |
|---|---|
| `x-api-key` | `SRS_API_KEY` |
| `x-client-id` | `SRS_CLIENT_ID` |
| `x-timestamp` | current unix time in seconds (must be within 5 minutes) |
| `x-signature` | hex HMAC-SHA256 of `{timestamp}.{METHOD}.{path}.{sha256(body)}` using `SRS_SIGNING_SECRET` |

- `METHOD` is upper case (`GET`, `PUT`, `POST`).
- `path` is the URL path **without** the query string, e.g. `/api/erp/external/srs/YT-26-0002`.
- `body` is the exact raw JSON string you send. Use an empty string for `GET`.
- `sha256(body)` is lower-case hex.
- Any wrong header returns `401 {"message":"Unauthorized"}`. The reply never says which
  check failed. 10 failed attempts from one IP in 15 minutes blocks that IP for the window.

### Signing example (Node 18+)

```js
import crypto from "crypto";

async function srs(method, path, body) {
  const raw = body ? JSON.stringify(body) : "";
  const ts = Math.floor(Date.now() / 1000).toString();
  const bodyHash = crypto.createHash("sha256").update(raw).digest("hex");
  const signature = crypto
    .createHmac("sha256", process.env.SRS_SIGNING_SECRET)
    .update(`${ts}.${method}.${path}.${bodyHash}`)
    .digest("hex");

  const res = await fetch(process.env.SRS_API_BASE_URL + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.SRS_API_KEY,
      "x-client-id": process.env.SRS_CLIENT_ID,
      "x-timestamp": ts,
      "x-signature": signature,
    },
    body: raw || undefined,
  });
  return { status: res.status, data: await res.json() };
}

await srs("GET", "/api/erp/external/srs");
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/erp/external` | This index (authenticated) |
| GET | `/api/erp/external/srs?limit=50&skip=0` | List locked SRS documents |
| GET | `/api/erp/external/srs/:key` | Full locked SRS. `:key` is the project `_id` or its display id such as `YT-26-0002` |
| PUT | `/api/erp/external/srs/:key` | Edit a locked SRS |
| POST | `/api/erp/external/srs/:key/resend` | Ask YarrowTech to push the webhook again |

### List response
```json
{ "success": true, "total": 1,
  "items": [{ "id": "…", "projectId": "YT-26-0002", "name": "…", "clientName": "…",
              "clientEmail": "…", "lockedAt": "…", "revision": 3, "externalUpdatedAt": null }] }
```

### Get response
```json
{ "success": true, "srs": {
  "id": "…", "projectId": "YT-26-0002", "name": "…", "status": "ongoing",
  "revision": 3, "locked": true, "lockedAt": "…",
  "client": { "name": "", "email": "", "phone": "", "company": "" },
  "managerEmail": "",
  "agreement": { "clientName": "", "clientApprovedOn": "", "managerName": "", "managerApprovedAt": "" },
  "requirements": { "purpose": "", "overview": "", "goals": "", "pages": [], "features": [], "…": "…" },
  "requirementsUpdatedAt": "…",
  "paymentTerms": { "total": 50000, "currency": "INR", "notes": "",
                    "breakdown": [{ "id": "…", "label": "Advance", "amount": 25000, "due": "On approval", "dueDate": "", "description": "" }] },
  "documents": [{ "id": "…", "name": "", "url": "", "size": 0, "uploadedAt": "…" }],
  "externalUpdatedAt": null } }
```

### Update (PUT) request
```json
{
  "revision": 3,
  "requirements": { "goals": "new text", "technology": "React" },
  "functionalRequirements": [{ "title": "Login", "description": "…", "priority": "Must have" }],
  "paymentTerms": { "total": 50000, "notes": "",
    "breakdown": [
      { "label": "Advance", "amount": 25000, "due": "On approval" },
      { "label": "Final", "amount": 25000, "due": "On delivery" } ] }
}
```
- `revision` must equal the current revision, otherwise `409` with the current revision.
- Every successful edit increases the revision by 1.
- All other fields are optional. Send only what changes.
- Instalment amounts must add up exactly to `total`, otherwise `400`.
- The SRS stays locked after your edit.

### Status codes
`200` ok · `400` invalid body · `401` unauthorized · `404` project not found ·
`409` not locked yet / revision conflict · `503` API not configured on the server.

## Webhook (YarrowTech → you), sent when an SRS is locked

`POST {your webhook URL}` with headers `Content-Type: application/json`,
`X-Signature: sha256=<hex>`, `X-Api-Key: <SRS_API_KEY>`.

```json
{ "event": "srs.locked", "sentAt": "2026-10-15T10:00:00.000Z", "data": { "...same object as GET srs..." } }
```

Verify before trusting it:
```js
const expected = "sha256=" + crypto.createHmac("sha256", SRS_WEBHOOK_SECRET).update(rawBody).digest("hex");
// compare with the X-Signature header using crypto.timingSafeEqual
```
Reply with any `2xx`. Anything else is stored as failed and can be re-sent with
`POST /api/erp/external/srs/:key/resend`.
