import { useEffect, useMemo, useState } from "react";
import { Eye, Gauge, TrendingUp, RefreshCw, MousePointerClick, MapPin, X, Search, Users, Percent } from "lucide-react";
import { getProductAnalytics } from "../../services/adminService";
import "../../styles/ProductAnalytics.css";

const shortTitle = (title) => title?.split(/\s+-\s+/)[0] || 'No data';

const prettyLocation = (value) => {
    if (!value || value === "Unknown") return "Unknown";
    return String(value).split("/").pop().replace(/_/g, " ") || String(value);
};

const formatTime = (ms) => {
    if (!Number.isFinite(ms) || ms <= 0) return "0s";
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
};

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const slugOf = (path) => String(path || "").replace(/^\/products\//, "").replace(/\/$/, "");

const RANGES = [
    ["today", "Today", 0],
    ["7d", "7 days", 6],
    ["30d", "30 days", 29],
    ["all", "All time", null],
    ["custom", "Custom", null],
];

const isoDay = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const rangeParams = (range, custom) => {
    if (range === "custom") {
        return { ...(custom.from && { from: custom.from }), ...(custom.to && { to: custom.to }) };
    }
    const days = RANGES.find(([id]) => id === range)?.[2];
    if (days === null || days === undefined) return {};
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { from: isoDay(start), to: isoDay(new Date()) };
};

const TABS = [
    ["products", "Products"],
    ["clicks", "Recent demo clicks"],
    ["visits", "Recent visits"],
];

export default function ProductAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [tab, setTab] = useState("products");
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [range, setRange] = useState("all");
    const [custom, setCustom] = useState({ from: "", to: "" });

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getProductAnalytics(rangeParams(range, custom));
                if (active) setAnalytics(data);
            } catch (error) {
                if (active) setError('Unable to load product analytics. Please try again.');
                console.error("Product analytics load error:", error);
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, [refresh, range, custom]);

    useEffect(() => {
        if (!selected) return undefined;
        const onKey = (event) => event.key === "Escape" && setSelected(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selected]);

    const pageRows = analytics?.pages || [];
    const recentVisits = analytics?.recentVisits || [];
    const summary = analytics?.summary || {};
    const explore = analytics?.explore || {};
    const exploreRecent = explore.recent || [];

    // One row per product: page traffic joined with See Demo clicks by slug.
    const products = useMemo(() => {
        const map = new Map();
        (analytics?.pages || []).forEach((page) => {
            const slug = slugOf(page.page);
            map.set(slug, { slug, title: page.title, views: page.views, avgStayMs: page.avgStayMs, share: page.percentOfTraffic, clicks: 0, unique: 0, locations: [], referrers: [], recentClicks: [] });
        });
        (analytics?.explore?.products || []).forEach((item) => {
            const row = map.get(item.productSlug) || { slug: item.productSlug, title: item.productTitle, views: 0, avgStayMs: 0, share: 0 };
            map.set(item.productSlug, { ...row, clicks: item.totalClicks, unique: item.uniqueViews, locations: item.locations || [], referrers: item.referrers || [], recentClicks: item.recentClicks || [] });
        });
        return [...map.values()]
            .map((row) => ({ ...row, rate: row.views ? Math.round((row.clicks / row.views) * 100) : 0 }))
            .sort((a, b) => b.views - a.views || b.clicks - a.clicks);
    }, [analytics]);

    const filtered = products.filter((row) => `${row.title} ${row.slug}`.toLowerCase().includes(query.trim().toLowerCase()));
    const topPage = pageRows[0] || null;
    const modalVisits = selected ? recentVisits.filter((visit) => slugOf(visit.path) === selected.slug).slice(0, 5) : [];

    if (loading && !analytics) {
        return (
            <div className="pa-page">
                <div className="pa-loading" role="status">Loading product analytics…</div>
            </div>
        );
    }

    const metrics = [
        { label: "Page views", value: summary.totalViews ?? 0, note: "All product pages", icon: Eye, tone: "blue" },
        { label: "See Demo clicks", value: explore.totalClicks ?? 0, note: `${explore.uniqueVisitors ?? 0} unique visitors`, icon: MousePointerClick, tone: "purple" },
        { label: "Avg. stay", value: formatTime(summary.avgStayMs ?? 0), note: "Per visit", icon: TrendingUp, tone: "green" },
        { label: "Top product", value: shortTitle(topPage?.title), note: `${topPage?.views ?? 0} views`, icon: Gauge, tone: "amber" },
    ];

    return (
        <div className="pa-page">
            <header className="pa-header">
                <div>
                    <p className="pa-badge">Product Analytics</p>
                    <h1>Product usage overview</h1>
                    <p className="pa-subtitle">Page traffic and See Demo interest for every product. Select a product for details.</p>
                </div>
                <button className="pa-refresh" disabled={loading} onClick={() => setRefresh((value) => value + 1)}><RefreshCw size={16} />{loading ? "Refreshing…" : "Refresh data"}</button>
            </header>

            <div className="pa2-range">
                <div className="pa2-tabs" role="group" aria-label="Date range">
                    {RANGES.map(([id, label]) => (
                        <button key={id} className={range === id ? "is-active" : ""} onClick={() => setRange(id)}>{label}</button>
                    ))}
                </div>
                {range === "custom" && (
                    <div className="pa2-dates">
                        <input type="date" value={custom.from} max={custom.to || undefined} onChange={(event) => setCustom((value) => ({ ...value, from: event.target.value }))} aria-label="From date" />
                        <span>to</span>
                        <input type="date" value={custom.to} min={custom.from || undefined} onChange={(event) => setCustom((value) => ({ ...value, to: event.target.value }))} aria-label="To date" />
                    </div>
                )}
            </div>

            {error && <div className="pa-error" role="alert">{error}</div>}
            {(!error || analytics) && <>
                <section className="pa-metrics">
                    {metrics.map(({ label, value, note, icon: Icon, tone }) => (
                        <div className="pa-metric-card" key={label}>
                            <div className={`pa-icon pa-icon--${tone}`}><Icon size={18} /></div>
                            <div>
                                <span>{label}</span>
                                <strong>{value}</strong>
                                <small>{note}</small>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="pa-panel pa-panel--full">
                    <div className="pa2-toolbar">
                        <div className="pa2-tabs" role="tablist">
                            {TABS.map(([id, label]) => (
                                <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>{label}</button>
                            ))}
                        </div>
                        {tab === "products" && (
                            <label className="pa2-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product" aria-label="Search product" /></label>
                        )}
                    </div>

                    {tab === "products" && (
                        <div className="pa-table-wrap">
                            <table className="pa-table pa2-table">
                                <thead>
                                    <tr><th>Product</th><th>Views</th><th>Avg stay</th><th>Demo clicks</th><th>Unique</th><th>Click rate</th><th>Top location</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.length ? filtered.map((row) => (
                                        <tr key={row.slug} className="pa2-row" tabIndex={0} onClick={() => setSelected(row)} onKeyDown={(event) => event.key === "Enter" && setSelected(row)}>
                                            <td><div className="pa-page-cell"><span className="pa-page-link">{shortTitle(row.title)}</span><small>/products/{row.slug}</small></div></td>
                                            <td>{row.views}</td>
                                            <td>{formatTime(row.avgStayMs)}</td>
                                            <td>{row.clicks}</td>
                                            <td>{row.unique}</td>
                                            <td><span className="pa2-rate">{row.rate}%</span></td>
                                            <td>{row.locations[0] ? <span className="pa-location-chip"><MapPin size={12} />{prettyLocation(row.locations[0].location)}</span> : "—"}</td>
                                        </tr>
                                    )) : <tr><td colSpan="7" className="pa-empty">No products match.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === "clicks" && (
                        <div className="pa-table-wrap">
                            <table className="pa-table pa-table--compact">
                                <thead><tr><th>Product</th><th>Location</th><th>Clicked at</th></tr></thead>
                                <tbody>
                                    {exploreRecent.length ? exploreRecent.map((click) => (
                                        <tr key={click._id || `${click.productSlug}-${click.createdAt}`}>
                                            <td>{shortTitle(click.productTitle)}</td>
                                            <td>{prettyLocation(click.location)}</td>
                                            <td>{formatDate(click.createdAt)}</td>
                                        </tr>
                                    )) : <tr><td colSpan="3" className="pa-empty">No See Demo clicks recorded yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === "visits" && (
                        <div className="pa-table-wrap">
                            <table className="pa-table pa-table--compact">
                                <thead><tr><th>Page</th><th>Stay time</th><th>Source</th><th>Seen at</th></tr></thead>
                                <tbody>
                                    {recentVisits.length ? recentVisits.map((visit) => (
                                        <tr key={visit._id || `${visit.path}-${visit.createdAt}`}>
                                            <td>{visit.path}</td>
                                            <td>{formatTime(visit.durationMs)}</td>
                                            <td>{visit.referrer}</td>
                                            <td>{formatDate(visit.createdAt)}</td>
                                        </tr>
                                    )) : <tr><td colSpan="4" className="pa-empty">No recent page visits available.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </>}

            {selected && (
                <div className="pa2-overlay" onClick={() => setSelected(null)}>
                    <div className="pa2-modal" role="dialog" aria-modal="true" aria-label={selected.title} onClick={(event) => event.stopPropagation()}>
                        <div className="pa2-modal-head">
                            <div><h2>{shortTitle(selected.title)}</h2><small>{selected.title} · /products/{selected.slug}</small></div>
                            <button className="pa2-close" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button>
                        </div>
                        <div className="pa2-stats">
                            <div><span>Page views</span><strong>{selected.views}</strong></div>
                            <div><span>Demo clicks</span><strong>{selected.clicks}</strong></div>
                            <div><span>Unique visitors</span><strong>{selected.unique}</strong></div>
                            <div><span>Click rate</span><strong>{selected.rate}%</strong></div>
                            <div><span>Avg. stay</span><strong>{formatTime(selected.avgStayMs)}</strong></div>
                            <div><span>Traffic share</span><strong>{selected.share}%</strong></div>
                        </div>
                        <div className="pa2-cols">
                            <div>
                                <h3>Locations</h3>
                                {selected.locations.length ? selected.locations.slice(0, 6).map((loc) => (
                                    <div className="pa2-line" key={loc.location}><span><MapPin size={12} /> {prettyLocation(loc.location)}</span><b>{loc.count}</b></div>
                                )) : <p className="pa2-none">No clicks yet.</p>}
                                <h3>Traffic sources</h3>
                                {selected.referrers.length ? selected.referrers.map((ref) => (
                                    <div className="pa2-line" key={ref.referrer}><span title={ref.referrer}>{ref.referrer.replace(/^https?:\/\//, "").slice(0, 34)}</span><b>{ref.count}</b></div>
                                )) : <p className="pa2-none">No data yet.</p>}
                            </div>
                            <div>
                                <h3>Latest demo clicks</h3>
                                {selected.recentClicks.length ? selected.recentClicks.slice(0, 6).map((click, index) => (
                                    <div className="pa2-line" key={index}><span>{prettyLocation(click.location)}</span><small>{formatDate(click.createdAt)}</small></div>
                                )) : <p className="pa2-none">No clicks yet.</p>}
                                <h3>Latest page visits</h3>
                                {modalVisits.length ? modalVisits.map((visit) => (
                                    <div className="pa2-line" key={visit._id || visit.createdAt}><span>{formatTime(visit.durationMs)} stay</span><small>{formatDate(visit.createdAt)}</small></div>
                                )) : <p className="pa2-none">No recent visits.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
