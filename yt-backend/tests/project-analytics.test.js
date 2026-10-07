import test from 'node:test';
import assert from 'node:assert/strict';
import { analyticsRange, fillDays, cleanPath, cleanTarget, dayInIndia } from '../utils/projectAnalytics.js';
import ProjectAnalyticsEvent from '../models/ProjectAnalyticsEvent.js';
import { trackProjectEvent, getProjectAnalytics } from '../erp/controllers/projectAnalytics.controller.js';

test('India dates use inclusive calendar days and exclusive upper bounds', () => {
  const range = analyticsRange({ start: '2026-10-01', end: '2026-10-02' });
  assert.equal(range.from.toISOString(), '2026-09-30T18:30:00.000Z');
  assert.equal(range.until.toISOString(), '2026-10-02T18:30:00.000Z');
  assert.equal(dayInIndia(new Date('2026-10-01T18:30:00Z')), '2026-10-02');
  const days = fillDays([{ date: '2026-10-02', visitors: 2, page_view: 3 }], range);
  assert.equal(days.length, 2);
  assert.equal(days[0].page_view, 0);
  assert.equal(days[1].visitors, 2);
});
test('invalid dates, reversed ranges, arrays, and oversized ranges are rejected', () => {
  for (const query of [
    { start: '2026-02-30', end: '2026-03-01' },
    { start: '2026-10-03', end: '2026-10-01' },
    { start: ['2026-10-01'], end: '2026-10-03' },
    { start: '2024-01-01', end: '2026-10-03' },
  ]) assert.throws(() => analyticsRange(query));
});
test('stored URLs drop queries, fragments, and credentials', () => {
  assert.equal(cleanPath('/products/esportm?email=secret#token'), '/products/esportm');
  assert.equal(cleanPath('//external.test/path'), null);
  assert.equal(cleanTarget('https://user:password@example.com/path?secret=1#hash'), 'https://example.com/path');
  assert.equal(cleanTarget('javascript:alert(1)'), '');
  assert.equal(cleanTarget('mailto:person@example.com'), '');
});
const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, sendStatus(code) { this.statusCode = code; return this; } });
test('ingestion validates events, ignores staff pages, and upserts by event ID', async t => {
  const writes = [];
  t.mock.method(ProjectAnalyticsEvent, 'updateOne', async (...args) => writes.push(args));
  const body = { eventId: 'event_123456', visitorId: 'visitor_123456', sessionId: 'session_123456', type: 'page_view', path: '/products?secret=1' };
  const res = response();
  await trackProjectEvent({ body }, res);
  assert.equal(res.statusCode, 204);
  await trackProjectEvent({ body }, response());
  assert.deepEqual(writes[0][0], writes[1][0]);
  assert.equal(writes[0][1].$setOnInsert.path, '/products');
  assert.deepEqual(writes[0][2], { upsert: true });
  await trackProjectEvent({ body: { ...body, path: '/admin/project-analytics' } }, response());
  assert.equal(writes.length, 2);
  const invalid = response();
  await trackProjectEvent({ body: { ...body, type: 'unknown' } }, invalid);
  assert.equal(invalid.statusCode, 400);
});
test('report rejects malformed filters before reading the database', async () => {
  const res = response();
  await getProjectAnalytics({ query: { start: 'not-a-date' } }, res);
  assert.equal(res.statusCode, 400);
});
