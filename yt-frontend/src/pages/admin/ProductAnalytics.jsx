import { useEffect, useMemo, useState } from "react";
import { BarChart3, Clock3, Eye, Gauge, TrendingUp, ArrowUpRight } from "lucide-react";
import { getProductAnalytics } from "../../services/adminService";
import "../../styles/ProductAnalytics.css";

const formatTime = (ms) => {
    if (!Number.isFinite(ms) || ms <= 0) return "0s";
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
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

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const data = await getProductAnalytics();
                if (active) setAnalytics(data);
            } catch (error) {
                console.error("Product analytics load error:", error);
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, []);

    const pageRows = analytics?.pages || [];
    const recentVisits = analytics?.recentVisits || [];
    const summary = analytics?.summary || {};

    const topPage = useMemo(() => pageRows[0] || null, [pageRows]);

    if (loading) {
        return (
            <div className="pa-page">
                <div className="pa-loading">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="pa-page">
            <header className="pa-header">
                <div>
                    <p className="pa-badge">Product Analytics</p>
                    <h1>Product usage overview</h1>
                </div>
            </header>

            <section className="pa-metrics">
                <div className="pa-metric-card">
                    <div className="pa-icon pa-icon--blue"><Eye size={18} /></div>
                    <div>
                        <span>Total page views</span>
                        <strong>{summary.totalViews ?? 0}</strong>
                    </div>
                </div>

                <div className="pa-metric-card">
                    <div className="pa-icon pa-icon--green"><TrendingUp size={18} /></div>
                    <div>
                        <span>Average stay</span>
                        <strong>{formatTime(summary.avgStayMs ?? 0)}</strong>
                    </div>
                </div>

                <div className="pa-metric-card">
                    <div className="pa-icon pa-icon--purple"><Clock3 size={18} /></div>
                    <div>
                        <span>Top page</span>
                        <strong>{topPage?.title || "No data"}</strong>
                    </div>
                </div>

                <div className="pa-metric-card">
                    <div className="pa-icon pa-icon--amber"><Gauge size={18} /></div>
                    <div>
                        <span>Longest stay</span>
                        <strong>{summary.longestStayPage?.title || "No data"}</strong>
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
                        <h3>{topPage?.title || "No data"}</h3>
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
        </div>
    );
}
