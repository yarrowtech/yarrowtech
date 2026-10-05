import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://yarrowtech.in";
const SITE_NAME = "YarrowTech";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/* Reusable per-page SEO tags: title, description, canonical, and
   Open Graph / Twitter previews. path is the route (e.g. "/products"),
   used to build the canonical/OG URL — always pass it for a real page. */
export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
  breadcrumbs,
  schema,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = `${SITE_URL}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
  const graph = [
    { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: `${SITE_URL}/` },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/`, publisher: { '@id': `${SITE_URL}/#organization` } },
    ...(path.startsWith('/products/') && !noindex ? [{ '@type': 'SoftwareApplication', name: title, description, url, applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser', publisher: { '@id': `${SITE_URL}/#organization` } }] : []),
    ...(breadcrumbs ? [{ '@type': 'BreadcrumbList', itemListElement: [{ name: 'Home', path: '/' }, ...breadcrumbs].map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: `${SITE_URL}${item.path}` })) }] : []),
    ...(schema ? [schema] : []),
  ];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      {!noindex && <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
