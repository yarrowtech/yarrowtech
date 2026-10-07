/* Public tracking for the "Explore This Product" button clicks.
   Reuses the same visitor identity as project analytics so unique
   counts stay consistent across the site. */

const base = String(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const endpoint = `${base.endsWith("/api") ? base : `${base}/api`}/erp/admin/product-analytics/explore-click`;

const uid = () =>
    globalThis.crypto?.randomUUID
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

function visitorId() {
    try {
        let id = localStorage.getItem("yt_analytics_visitor");
        if (!id) {
            id = uid();
            localStorage.setItem("yt_analytics_visitor", id);
        }
        return id;
    } catch {
        return uid();
    }
}

// The browser timezone (e.g. "Asia/Kolkata") is a privacy-friendly location signal.
function locationLabel() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
    } catch {
        return "Unknown";
    }
}

export function trackProductExploreClick(product) {
    try {
        const payload = JSON.stringify({
            eventId: uid(),
            productSlug: product?.slug || "unknown",
            productTitle: product?.name || product?.shortName || product?.slug || "Product",
            targetUrl: product?.productUrl || "",
            visitorId: visitorId(),
            location: locationLabel(),
            referrer: document.referrer || "Direct",
        });

        // sendBeacon keeps working while the browser follows the product link.
        if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
            return;
        }

        void fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
        }).catch(() => {});
    } catch {
        /* Analytics must never interrupt the visitor's action. */
    }
}
