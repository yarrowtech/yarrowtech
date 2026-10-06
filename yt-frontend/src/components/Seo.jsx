import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://yarrowtech.in";
const SITE_NAME = "YarrowTech";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/*
 * Reusable per-page SEO component.
 *
 * Handles:
 * - Page title
 * - Meta description
 * - Canonical URL
 * - Robots directive
 * - Open Graph tags
 * - Twitter tags
 * - Organization schema
 * - WebSite schema
 * - Product schema
 * - Breadcrumb schema
 * - Optional custom schema
 */

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
  breadcrumbs,
  schema,
}) {
  /*
   * Brand-first title.
   *
   * Example:
   * YarrowTech | Custom Software, ERP & Digital Solutions
   */
  const fullTitle = title
    ? `${SITE_NAME} | ${title}`
    : SITE_NAME;

  /*
   * Build the canonical URL.
   *
   * "/" remains "/"
   * "/services/" becomes "/services"
   */
  const cleanPath =
    path === "/"
      ? "/"
      : path.replace(/\/$/, "");

  const url = `${SITE_URL}${cleanPath}`;

  /*
   * Structured data
   */
  const graph = [
    /*
     * YarrowTech Organization
     */
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.png`,
      description:
        "YarrowTech is a software development company providing custom software, ERP, AI, web and mobile application solutions.",
    },

    /*
     * YarrowTech Website
     */
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },

    /*
     * Product structured data
     */
    ...(path.startsWith("/products/") && !noindex
      ? [
          {
            "@type": "SoftwareApplication",
            name: title,
            description,
            url,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web browser",
            publisher: {
              "@id": `${SITE_URL}/#organization`,
            },
          },
        ]
      : []),

    /*
     * Breadcrumb structured data
     */
    ...(breadcrumbs
      ? [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                name: "Home",
                path: "/",
              },
              ...breadcrumbs,
            ].map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: `${SITE_URL}${item.path}`,
            })),
          },
        ]
      : []),

    /*
     * Optional custom schema
     */
    ...(schema ? [schema] : []),
  ];

  return (
    <Helmet>
      {/* =========================
          BASIC SEO
      ========================== */}

      <title>{fullTitle}</title>

      {description && (
        <meta
          name="description"
          content={description}
        />
      )}

      <link
        rel="canonical"
        href={url}
      />

      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow"
        }
      />

      {/* =========================
          STRUCTURED DATA
      ========================== */}

      {!noindex && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": graph,
          }).replace(/</g, "\\u003c")}
        </script>
      )}

      {/* =========================
          OPEN GRAPH
      ========================== */}

      <meta
        property="og:type"
        content="website"
      />

      <meta
        property="og:site_name"
        content={SITE_NAME}
      />

      <meta
        property="og:title"
        content={fullTitle}
      />

      {description && (
        <meta
          property="og:description"
          content={description}
        />
      )}

      <meta
        property="og:url"
        content={url}
      />

      <meta
        property="og:image"
        content={image}
      />

      {/* =========================
          TWITTER / X
      ========================== */}

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={fullTitle}
      />

      {description && (
        <meta
          name="twitter:description"
          content={description}
        />
      )}

      <meta
        name="twitter:image"
        content={image}
      />
    </Helmet>
  );
}