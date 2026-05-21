import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CheckCircle2, UsersRound } from "lucide-react";
import { getProductBySlug } from "../data/productData";
import "./ProductDetailsPage.css";

export default function ProductDetailsPage() {
  const { productSlug } = useParams();
  const product = getProductBySlug(productSlug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [productSlug]);

  if (!product) {
    return (
      <main className="product-detail-page">
        <section className="product-detail-empty">
          <h1>Product not found</h1>
          <p>The product you are looking for is not available.</p>
          <Link to="/products" className="product-back-link">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to products
          </Link>
        </section>
      </main>
    );
  }

  const ProductIcon = product.icon;
  const hasProductLink = Boolean(product.productUrl);

  return (
    <main
      className="product-detail-page"
      style={{ "--product-accent": product.accent }}
    >
      <section className="product-detail-hero">
        <div className="product-detail-shell">
          <Link to="/products" className="product-back-link">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to products
          </Link>

          <div className="product-detail-grid">
            <div className="product-detail-copy">
              <span className="product-detail-category">
                {product.category}
              </span>
              <h1>{product.name}</h1>
              <p className="product-detail-description">
                {product.description}
              </p>
              <p className="product-detail-writeup">{product.writeup}</p>

              {hasProductLink ? (
                <a
                  className="product-explore-btn"
                  href={product.productUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore This Product
                  <ArrowUpRight size={19} aria-hidden="true" />
                </a>
              ) : (
                <button className="product-explore-btn disabled" type="button" disabled>
                  Product Link Coming Soon
                </button>
              )}
            </div>

            <div className="product-detail-panel">
              <div className="product-detail-icon">
                {product.logo ? (
                  <img src={product.logo} alt={product.name} />
                ) : (
                  <ProductIcon size={44} aria-hidden="true" />
                )}
              </div>
              <h2>{product.shortName}</h2>
              <p>
                Built for teams that want fewer manual tasks, better visibility,
                and a digital workflow that can grow with the organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="product-detail-content">
        <div className="product-detail-shell product-detail-columns">
          <article className="product-info-block">
            <div className="product-info-heading">
              <UsersRound size={22} aria-hidden="true" />
              <h2>Who Can Use It</h2>
            </div>
            <ul>
              {product.audience.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="product-info-block">
            <div className="product-info-heading">
              <CheckCircle2 size={22} aria-hidden="true" />
              <h2>Key Features</h2>
            </div>
            <ul>
              {product.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="product-detail-shell">
          <div className="product-outcomes">
            {product.outcomes.map((item) => (
              <div className="product-outcome-card" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
