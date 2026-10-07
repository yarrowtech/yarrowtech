import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// Browser checks use isolated, clearly synthetic API fixtures; no database writes.
const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
await server.listen();
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
const events = [];
const queries = [];
let mode = 'populated';
await context.addInitScript(() => {
  localStorage.setItem('erp_token', 'browser-test-only');
  localStorage.setItem('erp_role', 'admin');
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
});
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.pathname.endsWith('/project-analytics/track')) {
    events.push(route.request().postDataJSON());
    return route.fulfill({ status: 204 });
  }
  if (url.pathname.endsWith('/erp/admin/project-analytics')) {
    queries.push(Object.fromEntries(url.searchParams));
    if (mode === 'error') return route.fulfill({ status: 500, json: { message: 'Test analytics failure' } });
    const date = url.searchParams.get('start');
    return route.fulfill({ json: {
      summary: mode === 'empty' ? {} : { page_view: 12, visitors: 4, sessions: 5, click: 8, link_visit: 3, login: 2, signup: 1, listing_view: 7 },
      daily: [{ date, page_view: mode === 'empty' ? 0 : 12, visitors: mode === 'empty' ? 0 : 4 }],
      pages: mode === 'empty' ? [] : [{ path: '/products/esportm', views: 12, visitors: 4 }],
      sources: mode === 'empty' ? [] : [{ source: 'Direct', views: 12, sessions: 5 }],
      links: mode === 'empty' ? [] : [{ target: 'https://www.esportm.com/', clicks: 3 }],
      generatedAt: new Date().toISOString(), trackingSince: null,
    } });
  }
  if (url.origin !== origin) return route.fulfill({ status: 200, json: {} });
  return route.continue();
});

try {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/admin/project-analytics`);
  await page.getByRole('heading', { name: 'Website activity' }).waitFor();
  await page.getByRole('heading', { name: 'Daily traffic' }).waitFor();
  assert.equal(events.length, 0, 'Admin visits are excluded');
  await page.getByLabel('Period').selectOption('yesterday');
  await page.getByRole('heading', { name: 'Daily traffic' }).waitFor();
  assert.equal(queries.at(-1).start, queries.at(-1).end);
  await page.getByLabel('From', { exact: true }).fill('2026-01-02');
  await page.getByLabel('To', { exact: true }).fill('2026-01-04');
  await page.getByRole('button', { name: 'Apply dates' }).click();
  await page.getByRole('heading', { name: 'Daily traffic' }).waitFor();
  assert.deepEqual(queries.at(-1), { start: '2026-01-02', end: '2026-01-04' });
  await fs.mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/project-analytics-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/project-analytics-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow on mobile');
  mode = 'error';
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Test analytics failure' }).waitFor();
  mode = 'empty';
  await page.getByRole('button', { name: 'Retry' }).click();
  await page.getByText('No page views recorded for this period.', { exact: false }).waitFor();
  await page.goto(`${origin}/products`);
  await page.waitForFunction(() => !!localStorage.getItem('yt_analytics_visitor'));
  await page.waitForTimeout(300);
  assert.equal(events.filter(event => event.type === 'page_view' && event.path === '/products').length, 1);
  assert.equal(events.filter(event => event.type === 'listing_view' && event.path === '/products').length, 1);
  const nextView = page.waitForRequest(request => request.url().endsWith('/project-analytics/track') && request.postDataJSON()?.type === 'page_view' && request.postDataJSON()?.path === '/products/esportm');
  await page.locator('a[href="/products/esportm"]').first().click();
  await page.waitForURL('**/products/esportm');
  await nextView;
  await page.waitForTimeout(300);
  assert.ok(events.some(event => event.type === 'link_visit' && event.target.endsWith('/products/esportm')));
  assert.ok(events.some(event => event.type === 'click'));
  assert.equal(events.filter(event => event.type === 'page_view' && event.path === '/products/esportm').length, 1);
  assert.equal(new Set(events.map(event => event.visitorId)).size, 1, 'Same browser stays one visitor');
  assert.equal(new Set(events.map(event => event.sessionId)).size, 1, 'Navigation stays in same session');
  assert.deepEqual(errors, []);
  console.log('PASS: desktop/mobile rendering, dates, errors/retry, empty data, excluded admin traffic, route views, listing views, link clicks, visitor/session identity.');
} finally {
  await browser.close();
  await server.close();
}
