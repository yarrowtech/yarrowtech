import ProjectAnalyticsEvent from '../../models/ProjectAnalyticsEvent.js';
import { EVENT_TYPES, TIMEZONE, analyticsRange, fillDays, cleanPath, cleanTarget } from '../../utils/projectAnalytics.js';
import logger from '../../utils/logger.js';

export async function trackProjectEvent(req, res) {
  const body = req.body || {};
  const path = cleanPath(body.path);
  const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{8,80}$/.test(value);
  if (!EVENT_TYPES.includes(body.type) || !path || ![body.eventId, body.visitorId, body.sessionId].every(validId)) {
    return res.status(400).json({ message: 'Invalid analytics event.' });
  }
  if (/^\/(admin|manager|techlead|client|product-user)(\/|$)/.test(path)) return res.sendStatus(204);
  // No form values, query strings, credentials, IP addresses, or user identities are stored.
  const source = typeof body.source === 'string' ? body.source.replace(/[^a-zA-Z0-9 ._-]/g, '').slice(0, 100) : 'Direct';
  try {
    await ProjectAnalyticsEvent.updateOne({ eventId: body.eventId }, { $setOnInsert: {
      eventId: body.eventId, type: body.type, visitorId: body.visitorId,
      sessionId: body.sessionId, path, target: cleanTarget(body.target), source: source || 'Direct',
      createdAt: new Date(),
    } }, { upsert: true });
    return res.sendStatus(204);
  } catch (error) {
    if (error.code === 11000) return res.sendStatus(204);
    logger.error({ err: error }, 'Project event tracking failed');
    return res.status(500).json({ message: 'Unable to record event.' });
  }
}

const counts = Object.fromEntries(EVENT_TYPES.map(type => [type, { $sum: { $cond: [{ $eq: ['$type', type] }, 1, 0] } }]));
const distinct = { visitors: { $addToSet: '$visitorId' }, sessions: { $addToSet: '$sessionId' }, loginVisitors: { $addToSet: { $cond: [{ $eq: ['$type', 'login'] }, '$visitorId', null] } } };
const totalsProjection = { _id: 0, ...Object.fromEntries(EVENT_TYPES.map(type => [type, 1])), visitors: { $size: '$visitors' }, sessions: { $size: '$sessions' }, login_unique: { $size: { $setDifference: ['$loginVisitors', [null]] } } };

export async function getProjectAnalytics(req, res) {
  let range;
  try { range = analyticsRange(req.query); }
  catch (error) { return res.status(400).json({ message: error.message }); }
  try {
    const [data] = await ProjectAnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: range.from, $lt: range.until } } },
      { $facet: {
        summary: [{ $group: { _id: null, ...counts, ...distinct } }, { $project: totalsProjection }],
        daily: [
          { $group: { _id: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d', timezone: TIMEZONE } }, ...counts, ...distinct } },
          { $project: { ...totalsProjection, date: '$_id' } }, { $sort: { date: 1 } },
        ],
        pages: [{ $match: { type: 'page_view' } }, { $group: { _id: '$path', views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
          { $sort: { views: -1, _id: 1 } }, { $limit: 100 }, { $project: { _id: 0, path: '$_id', views: 1, visitors: { $size: '$visitors' } } }],
        sources: [{ $match: { type: 'page_view' } }, { $group: { _id: '$source', views: { $sum: 1 }, sessions: { $addToSet: '$sessionId' } } },
          { $sort: { views: -1, _id: 1 } }, { $limit: 50 }, { $project: { _id: 0, source: '$_id', views: 1, sessions: { $size: '$sessions' } } }],
        links: [{ $match: { type: 'link_visit', target: { $ne: '' } } }, { $group: { _id: '$target', clicks: { $sum: 1 } } },
          { $sort: { clicks: -1, _id: 1 } }, { $limit: 100 }, { $project: { _id: 0, target: '$_id', clicks: 1 } }],
      } },
    ]);
    const first = await ProjectAnalyticsEvent.findOne().sort({ createdAt: 1 }).select('createdAt').lean();
    res.set('Cache-Control', 'no-store');
    return res.json({ ...data, summary: data.summary[0] || {}, daily: fillDays(data.daily, range),
      range: { start: range.start, end: range.end, timezone: TIMEZONE }, trackingSince: first?.createdAt || null,
      generatedAt: new Date().toISOString() });
  } catch (error) {
    logger.error({ err: error }, 'Project analytics query failed');
    return res.status(500).json({ message: 'Unable to load project analytics.' });
  }
}
