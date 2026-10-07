import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
await server.listen();
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  await context.addInitScript(() => { localStorage.setItem('erp_token', 'ui-test'); localStorage.setItem('erp_role', 'admin'); });
  const rows = ['EFNBMMS - FOOD & BEVERAGE MANAGEMENT SYSTEM', 'EEC - ELECTRONIC EDUCARE', 'ERETAILMS - RETAIL MANAGEMENT SYSTEM', 'ESPORTM - SPORTS MANAGEMENT SYSTEM'].map((title, i) => ({ title, page: ['/products/food-and-beverage-management-system', '/products/electronic-educare', '/products/retail-management-system', '/products/esportm'][i], views: 40 - i * 10, avgStayMs: 84000, percentOfTraffic: 40 - i * 10 }));
  const now = new Date().toISOString();
  const exploreProducts = [
    { productSlug: 'food-and-beverage-management-system', productTitle: 'EFNBMMS - Food & Beverage Management System', totalClicks: 24, uniqueViews: 16, topLocation: 'Asia/Kolkata', locations: [{ location: 'Asia/Kolkata', count: 20 }, { location: 'America/New_York', count: 3 }, { location: 'Europe/London', count: 1 }], lastClickedAt: now },
    { productSlug: 'electronic-educare', productTitle: 'EEC - Electronic Educare', totalClicks: 15, uniqueViews: 11, topLocation: 'Asia/Kolkata', locations: [{ location: 'Asia/Kolkata', count: 13 }, { location: 'Asia/Dubai', count: 2 }], lastClickedAt: now },
    { productSlug: 'retail-management-system', productTitle: 'ERETAILMS - Retail Management System', totalClicks: 9, uniqueViews: 7, topLocation: 'America/New_York', locations: [{ location: 'America/New_York', count: 6 }, { location: 'Asia/Kolkata', count: 3 }], lastClickedAt: now },
    { productSlug: 'esportm', productTitle: 'ESPORTM - Sports Management System', totalClicks: 4, uniqueViews: 4, topLocation: 'Asia/Kolkata', locations: [{ location: 'Asia/Kolkata', count: 4 }], lastClickedAt: now },
  ];
  const explore = {
    totalClicks: 52,
    uniqueVisitors: 31,
    products: exploreProducts,
    locations: [{ location: 'Asia/Kolkata', count: 40 }, { location: 'America/New_York', count: 9 }, { location: 'Asia/Dubai', count: 2 }, { location: 'Europe/London', count: 1 }],
    recent: exploreProducts.map((row, i) => ({ _id: `explore-${i}`, productSlug: row.productSlug, productTitle: row.productTitle, location: row.topLocation, createdAt: now })),
  };
  let fail = false;
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    // Only intercept backend API calls — the SPA route /admin/product-analytics must keep loading the app.
    const isApi = url.pathname.includes('/api/');
    const cors = { 'access-control-allow-origin': route.request().headers().origin || '*', 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type, authorization' };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (isApi && url.pathname.endsWith('/product-analytics')) return route.fulfill(fail ? { status: 500, headers: cors, json: {} } : { headers: cors, json: { summary: { totalViews: 100, avgStayMs: 84000, longestStayPage: rows[0] }, pages: rows, recentVisits: rows.map((row, i) => ({ _id: String(i), title: row.title, path: row.page, durationMs: 84000, createdAt: now })), explore } });
    return url.origin === origin ? route.continue() : route.fulfill({ headers: cors, json: {} });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await fs.mkdir('artifacts', { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin + '/admin/product-analytics');
    await page.getByRole('heading', { name: 'Product usage overview' }).waitFor();
    assert.equal(await page.locator('.pa-metric-card').count(), 4);
    await page.getByRole('heading', { name: 'Explore button clicks' }).waitFor();
    await page.getByText('52 total clicks').waitFor();
    await page.getByText('31 unique visitors').waitFor();
    const exploreRows = page.locator('.pa-table--explore tbody tr');
    assert.equal(await exploreRows.count(), 4);
    const firstRow = await exploreRows.first().textContent();
    assert.ok(firstRow.includes('24'), 'first product shows total views');
    assert.ok(firstRow.includes('16'), 'first product shows unique views');
    assert.ok(await page.locator('.pa-location-chip', { hasText: 'Kolkata' }).first().isVisible(), 'location chip renders');
    assert.equal(await page.locator('.pa-location-chips small').first().textContent(), '+1 more', 'extra locations are summarized');
    assert.ok(await page.locator('.pa-recent-explore tbody tr').first().isVisible(), 'recent explore clicks render');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `artifacts/product-analytics-${width}.png`, fullPage: true });
  }
  fail = true;
  await page.getByRole('button', { name: 'Refresh data' }).click();
  await page.getByRole('alert').waitFor();
  fail = false;
  await page.getByRole('button', { name: 'Refresh data' }).click();
  await page.waitForFunction(() => !document.querySelector('[role="alert"]') && !document.querySelector('.pa-refresh').disabled);
  assert.deepEqual(errors, []);
  console.log('PASS: responsive product analytics with explore click stats (total, unique, location), refresh, and recoverable error state. Screenshots use synthetic data.');
} finally { await browser.close(); await server.close(); }
