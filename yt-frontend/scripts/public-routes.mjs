import { services, industries, articles } from '../src/data/marketingContent.js';
export const productSlugs = ['electronic-educare', 'retail-management-system', 'food-and-beverage-management-system', 'esportm'];
export const indexableRoutes = ['/', '/services', '/products', '/industries', '/blog', '/contact', '/request-demo', ...services.map(item => `/services/${item.slug}`), ...industries.map(item => `/industries/${item.slug}`), ...articles.map(item => `/blog/${item.slug}`), ...productSlugs.map(slug => `/products/${slug}`)];
export const publicRoutes = [...indexableRoutes, '/case-studies'];
export const privatePattern = '^/(admin|manager|techlead|client|product-user|efnbmms)(/|$)';
export const redirects = { '/home2': '/', '/home-classic': '/', '/expertise': '/#expertise', '/faq': '/#faq', '/about': '/#about', '/blogs': '/blog' };
