import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { publicRoutes, redirects } from './public-routes.mjs';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };

// Local production fixture matching the explicit Vercel route policy.
export async function startPreview() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (pathname !== '/' && pathname.endsWith('/')) { res.writeHead(308, { Location: pathname.slice(0, -1) + url.search }); res.end(); return; }
    if (redirects[pathname]) { res.writeHead(308, { Location: redirects[pathname] }); res.end(); return; }
    let file;
    let status = 200;
    if (publicRoutes.includes(pathname)) file = path.join(dist, pathname.slice(1), 'index.html');
    else if (/^\/(admin|manager|techlead|client|product-user)(\/|$)/.test(pathname) || /^\/efnbmms\/(signup|vendor\/signup)$/.test(pathname)) {
      file = path.join(dist, 'app-shell.html');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    } else {
      file = path.resolve(dist, '.' + pathname);
      if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return; }
      try { if (!(await fs.stat(file)).isFile()) throw new Error(); }
      catch { file = path.join(dist, '404.html'); status = 404; }
    }
    try {
      const type = mime[path.extname(file)] || 'application/octet-stream';
      let content = await fs.readFile(file);
      if (/(text|xml|javascript)/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) {
        content = gzipSync(content);
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
      }
      res.writeHead(status, { 'Content-Type': type }); res.end(content);
    }
    catch { res.writeHead(500); res.end('Build the frontend first.'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}
