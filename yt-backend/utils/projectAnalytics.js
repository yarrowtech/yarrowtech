export const EVENT_TYPES = ['page_view', 'click', 'link_visit', 'login', 'signup', 'listing_view', 'booking_attempt'];
export const TIMEZONE = 'Asia/Kolkata';
const DAY = 86400000;
export const dayInIndia = (date = new Date()) => new Date(date.getTime() + 19800000).toISOString().slice(0, 10);

export function analyticsRange(query = {}) {
  const end = query.end || dayInIndia();
  const start = query.start || dayInIndia(new Date(Date.now() - 6 * DAY));
  for (const value of [start, end]) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
      throw new Error('Use valid dates in YYYY-MM-DD format.');
    }
  }
  const from = new Date(`${start}T00:00:00+05:30`);
  const until = new Date(new Date(`${end}T00:00:00+05:30`).getTime() + DAY);
  if (until <= from || (until - from) / DAY > 366) throw new Error('Choose an ordered date range of at most 366 days.');
  return { start, end, from, until };
}

export function fillDays(rows, range) {
  const lookup = new Map(rows.map(row => [row.date, row]));
  const days = [];
  for (let time = range.from.getTime(); time < range.until.getTime(); time += DAY) {
    const date = dayInIndia(new Date(time));
    days.push({ date, ...Object.fromEntries(EVENT_TYPES.map(type => [type, 0])), visitors: 0, sessions: 0, ...lookup.get(date) });
  }
  return days;
}

export function cleanPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  return value.split(/[?#]/)[0].slice(0, 300);
}

export function cleanTarget(value) {
  if (!value) return '';
  if (String(value).startsWith('/')) return cleanPath(value) || '';
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? `${url.origin}${url.pathname}`.slice(0, 500) : '';
  } catch { return ''; }
}
