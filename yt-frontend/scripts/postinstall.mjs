// Playwright's own Chromium is only needed for local builds and SEO checks.
// On Vercel the pre-render uses @sparticuz/chromium instead (see prerender-public.mjs).
import { execSync } from 'node:child_process';

if (process.env.VERCEL) {
  console.log('Skipping Playwright browser download on Vercel.');
} else {
  execSync('npx playwright install chromium', { stdio: 'inherit' });
}
