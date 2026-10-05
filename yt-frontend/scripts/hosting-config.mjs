import fs from 'node:fs/promises';
import { publicRoutes, indexableRoutes, redirects } from './public-routes.mjs';
const config = {
  buildCommand: 'npm run build', outputDirectory: 'dist',
  routes: [
    { src: '/(.*)', headers: { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Strict-Transport-Security': 'max-age=31536000', 'Content-Security-Policy': "frame-ancestors 'self'", 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' }, continue: true },
    { src: '/(.*)', has: [{ type: 'host', value: 'www.yarrowtech.in' }], status: 308, headers: { Location: 'https://yarrowtech.in/$1' } },
    { src: '/(.+)/', status: 308, headers: { Location: '/$1' } },
    ...Object.entries(redirects).map(([src, dest]) => ({ src, status: 308, headers: { Location: dest } })),
    ...publicRoutes.map(route => ({ src: route, dest: route === '/' ? '/index.html' : `${route}/index.html` })),
    { src: '/(admin|manager|techlead|client|product-user)(/.*)?', dest: '/app-shell.html', headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    { src: '/efnbmms/(signup|vendor/signup)', dest: '/app-shell.html', headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    { src: '/app-shell.html', headers: { 'X-Robots-Tag': 'noindex, nofollow' }, continue: true },
    { src: '/assets/(.*)', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/404.html', status: 404 },
  ],
};
await fs.writeFile(new URL('../vercel.json', import.meta.url), JSON.stringify(config, null, 2) + '\n');
await fs.writeFile(new URL('../public/sitemap.xml', import.meta.url), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + indexableRoutes.map(route => `  <url><loc>https://yarrowtech.in${route}</loc></url>`).join('\n') + '\n</urlset>\n');
