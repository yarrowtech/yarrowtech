const base = String(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const endpoint = `${base.endsWith('/api') ? base : `${base}/api`}/erp/admin/project-analytics/track`;
export const isPublicPath = path => !/^\/(admin|manager|techlead|client|product-user)(\/|$)/.test(path);
const uid = () => crypto.randomUUID();
let memoryVisitor;
let memorySession;

function identity() {
  memoryVisitor ||= uid();
  memorySession ||= uid();
  try {
    const visitorId = localStorage.getItem('yt_analytics_visitor') || memoryVisitor;
    localStorage.setItem('yt_analytics_visitor', visitorId);
    let session = JSON.parse(sessionStorage.getItem('yt_analytics_session') || 'null');
    if (!session || Date.now() - session.last > 30 * 60 * 1000) {
      let source = new URLSearchParams(location.search).get('utm_source');
      if (!source && document.referrer) {
        const ref = new URL(document.referrer);
        if (ref.origin !== location.origin) source = ref.hostname;
      }
      session = { id: uid(), source: source || 'Direct' };
    }
    session.last = Date.now();
    sessionStorage.setItem('yt_analytics_session', JSON.stringify(session));
    return { visitorId, sessionId: session.id, source: session.source };
  } catch { return { visitorId: memoryVisitor, sessionId: memorySession, source: 'Direct' }; }
}

export function trackProjectEvent(type, details = {}) {
  try {
    if (navigator.webdriver || !isPublicPath(location.pathname)) return;
    const payload = JSON.stringify({ ...identity(), eventId: uid(), type, path: location.pathname, ...details });
    // keepalive allows successful login redirects and outbound links to finish sending.
    void fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
  } catch { /* Analytics must never interrupt the visitor's action. */ }
}
