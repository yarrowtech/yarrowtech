/* -------------------------------------------------------
   Opt-in build step: snapshots each public route to static
   HTML after `vite build`, so crawlers/bots that don't run
   JavaScript (link previews on WhatsApp/Slack/LinkedIn, some
   search engines) see real content instead of an empty
   <div id="root">. The snapshot still includes the app's own
   script tag, so it hydrates into the normal SPA once loaded
   in a real browser — this only changes what a non-JS fetch
   sees on first load.

   NOT wired into the default `npm run build` — run explicitly
   via `npm run prerender` (which runs the build first). Skips
   authenticated (/admin, /manager, /techlead, /client,
   /product-user) and transactional (/efnbmms/...) routes,
   matching public/robots.txt.
------------------------------------------------------- */
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "..", "dist");
const PORT = 4173;

const ROUTES = [
  "/",
  "/products/electronic-educare",
  "/products/retail-management-system",
  "/products/food-and-beverage-management-system",
  "/products/sportbit",
  "/request-demo",
];

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const urlPath = req.url.split("?")[0];
    let filePath = path.join(DIST_DIR, urlPath);

    if (urlPath === "/" || !path.extname(urlPath)) {
      // SPA route (no file extension) -> serve the shell index.html
      filePath = path.join(DIST_DIR, "index.html");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error("dist/ not found — run `vite build` first (or use `npm run prerender`).");
    process.exit(1);
  }

  // Crawl into memory first — writing straight to dist/index.html mid-loop
  // would make the static server serve an already-hydrated snapshot (not
  // the clean SPA shell) for every route crawled afterward, stacking each
  // route's Helmet tags on top of the previous one's.
  const snapshots = new Map();

  const server = await startStaticServer();
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();

    for (const route of ROUTES) {
      const url = `http://localhost:${PORT}${route}`;
      await page.goto(url, { waitUntil: "networkidle" });
      // Give react-helmet-async a tick to commit title/meta tags.
      await page.waitForTimeout(150);

      snapshots.set(route, await page.content());
      console.log(`Crawled ${route}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  for (const [route, html] of snapshots) {
    const outDir = route === "/" ? DIST_DIR : path.join(DIST_DIR, route.replace(/^\//, ""));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html);
    console.log(`Wrote ${route} -> ${path.relative(DIST_DIR, outDir) || "."}/index.html`);
  }
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
