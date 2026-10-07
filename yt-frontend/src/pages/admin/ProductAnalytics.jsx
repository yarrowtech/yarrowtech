import { useEffect, useMemo, useState } from "react";
import { BarChart3, Clock3, Eye, Gauge, TrendingUp, ArrowUpRight, RefreshCw, MousePointerClick, MapPin } from "lucide-react";
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

export default function ProductAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getProductAnalytics();
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
    }, [refresh]);

    const pageRows = analytics?.pages || [];
    const recentVisits = analytics?.recentVisits || [];
    const summary = analytics?.summary || {};
    const explore = analytics?.explore || {};
    const exploreProducts = explore.products || [];
    const exploreRecent = explore.recent || [];

    const topPage = useMemo(() => pageRows[0] || null, [pageRows]);

    if (loading && !analytics) {
        return (
            <div className="pa-page">
                <div className="pa-loading" role="status">Loading product analytics…</div>
            </div>
        );
    }

    return (
        <div className="pa-page">
            <header className="pa-header">
                <div>
                    <p className="pa-badge">Product Analytics</p>
                    <h1>Product usage overview</h1>
                    <p className="pa-subtitle">See which products attract attention and keep visitors engaged.</p>
                </div>
                <button className="pa-refresh" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16} />{loading ? 'Refreshing…' : 'Refresh data'}</button>
            </header>

            {error && <div className="pa-error" role="alert">{error}</div>}
            <div className="pa-context"><span>Product page activity</span><span>All recorded visits</span></div>
            {(!error || analytics) && <>

            <section className="pa-metrics">
                <div className="pa-metric-card">
                    <div className="pa-icon pa-icon--blue"><Eye size={18} /></div>
                    <div>
                        <span>Total page views</span>
                        <strong>{summary.totalViews ?? 0}</strong>
                        <small>Across all product pages</small>
                    </div>
                </div>

                <div className="pa-metric-card">
                    <div className="pa-icon pa-icon--green"><TrendingUp size={18} /></div>
                    <div>
                        <span>Average stay</span>
                        <strong>{formatTime(summary.avgStayMs ?? 0)}</strong>
                        <small>Average time per visit</small>
                    </div>
                </div>

                <div className="pa-metric-card">
                    <div className="pa-icon pa-icon--purple"><Clock3 size={18} /></div>
                    <div>
                        <span>Top page</span>
                        <strong title={topPage?.title}>{shortTitle(topPage?.title)}</strong>
                        <small>{topPage?.views ?? 0} recorded views</small>
                    </div>
                </div>

                <div className="pa-metric-card">
                    <div className="pa-icon pa-icon--amber"><Gauge size={18} /></div>
                    <div>
                        <span>Longest stay</span>
                        <strong title={summary.longestStayPage?.title}>{shortTitle(summary.longestStayPage?.title)}</strong>
                        <small>{formatTime(summary.longestStayPage?.avgStayMs)} average stay</small>
                    </div>
                </div>
            </section>

            <section className="pa-panel pa-panel--full">
                <div className="pa-panel-header">
                    <div className="pa-panel-title-wrap">
                        <MousePointerClick size={16} />
                        <h2>See Demo button clicks</h2>
                    </div>
                    <div className="pa-explore-stats">
                        <span className="pa-count">{explore.totalClicks ?? 0} total clicks</span>
                        <span className="pa-count">{explore.uniqueVisitors ?? 0} unique visitors</span>
                    </div>
                </div>

                <div className="pa-table-wrap">
                    <table className="pa-table pa-table--explore">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Total views</th>
                                <th>Unique views</th>
                                <th>Location</th>
                                <th>Last click</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exploreProducts.length ? (
                                exploreProducts.map((row) => (
                                    <tr key={row.productSlug}>
                                        <td>
                                            <div className="pa-page-cell">
                                                <span className="pa-page-link">{row.productTitle}</span>
                                                <small>/products/{row.productSlug}</small>
                                            </div>
                                        </td>
                                        <td>{row.totalClicks}</td>
                                        <td>{row.uniqueViews}</td>
                                        <td>
                                            <div className="pa-location-chips">
                                                {(row.locations || []).slice(0, 2).map((loc) => (
                                                    <span
                                                        className="pa-location-chip"
                                                        key={loc.location}
                                                        title={`${loc.location} — ${loc.count} click${loc.count === 1 ? "" : "s"}`}
                                                    >
                                                        <MapPin size={12} aria-hidden="true" />
                                                        {prettyLocation(loc.location)}
                                                        <b>{loc.count}</b>
                                                    </span>
                                                ))}
                                                {(row.locations?.length || 0) > 2 && (
                                                    <small title={(row.locations || []).slice(2).map((loc) => `${prettyLocation(loc.location)} (${loc.count})`).join(", ")}>
                                                        +{row.locations.length - 2} more
                                                    </small>
                                                )}
                                            </div>
                                        </td>
                                        <td>{formatDate(row.lastClickedAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="pa-empty">No "See Demo" clicks recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pa-recent-explore">
                    <h3>Recent See Demo clicks</h3>
                    <div className="pa-table-wrap">
                        <table className="pa-table pa-table--compact">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Location</th>
                                    <th>Clicked at</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exploreRecent.length ? (
                                    exploreRecent.map((click) => (
                                        <tr key={click._id || `${click.productSlug}-${click.createdAt}`}>
                                            <td>{click.productTitle}</td>
                                            <td>{prettyLocation(click.location)}</td>
                                            <td>{formatDate(click.createdAt)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="pa-empty">No recent See Demo clicks available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="pa-grid">
                <div className="pa-panel">
                    <div className="pa-panel-header">
                        <div className="pa-panel-title-wrap">
                            <BarChart3 size={16} />
                            <h2>Page performance</h2>
                        </div>
                        <span className="pa-count">{pageRows.length} pages</span>
                    </div>

                    <div className="pa-table-wrap">
                        <table className="pa-table">
                            <thead>
                                <tr>
                                    <th>Page</th>
                                    <th>Views</th>
                                    <th>Avg stay</th>
                                    <th>Traffic</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.length ? (
                                    pageRows.map((page) => (
                                        <tr key={`${page.page}-${page.title}`}>
                                            <td>
                                                <div className="pa-page-cell">
                                                    <span className="pa-page-link">{page.title}</span>
                                                    <small>{page.page}</small>
                                                </div>
                                            </td>
                                            <td>{page.views}</td>
                                            <td>{formatTime(page.avgStayMs)}</td>
                                            <td>
                                                <div className="pa-progress-box">
                                                    <div className="pa-progress" style={{ width: `${Math.min(page.percentOfTraffic, 100)}%` }} />
                                                </div>
                                                <span>{page.percentOfTraffic}%</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="pa-empty">No page visit data yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pa-panel">
                    <div className="pa-panel-header">
                        <div className="pa-panel-title-wrap">
                            <ArrowUpRight size={16} />
                            <h2>Top page insight</h2>
                        </div>
                    </div>

                    <div className="pa-insight-card">
                        <p className="pa-insight-label">Most visited page</p>
                        <h3>{shortTitle(topPage?.title)}</h3>
                        <p className="pa-product-name">{topPage?.title || 'Your most visited product will appear here.'}</p>
                        <p className="pa-insight-path">{topPage?.page || "Waiting for first visitor"}</p>
                        <div className="pa-insight-stats">
                            <div>
                                <span>Views</span>
                                <strong>{topPage?.views ?? 0}</strong>
                            </div>
                            <div>
                                <span>Avg stay</span>
                                <strong>{formatTime(topPage?.avgStayMs ?? 0)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pa-panel pa-panel--full">
                <div className="pa-panel-header">
                    <div className="pa-panel-title-wrap">
                        <Eye size={16} />
                        <h2>Recent page visits</h2>
                    </div>
                    <span className="pa-count">Latest activity</span>
                </div>

                <div className="pa-table-wrap">
                    <table className="pa-table pa-table--compact">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Title</th>
                                <th>Stay time</th>
                                <th>Seen at</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentVisits.length ? (
                                recentVisits.map((visit) => (
                                    <tr key={visit._id || `${visit.path}-${visit.createdAt}`}>
                                        <td>{visit.path}</td>
                                        <td>{visit.title}</td>
                                        <td>{formatTime(visit.durationMs)}</td>
                                        <td>{formatDate(visit.createdAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="pa-empty">No recent page visits available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            </>}
        </div>
    );
}
