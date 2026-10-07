import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';

const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
await server.listen();
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin
    ? route.continue() : route.fulfill({ status: 200, json: {} }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [label, id, source] of [
      ['Expertise', 'expertise', '/products'],
      ['FAQ', 'faq', '/services'],
      ['About', 'about', '/products/esportm'],
    ]) {
      await page.goto(origin + source);
      await page.locator('h1').waitFor();
      if (width === 390) await page.getByRole('button', { name: 'Toggle menu' }).click();
      await page.locator('.nav-menu').getByRole('link', { name: label, exact: true }).click();
      await page.waitForURL(`${origin}/#${id}`);
      await page.waitForFunction(sectionId => {
        const top = document.getElementById(sectionId)?.getBoundingClientRect().top;
        const headerHeight = document.querySelector('.header').getBoundingClientRect().height;
        return top >= headerHeight && top <= headerHeight + 35;
      }, id);
      if (width === 390) assert.equal(await page.locator('.nav-menu.open').count(), 0);
    }
    await page.goto(origin + '/products');
    await page.locator('h1').waitFor();
    if (width === 390) await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.locator('.nav-menu').getByRole('link', { name: 'Home', exact: true }).click();
    await page.waitForURL(origin + '/');
    await page.locator('#home').waitFor();
    await page.waitForFunction(() => window.scrollY < 10);
    await page.goto(origin + '/#faq');
    await page.waitForFunction(() => {
      const top = document.getElementById('faq')?.getBoundingClientRect().top;
      return top > 0 && top < 180;
    });
  }
  assert.deepEqual(errors, []);
  console.log('PASS: Home and section links from inner pages, direct hash links, header offset, and mobile menu closure.');
} finally {
  await browser.close();
  await server.close();
}
