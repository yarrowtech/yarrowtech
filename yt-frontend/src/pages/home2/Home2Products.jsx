import React from "react";
import { ArrowRight, GraduationCap, Store, Trophy, UtensilsCrossed } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "../../components/MarketingMotion";
import { products } from "../../data/productData";
import "./Home2Products.css";

const DISPLAY_NAMES = {
  "electronic-educare": "EEC - Electronic Educare",
  "retail-management-system": "ERetailMS - Retail Management System",
  "food-and-beverage-management-system":
    "EFNBMMS - Food & Beverage Management System",
  esportm: "ESPORTM - Sports Management System",
};

const DECO_ICONS = {
  "electronic-educare": GraduationCap,
  "retail-management-system": Store,
  "food-and-beverage-management-system": UtensilsCrossed,
  esportm: Trophy,
};

// Content for the small dashboard preview shown on each card.
const PREVIEWS = {
  "electronic-educare": {
    brand: "EEC",
    nav: ["Dashboard", "Students", "Teachers", "Classes", "Exams", "Reports"],
    stats: [["Students", "1,250"], ["Teachers", "86"]],
    bars: [30, 44, 38, 58, 50, 72, 84],
    chartTitle: "Attendance",
  },
  "retail-management-system": {
    brand: "ERetailMS",
    nav: ["Dashboard", "Products", "Inventory", "Sales", "Vendors", "Reports"],
    stats: [["Total Sales", "₹2,48,500"], ["Products", "2,580"]],
    bars: [28, 40, 34, 56, 48, 68, 88],
    chartTitle: "Sales Overview",
  },
  "food-and-beverage-management-system": {
    brand: "EFNBMMS",
    nav: ["Dashboard", "Orders", "Menu", "Inventory", "Staff", "Reports"],
    stats: [["Today's Orders", "120"], ["Revenue", "₹28,430"]],
    bars: [26, 38, 46, 42, 62, 70, 90],
    chartTitle: "Order Trends",
  },
  esportm: {
    brand: "SportM",
    nav: ["Dashboard", "Players", "Teams", "Matches", "Analytics", "Reports"],
    stats: [["Total Players", "320"], ["Matches", "156"]],
    bars: [32, 44, 40, 58, 52, 74, 86],
    chartTitle: "Performance Overview",
  },
};

export default function Home2Products() {
  return (
    <section id="products" className="v2-products-section">
      <div className="container">
        <motion.div
          className="products-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="products-kicker">Our Products</span>
          <h2 className="title">
            Our <span>Products</span>
          </h2>
          <p className="subtitle">
            Purpose-built platforms for modern businesses
          </p>
        </motion.div>

        <div className="products-list">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const preview = PREVIEWS[product.slug];
  const DecoIcon = DECO_ICONS[product.slug];
  const ProductIcon = product.icon || DecoIcon;
  const openProduct = () => navigate(`/products/${product.slug}`);

  return (
    <motion.div
      className="product-card"
      style={{ "--accent": product.accent }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: (index % 2) * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      whileTap={{ scale: 0.99, transition: { duration: 0.12 } }}
      onClick={openProduct}
    >
      <span className="accent-bar" />
      <span className="card-glow" aria-hidden="true" />

      <div className="card-copy">
        <div className="product-icon">
          {product.logo ? (
            <img src={product.logo} alt="" className="product-logo" />
          ) : (
            <ProductIcon size={30} aria-hidden="true" />
          )}
        </div>

        <span className="product-category">{product.category}</span>
        <h3>{DISPLAY_NAMES[product.slug] || product.name}</h3>
        <p>{product.description}</p>

        <Link
          className="product-detail-link"
          to={`/products/${product.slug}`}
          onClick={(event) => event.stopPropagation()}
          aria-label={`View ${DISPLAY_NAMES[product.slug] || product.name} details`}
        >
          View product details
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {preview && (
        <div className="card-preview" aria-hidden="true">
          {DecoIcon && (
            <DecoIcon className="preview-deco" size={86} strokeWidth={1.2} />
          )}
          <div className="mini-dash">
            <div className="mini-top">
              <b>{preview.brand}</b>
              <i />
            </div>
            <div className="mini-body">
              <ul className="mini-nav">
                {preview.nav.map((item, i) => (
                  <li key={item} className={i === 0 ? "active" : ""}>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mini-main">
                <div className="mini-stats">
                  {preview.stats.map(([label, value]) => (
                    <div key={label}>
                      <small>{label}</small>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
                <div className="mini-chart">
                  <small>{preview.chartTitle}</small>
                  <div className="mini-bars">
                    {preview.bars.map((h, i) => (
                      <span key={i} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
