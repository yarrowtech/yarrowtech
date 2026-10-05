# SEO deployment and verification

## Build and deployment

The Vercel project root must be `yt-frontend`. `vercel.json` sets the build command to `npm run build` and output to `dist`. The install step installs Playwright Chromium for public HTML snapshots. Do not override the build with `vite build` alone.

`npm run build` generates public HTML, an actual `404.html`, a private application shell and a sitemap. Public routes are defined in `scripts/public-routes.mjs`. After changing routes, run `npm run seo:hosting` and commit the updated `vercel.json`.

The private shell contains no ERP data. Existing APIs validate JWTs and roles; private HTML receives `X-Robots-Tag: noindex, nofollow`. `robots.txt` permits reading those directives. Crawl rules are not authentication. This work verifies representative HTTP endpoints, not a full ERP security audit.

Existing `/home2` and `/home-classic` URLs redirect to `/`; old section routes redirect to homepage anchors. Unknown public paths return HTTP 404. The `www` hostname redirects to `https://yarrowtech.in`; both domains must be connected to this Vercel project. Vercel manages HTTPS.

## Verification commands

- `npm run images:optimize`: reproduce the five optimized WebP assets from their preserved PNG originals.
- `npm run build`: compile and prerender the public site; fail on page errors, missing H1 headings or incorrect canonical URLs.
- `npm run seo:check`: verify HTML without JavaScript, metadata, schema, routes, private headers and responsive layouts against a local production fixture.
- `npm run seo:performance`: save simulated-mobile Lighthouse HTML reports and summary JSON in `seo-artifacts/`.
- Backend: `node --test tests/seo-auth.test.js`.

Local routing checks model the Vercel policy. They do not replace testing the deployed response status and headers. After deployment, check `/`, `/services/erp-development`, each product URL, `/sitemap.xml`, `/robots.txt`, a random nonexistent URL (404), `/admin` (noindex header), `/home2` (308), and the www hostname redirect.

## Google Search Console: account step

Sign in to the existing `yarrowtech.in` property. Keep the existing HTML verification token. A Domain property instead needs the DNS record Google provides; do not invent a record or replace an existing one.

After the new build is live:

1. Submit `https://yarrowtech.in/sitemap.xml` under Sitemaps.
2. Use URL Inspection and Test Live URL for the homepage, service landing page and four products. Confirm Google can fetch rendered content and the correct canonical.
3. Request indexing for those important pages. This requests a crawl; it does not guarantee indexing or rankings.
4. Monitor Page indexing, HTTPS and Core Web Vitals reports. Field Core Web Vitals require real traffic and may be unavailable for low-traffic pages. Lighthouse is a lab diagnostic, not proof of field INP or ranking performance.

Account verification, submission, indexing outcomes and field Core Web Vitals cannot be confirmed from local source files.

## Content

Service pages and industry pages use the existing service/product capabilities. The two blog entries are planning guides, not customer-result claims. `/case-studies` explicitly states that no stories have been published, is noindex and excluded from the sitemap. Publish real, approved customer stories before making that section indexable. No fabricated customers, metrics, reviews or schema ratings are included.

## Sources

- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/kb/guide/custom-404-page
