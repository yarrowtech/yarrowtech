import React, { useEffect, useState } from 'react';
import { Eye, Users, MousePointer2, Link2, LogIn, UserPlus, List, CalendarCheck, TrendingUp, RefreshCw, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { getProjectAnalytics } from '../../services/adminService';
import '../../styles/ProjectAnalytics.css';

const METRICS = [
  ['page_view', 'Page views', Eye], ['visitors', 'Unique visitors', Users],
  ['sessions', 'Traffic sessions', TrendingUp], ['link_visit', 'Link visits', Link2],
  ['login', 'Successful logins', LogIn], ['signup', 'Successful signups', UserPlus],
  ['listing_view', 'Listing views', List], ['booking_attempt', 'Booking attempts', CalendarCheck], ['click', 'Clicks', MousePointer2],
];
const day = offset => new Date(Date.now() + 19800000 - offset * 86400000).toISOString().slice(0, 10);
const presetRange = preset => ({ start: day(preset === 'yesterday' ? 1 : Number(preset) - 1), end: day(preset === 'yesterday' ? 1 : 0) });
const number = value => new Intl.NumberFormat('en-IN').format(value || 0);
const dateLabel = date => new Date(`${date}T00:00:00+05:30`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

/* The internal table accepts rendered cells as well as plain strings. */
// eslint-disable-next-line react/prop-types
function DataTable({ headings, rows, empty }) {
  return <div className="pra-table-scroll"><table><thead><tr>{headings.map(heading => <th key={heading}>{heading}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((cells, index) => <tr key={index}>{cells.map((cell, i) => <td key={i}>{cell}</td>)}</tr>) : <tr><td colSpan={headings.length} className="pra-empty">{empty || 'No activity in this date range.'}</td></tr>}</tbody></table></div>;
}

export default function ProjectAnalytics() {
  const [preset, setPreset] = useState('7');
  const [draft, setDraft] = useState(() => presetRange('7'));
  const [range, setRange] = useState(draft);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    getProjectAnalytics(range, controller.signal).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(err => {
      if (!controller.signal.aborted) setError(err.response?.data?.message || 'Analytics could not be loaded. Please try again.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [range, refresh]);

  const selectPreset = value => {
    setPreset(value); setValidation('');
    if (value !== 'custom') { const next = presetRange(value); setDraft(next); setRange(next); }
  };
  const applyDates = event => {
    event.preventDefault();
    const length = (Date.parse(draft.end) - Date.parse(draft.start)) / 86400000 + 1;
    if (!draft.start || !draft.end || length < 1 || length > 366) { setValidation('Select a valid date range of up to 366 days.'); return; }
    setValidation(''); setRange({ ...draft });
  };
  const summary = data?.summary || {};
  const top = data?.pages?.[0];
  const share = views => summary.page_view ? `${(views / summary.page_view * 100).toFixed(1)}%` : '0%';

  return <div className="pra-page">
    <header className="pra-header"><div><p className="pra-eyebrow">PROJECT ANALYTICS</p><h1>Website activity</h1><p>Understand how visitors find, explore, and use YarrowTech.</p></div>
      <button className="pra-button" onClick={() => setRefresh(value => value + 1)} disabled={loading}><RefreshCw size={16} /> Refresh</button></header>
    <form className="pra-filters" onSubmit={applyDates}>
      <label>Period<select value={preset} onChange={event => selectPreset(event.target.value)}><option value="1">Today</option><option value="yesterday">Yesterday</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="custom">Custom dates</option></select></label>
      <label>From<input type="date" value={draft.start} max={draft.end || day(0)} required onChange={event => { setPreset('custom'); setDraft({ ...draft, start: event.target.value }); }} /></label>
      <label>To<input type="date" value={draft.end} min={draft.start} max={day(0)} required onChange={event => { setPreset('custom'); setDraft({ ...draft, end: event.target.value }); }} /></label>
      <button className="pra-button pra-primary" type="submit">Apply dates</button><span className="pra-timezone">Daily reporting · India time (IST)</span>
    </form>
    {validation && <p className="pra-error" role="alert">{validation}</p>}
    {loading ? <div className="pra-status" role="status">Loading website activity…</div> : error ? <div className="pra-error" role="alert">{error} <button className="pra-button" onClick={() => setRefresh(value => value + 1)}>Retry</button></div> : data && <>
      <div className="pra-period"><span>{dateLabel(range.start)} – {dateLabel(range.end)}, {range.end.slice(0, 4)}</span><span>Updated {new Date(data.generatedAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST</span></div>
      <section className="pra-metrics" aria-label="Activity totals">{METRICS.map(([key, label, Icon], index) => <article className="pra-card" key={key}><div className={`pra-icon pra-tone-${index % 4}`}><Icon size={19} /></div><span>{label}</span><strong>{key === 'booking_attempt' && !summary[key] ? '—' : number(summary[key])}</strong>{key === 'booking_attempt' && !summary[key] && <small>No booking flow connected</small>}</article>)}</section>
      {!summary.page_view && <div className="pra-notice">No page views recorded for this period. Tracking starts with new visits after this update; earlier product-page totals are separate.</div>}
      <section className="pra-chart-grid"><article className="pra-panel"><div className="pra-panel-heading"><h2>Daily traffic</h2><span>Views and unique visitors</span></div>
        <div className="pra-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.daily} margin={{ top: 12, right: 12, bottom: 0, left: -22 }}><defs><linearGradient id="praViews" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff9200" stopOpacity={0.3} /><stop offset="100%" stopColor="#ff9200" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#ddd5cd" /><XAxis dataKey="date" tickFormatter={dateLabel} minTickGap={28} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip labelFormatter={dateLabel} /><Legend /><Area type="monotone" dataKey="page_view" name="Page views" stroke="#ef8500" strokeWidth={2.5} fill="url(#praViews)" /><Area type="monotone" dataKey="visitors" name="Unique visitors" stroke="#6980db" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div>
      </article><article className="pra-panel pra-top"><ArrowUpRight size={25} /><p className="pra-eyebrow">MOST VISITED PAGE</p><h2>{top?.path || 'Waiting for visitors'}</h2><strong>{number(top?.views)}</strong><p>page views · {share(top?.views)} of traffic</p><div className="pra-top-footer">{number(top?.visitors)} unique visitors to this page</div></article></section>
      <section className="pra-panel"><div className="pra-panel-heading"><h2>Day-wise activity</h2><span>All metrics follow the selected dates</span></div><DataTable headings={['Day', ...METRICS.map(([, label]) => label)]} rows={data.daily.map(row => [dateLabel(row.date), ...METRICS.map(([key]) => key === 'booking_attempt' && !summary[key] ? '—' : number(row[key]))])} /></section>
      <section className="pra-split"><article className="pra-panel"><div className="pra-panel-heading"><h2>Most visited pages</h2><span>Top 100 by views</span></div><DataTable headings={['Page', 'Views', 'Visitors', 'Traffic share']} rows={data.pages.map(row => [<span className="pra-path">{row.path}</span>, number(row.views), number(row.visitors), <span className="pra-share"><i style={{ width: share(row.views) }} />{share(row.views)}</span>])} /></article>
        <article className="pra-panel"><div className="pra-panel-heading"><h2>Traffic sources</h2><span>Top 50 · session entry source</span></div><DataTable headings={['Source', 'Views', 'Sessions']} rows={data.sources.map(row => [row.source, number(row.views), number(row.sessions)])} /></article></section>
      <section className="pra-panel"><div className="pra-panel-heading"><h2>Visited links</h2><span>Top 100 clicked destinations</span></div><DataTable headings={['Destination', 'Link clicks']} rows={data.links.map(row => [<span className="pra-path">{row.target}</span>, number(row.clicks)])} /></section>
      <details className="pra-definitions"><summary>How these metrics are counted</summary><p>Page views count public page loads and navigation. Unique visitors count anonymous browser IDs across the selected period, so daily visitor totals may not add up to the period total. Traffic counts browser-tab sessions after 30 minutes of inactivity. Staff dashboard pages and automated browser visits are excluded.</p><p>Link visits count link clicks, not confirmed arrivals at external websites. Clicks count interactive controls. Listing views count visits to the product catalogue and product-detail pages. Logins and signups count successful website flows. First-time Google registrations count as signups; returning Google users count as logins. Booking attempts require a connected booking action; this website currently has no booking flow.</p><p>Sources use the session’s UTM source or referring hostname; otherwise Direct. All days run midnight to midnight in India time. Blocking tracking or clearing browser storage can affect counts. {data.trackingSince ? `First recorded event: ${new Date(data.trackingSince).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.` : 'No events have been recorded yet.'}</p></details>
    </>}
  </div>;
}
