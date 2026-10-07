import test from 'node:test';
import assert from 'node:assert/strict';
import ProductExploreClick from '../models/ProductExploreClick.js';
import { trackProductExploreClick } from '../erp/controllers/admin.controller.js';
import { summarizeExploreClicks } from '../utils/productAnalyticsStats.js';

const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, sendStatus(code) { this.statusCode = code; return this; } });

test('explore clicks are validated and upserted by event ID', async t => {
  const writes = [];
  t.mock.method(ProductExploreClick, 'updateOne', async (...args) => writes.push(args));
  const body = { eventId: 'event_123456', visitorId: 'visitor_123456', productSlug: 'electronic-educare', productTitle: 'EEC - Electronic Educare', location: 'Asia/Kolkata', targetUrl: 'https://example.com', referrer: 'https://google.com' };
  const res = response();
  await trackProductExploreClick({ body }, res);
  assert.equal(res.statusCode, 201);
  await trackProductExploreClick({ body }, response());
  assert.deepEqual(writes[0][0], writes[1][0], 'same event id targets the same record');
  assert.equal(writes[0][1].$setOnInsert.location, 'Asia/Kolkata');
  assert.deepEqual(writes[0][2], { upsert: true });
  for (const bad of [
    { ...body, eventId: 'short' },
    { ...body, visitorId: '' },
    { ...body, productSlug: '' },
    { eventId: 'event_123456', visitorId: 'visitor_123456' },
  ]) {
    const invalid = response();
    await trackProductExploreClick({ body: bad }, invalid);
    assert.equal(invalid.statusCode, 400, JSON.stringify(bad));
  }
});

test('explore click payloads are sanitized before storage', async t => {
  const writes = [];
  t.mock.method(ProductExploreClick, 'updateOne', async (...args) => writes.push(args));
  await trackProductExploreClick({ body: { eventId: 'event_123456', visitorId: 'visitor_123456', productSlug: 'esportm', productTitle: 'ESPORTM\t<script>', location: 'Asia/Kolkata?query', targetUrl: 'javascript:alert(1)'.padEnd(600, 'x'), referrer: 'x'.repeat(400) } }, response());
  const stored = writes[0][1].$setOnInsert;
  assert.equal(stored.productTitle, 'ESPORTM <script>');
  assert.equal(stored.location, 'Asia/Kolkataquery');
  assert.ok(stored.targetUrl.length <= 500);
  assert.ok(stored.referrer.length <= 255);
});

test('summary computes total views, unique views, and locations per product', () => {
  const clicks = [
    { productSlug: 'esportm', productTitle: 'ESPORTM', visitorId: 'v1', location: 'Asia/Kolkata', createdAt: '2026-10-01T10:00:00Z' },
    { productSlug: 'esportm', productTitle: 'ESPORTM', visitorId: 'v1', location: 'Asia/Kolkata', createdAt: '2026-10-01T11:00:00Z' },
    { productSlug: 'esportm', productTitle: 'ESPORTM', visitorId: 'v2', location: 'America/New_York', createdAt: '2026-10-01T12:00:00Z' },
    { productSlug: 'electronic-educare', productTitle: 'EEC', visitorId: 'v2', location: 'America/New_York', createdAt: '2026-10-01T13:00:00Z' },
    { productSlug: 'electronic-educare', productTitle: 'EEC', visitorId: 'v3', location: 'Asia/Kolkata', createdAt: '2026-10-02T09:00:00Z' },
  ];
  const summary = summarizeExploreClicks(clicks);
  assert.equal(summary.totalClicks, 5);
  assert.equal(summary.uniqueVisitors, 3);
  assert.equal(summary.products.length, 2);
  const esportm = summary.products.find(p => p.productSlug === 'esportm');
  assert.equal(esportm.totalClicks, 3);
  assert.equal(esportm.uniqueViews, 2);
  assert.equal(esportm.topLocation, 'Asia/Kolkata');
  assert.deepEqual(esportm.locations, [{ location: 'Asia/Kolkata', count: 2 }, { location: 'America/New_York', count: 1 }]);
  assert.equal(esportm.lastClickedAt.toISOString(), '2026-10-01T12:00:00.000Z');
  assert.deepEqual(summary.locations, [{ location: 'Asia/Kolkata', count: 3 }, { location: 'America/New_York', count: 2 }]);
  assert.deepEqual(summarizeExploreClicks([]), { totalClicks: 0, uniqueVisitors: 0, products: [], locations: [] });
});
