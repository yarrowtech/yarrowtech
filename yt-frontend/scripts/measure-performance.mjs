import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { startPreview } from './preview-server.mjs';
const server = await startPreview();
const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless', '--no-sandbox'] });
try {
  await fs.mkdir(new URL('../seo-artifacts/', import.meta.url), { recursive: true });
  for (const [name, route] of [['home', '/'], ['services', '/services'], ['product', '/products/electronic-educare']]) {
    const result = await lighthouse(server.origin + route, { port: chrome.port, output: 'html', logLevel: 'error', onlyCategories: ['performance', 'seo', 'accessibility'], disableStorageReset: false, blockedUrlPatterns: ['*/api/*'] });
    await fs.writeFile(new URL(`../seo-artifacts/${name}-mobile.html`, import.meta.url), result.report);
    await fs.writeFile(new URL(`../seo-artifacts/${name}-lighthouse.json`, import.meta.url), JSON.stringify(result.lhr));
    const { audits, categories } = result.lhr;
    const summary = { page: route, mode: 'Lighthouse simulated mobile; compressed local server, not field Core Web Vitals', performance: Math.round(categories.performance.score * 100), seo: Math.round(categories.seo.score * 100), accessibility: Math.round(categories.accessibility.score * 100), LCP: audits['largest-contentful-paint'].displayValue, CLS: audits['cumulative-layout-shift'].displayValue, TBT: audits['total-blocking-time'].displayValue };
    await fs.writeFile(new URL(`../seo-artifacts/${name}-mobile.json`, import.meta.url), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary));
  }
} finally { await chrome.kill(); await server.close(); }
