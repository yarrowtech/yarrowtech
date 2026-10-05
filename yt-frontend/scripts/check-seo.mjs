import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { publicRoutes, indexableRoutes } from './public-routes.mjs';
import { startPreview } from './preview-server.mjs';

const server = await startPreview();
const browser = await chromium.launch();
try {
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const page = await noJS.newPage();
  const titles = new Set();
  const descriptions = new Set();
  const config = JSON.parse(await fs.readFile(new URL('../vercel.json', import.meta.url)));
  for (const route of publicRoutes) {
    assert(config.routes.some(rule => rule.src === route), `Missing Vercel route: ${route}`);
    const response = await page.goto(server.origin + route);
    assert.equal(response.status(), 200, route);
    assert.equal(await page.locator('h1').count(), 1, route);
    assert.equal(await page.locator('head title').count(), 1, route);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://yarrowtech.in' + route);
    const title = await page.title();
    assert(!titles.has(title), `Duplicate title: ${route}`); titles.add(title);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    assert(description && !descriptions.has(description), `Missing/duplicate description: ${route}`); descriptions.add(description);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), indexableRoutes.includes(route) ? 'index, follow' : 'noindex, nofollow');
    for (const text of await page.locator('script[type="application/ld+json"]').allTextContents()) assert(JSON.parse(text)['@graph'].length);
    if (indexableRoutes.includes(route)) assert(await page.locator('script[type="application/ld+json"]').count(), `Missing schema: ${route}`);
  }
  assert.equal((await page.goto(server.origin + '/does-not-exist')).status(), 404);
  assert.equal((await page.goto(server.origin + '/products/does-not-exist')).status(), 404);
  assert.equal((await fetch(server.origin + '/home2', { redirect: 'manual' })).status, 308);
  for (const route of ['/admin', '/manager/dashboard', '/techlead', '/client', '/product-user', '/efnbmms/signup']) {
    const response = await fetch(server.origin + route);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    assert((await response.text()).includes('noindex, nofollow'));
  }
  const sitemap = await (await fetch(server.origin + '/sitemap.xml')).text();
  for (const route of indexableRoutes) assert(sitemap.includes(`<loc>https://yarrowtech.in${route}</loc>`));
  assert(!sitemap.includes('/case-studies'));

  const context = await browser.newContext();
  await context.route('**/*', route => new URL(route.request().url()).origin === server.origin ? route.continue() : route.abort());
  const live = await context.newPage();
  const errors = [];
  const requests = [];
  live.on('request', request => requests.push(request.url()));
  live.on('pageerror', error => errors.push(error.message));
  await fs.mkdir(new URL('../seo-artifacts/', import.meta.url), { recursive: true });
  for (const width of [390, 768, 1440]) {
    await live.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/services', '/services/erp-development', '/products/electronic-educare', '/blog/planning-an-erp-project']) {
      await live.goto(server.origin + route, { waitUntil: 'networkidle' });
      await live.waitForTimeout(500);
      assert.equal(await live.locator('link[rel="canonical"]').count(), 1, `Duplicate client canonical: ${route}`);
      assert.equal(await live.locator('head title').count(), 1, `Duplicate client title: ${route}`);
      assert(await live.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow ${width}: ${route}`);
      if (route === '/') {
        assert(!requests.some(url => /accounts\.google\.com\/gsi|CategoricalChart-|AdminDashboard-|ManagerDashboard-/.test(url)), 'Homepage loaded login or ERP-only scripts');
      }
    }
    await live.goto(server.origin + '/services');
    await live.getByRole('heading', { name: 'Software Development Services', exact: true }).waitFor();
    await live.waitForTimeout(400);
    await live.screenshot({ path: new URL(`../seo-artifacts/services-${width}.png`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'), fullPage: true });
  }
  await live.goto(server.origin + '/services');
  await live.getByRole('link', { name: 'ERP Development', exact: true }).click();
  await live.waitForURL('**/services/erp-development');
  await live.waitForTimeout(200);
  assert.equal(await live.locator('link[rel="canonical"]').getAttribute('href'), 'https://yarrowtech.in/services/erp-development');
  await live.goto(server.origin + '/admin');
  await live.waitForURL(server.origin + '/');
  await live.evaluate(() => { localStorage.setItem('erp_token', 'invalid-test-token'); localStorage.removeItem('erp_role'); });
  await live.goto(server.origin + '/admin');
  await live.waitForURL(server.origin + '/');
  await live.evaluate(() => localStorage.removeItem('erp_token'));
  assert.equal(errors.length, 0, errors.join('; '));
  console.log(`PASS: ${publicRoutes.length} prerendered pages, metadata, sitemap, schema, status codes, private headers, client navigation and responsive layouts.`);
} finally { await browser.close(); await server.close(); }
