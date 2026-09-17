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
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = `${SITE_URL}${path === "/" ? "/" : path.replace(/\/$/, "")}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

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
