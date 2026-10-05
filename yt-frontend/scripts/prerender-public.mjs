import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicRoutes, indexableRoutes } from './public-routes.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const shell = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (!path.extname(pathname)) { res.setHeader('Content-Type', 'text/html'); res.end(shell); return; }
  const file = path.resolve(dist, '.' + pathname);
  if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return; }
  try { res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); res.end(await fs.readFile(file)); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  // Build snapshots must not send analytics, load maps or depend on external APIs.
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  for (const route of [...publicRoutes, '/404']) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    await page.locator('h1').first().waitFor();
    await page.waitForFunction(() => document.title && !document.querySelector('[role="status"]'));
    // Trigger sections animated on entry before capturing the entire document.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
        scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 60));
      }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(900);
    if (errors.length) throw new Error(`${route}: ${errors.join('; ')}`);
    const metadata = await page.evaluate(() => ({ title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.href, h1: document.querySelectorAll('h1').length }));
    if (route !== '/404' && metadata.canonical !== `https://yarrowtech.in${route}`) throw new Error(`Wrong canonical on ${route}: ${metadata.canonical}`);
    if (metadata.h1 !== 1) throw new Error(`${route} has ${metadata.h1} H1 headings`);
    await page.evaluate(() => {
      document.querySelectorAll('#root [style]').forEach(node => {
        if (node.style.opacity === '0') { node.style.opacity = '1'; node.style.transform = 'none'; }
      });
      // createRoot mounts the client app; RouteMetadata removes snapshot metadata.
      document.querySelectorAll('head title, head meta[name="description"], head meta[name="robots"], head meta[property^="og:"], head meta[name^="twitter:"], head link[rel="canonical"], head script[type="application/ld+json"], [data-rh]').forEach(node => { node.removeAttribute('data-rh'); node.setAttribute('data-prerender-head', ''); });
    });
    const html = await page.content();
    const target = route === '/404' ? path.join(dist, '404.html') : path.join(dist, route.slice(1), 'index.html');
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, html);
    console.log(`Prerendered ${route}`);
    await page.close();
  }
  await fs.writeFile(path.join(dist, 'app-shell.html'), shell.replace('</head>', '<meta name="robots" content="noindex, nofollow" data-prerender-head></head>'));
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + indexableRoutes.map(route => `  <url><loc>https://yarrowtech.in${route}</loc></url>`).join('\n') + '\n</urlset>\n';
  await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
