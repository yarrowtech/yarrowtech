import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Users, MousePointer2, Link2, LogIn, UserPlus, List, TrendingUp, RefreshCw, ArrowUpRight, Search, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { getProjectAnalytics } from '../../services/adminService';
import '../../styles/ProjectAnalytics.css';

const METRICS = [
  ['page_view', 'Page views', Eye], ['visitors', 'Unique visitors', Users],
  ['sessions', 'Traffic sessions', TrendingUp], ['link_visit', 'Link visits', Link2],
  ['login_unique', 'Unique logins', LogIn], ['signup', 'Successful signups', UserPlus],
  ['listing_view', 'Listing views', List], ['click', 'Clicks', MousePointer2],
];
const PRIMARY = ['page_view', 'visitors', 'sessions', 'click'];
const TABS = [['days', 'Day-wise'], ['pages', 'Pages'], ['sources', 'Sources'], ['links', 'Links']];
const PAGE_SIZE = 10;
const day = offset => new Date(Date.now() + 19800000 - offset * 86400000).toISOString().slice(0, 10);
const presetRange = preset => ({ start: day(preset === 'yesterday' ? 1 : Number(preset) - 1), end: day(preset === 'yesterday' ? 1 : 0) });
const number = value => new Intl.NumberFormat('en-IN').format(value || 0);
const dateLabel = date => new Date(`${date}T00:00:00+05:30`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

export default function ProjectAnalytics() {
  const [preset, setPreset] = useState('7');
  const [draft, setDraft] = useState(() => presetRange('7'));
  const [range, setRange] = useState(draft);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState('');
  const [tab, setTab] = useState('days');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!detail) return undefined;
    const onKey = event => event.key === 'Escape' && setDetail(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail]);

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
  const total = key => number(summary[key]);
  const share = views => summary.page_view ? `${(views / summary.page_view * 100).toFixed(1)}%` : '0%';

  const buildTable = () => {
    const days = (data?.daily || []).slice().reverse();
    const q = query.trim().toLowerCase();
    const match = text => !q || String(text).toLowerCase().includes(q);
    if (tab === 'pages') return { headings: ['Page', 'Views', 'Visitors', 'Share'], rows: (data?.pages || []).filter(row => match(row.path)).map(row => ({
      cells: [<span className="pra-path">{row.path}</span>, number(row.views), number(row.visitors), <span className="pra-share"><i style={{ width: share(row.views) }} />{share(row.views)}</span>],
      detail: { title: row.path, subtitle: 'Page', items: [['Page views', number(row.views)], ['Unique visitors', number(row.visitors)], ['Traffic share', share(row.views)], ['Views per visitor', row.visitors ? (row.views / row.visitors).toFixed(1) : '0']] } })) };
    if (tab === 'sources') return { headings: ['Source', 'Views', 'Sessions'], rows: (data?.sources || []).filter(row => match(row.source)).map(row => ({
      cells: [row.source, number(row.views), number(row.sessions)],
      detail: { title: row.source, subtitle: 'Traffic source', items: [['Page views', number(row.views)], ['Sessions', number(row.sessions)], ['Views per session', row.sessions ? (row.views / row.sessions).toFixed(1) : '0'], ['Traffic share', share(row.views)]] } })) };
    if (tab === 'links') return { headings: ['Destination', 'Clicks'], rows: (data?.links || []).filter(row => match(row.target)).map(row => ({
      cells: [<span className="pra-path">{row.target}</span>, number(row.clicks)],
      detail: { title: row.target, subtitle: 'Visited link', items: [['Link clicks', number(row.clicks)]] } })) };
    return { headings: ['Day', 'Views', 'Visitors', 'Sessions', 'Clicks'], rows: days.filter(row => match(dateLabel(row.date))).map(row => ({
      cells: [dateLabel(row.date), number(row.page_view), number(row.visitors), number(row.sessions), number(row.click)],
      detail: { title: dateLabel(row.date), subtitle: 'Day summary', items: METRICS.map(([key, label]) => [label, number(row[key])]) } })) };
  };
  const table = data ? buildTable() : { headings: [], rows: [] };
  const visibleRows = showAll ? table.rows : table.rows.slice(0, PAGE_SIZE);

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
      <section className="pra-metrics" aria-label="Activity totals">{PRIMARY.map((key, index) => { const [, label, Icon] = METRICS.find(m => m[0] === key); return <article className="pra-card" key={key}><div className={`pra-icon pra-tone-${index % 4}`}><Icon size={19} /></div><span>{label}</span><strong>{total(key)}</strong></article>; })}</section>
      <section className="pra-chips" aria-label="Engagement totals">{METRICS.filter(([key]) => !PRIMARY.includes(key)).map(([key, label, Icon]) => <div className="pra-chip" key={key}><Icon size={14} /><span>{label}</span><b>{total(key)}</b></div>)}</section>
      {!summary.page_view && <div className="pra-notice">No page views recorded for this period. Tracking starts with new visits after this update; earlier product-page totals are separate.</div>}
      <section className="pra-chart-grid"><article className="pra-panel"><div className="pra-panel-heading"><h2>Daily traffic</h2><span>Views and unique visitors</span></div>
        <div className="pra-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.daily} margin={{ top: 12, right: 12, bottom: 0, left: -22 }}><defs><linearGradient id="praViews" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff9200" stopOpacity={0.3} /><stop offset="100%" stopColor="#ff9200" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#ddd5cd" /><XAxis dataKey="date" tickFormatter={dateLabel} minTickGap={28} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip labelFormatter={dateLabel} /><Legend /><Area type="monotone" dataKey="page_view" name="Page views" stroke="#ef8500" strokeWidth={2.5} fill="url(#praViews)" /><Area type="monotone" dataKey="visitors" name="Unique visitors" stroke="#6980db" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div>
      </article><article className="pra-panel pra-top"><ArrowUpRight size={25} /><p className="pra-eyebrow">MOST VISITED PAGE</p><h2>{top?.path || 'Waiting for visitors'}</h2><strong>{number(top?.views)}</strong><p>page views · {share(top?.views)} of traffic</p><div className="pra-top-footer">{number(top?.visitors)} unique visitors to this page</div></article></section>
      <section className="pra-panel">
        <div className="pra-toolbar"><div className="pra-tabs" role="tablist">{TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => { setTab(id); setShowAll(false); setQuery(''); }}>{label}</button>)}</div>
          <label className="pra-search"><Search size={14} /><input value={query} onChange={event => { setQuery(event.target.value); setShowAll(false); }} placeholder="Search" aria-label="Search table" /></label></div>
        <div className="pra-table-scroll"><table className="pra-clickable"><thead><tr>{table.headings.map(heading => <th key={heading}>{heading}</th>)}</tr></thead>
          <tbody>{visibleRows.length ? visibleRows.map((row, index) => <tr key={index} tabIndex={0} onClick={() => setDetail(row.detail)} onKeyDown={event => event.key === 'Enter' && setDetail(row.detail)}>{row.cells.map((cell, i) => <td key={i}>{cell}</td>)}</tr>) : <tr><td colSpan={table.headings.length} className="pra-empty">No activity in this date range.</td></tr>}</tbody></table></div>
        {table.rows.length > PAGE_SIZE && <button className="pra-button pra-more" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show top 10' : `Show all ${table.rows.length}`}</button>}
      </section>
      <details className="pra-definitions"><summary>How these metrics are counted</summary><p>Page views count public page loads and navigation. Unique visitors count anonymous browser IDs across the selected period, so daily visitor totals may not add up to the period total. Traffic counts browser-tab sessions after 30 minutes of inactivity. Staff dashboard pages and automated browser visits are excluded.</p><p>Link visits count link clicks, not confirmed arrivals at external websites. Clicks count interactive controls. Listing views count visits to the product catalogue and product-detail pages. Unique logins count each browser once per period that completed a successful login; signups count successful website flows. First-time Google registrations count as signups; returning Google users count as logins.</p><p>Sources use the session’s UTM source or referring hostname; otherwise Direct. All days run midnight to midnight in India time. Blocking tracking or clearing browser storage can affect counts. {data.trackingSince ? `First recorded event: ${new Date(data.trackingSince).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.` : 'No events have been recorded yet.'}</p></details>
    </>}
    {detail && <div className="pra-overlay" onClick={() => setDetail(null)}><div className="pra-modal" role="dialog" aria-modal="true" aria-label={detail.title} onClick={event => event.stopPropagation()}>
      <div className="pra-modal-head"><div><p className="pra-eyebrow">{detail.subtitle.toUpperCase()}</p><h2>{detail.title}</h2><small>{dateLabel(range.start)} – {dateLabel(range.end)}</small></div><button className="pra-close" onClick={() => setDetail(null)} aria-label="Close"><X size={18} /></button></div>
      <div className="pra-modal-grid">{detail.items.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    </div></div>}
  </div>;
}
