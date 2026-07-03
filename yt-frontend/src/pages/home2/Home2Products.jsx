import React, { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { products } from "../../data/productData";
import "./Home2Products.css";

export default function Home2Products() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      id="products"
      ref={sectionRef}
      className="v2-products-section"
      style={{ position: "relative" }}
    >
      <motion.div
        className="v2-ambient-particles"
        style={{ y: bgY }}
        aria-hidden="true"
      />

      <div className="container">
        <motion.div
          className="products-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="title">Our Products</h2>
          <p className="subtitle">
            Choose ready digital platforms built to reduce manual work, connect
            your teams, and give every business owner clearer control over daily
            operations.
          </p>
          <p className="products-writeup">
            Each product is practical, customizable, and designed for real users:
            administrators, managers, staff, customers, students, parents,
            coaches, and decision-makers. Start with what you need today, then
            expand modules as your organization grows.
          </p>
        </motion.div>

        <div className="products-list">
          {products.map((product, index) => (
            <AliveCard key={product.slug} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AliveCard({ product, index }) {
  const navigate = useNavigate();

  const openProduct = () => navigate(`/products/${product.slug}`);

  return (
    <motion.div
      className="product-card"
      role="button"
      tabIndex={0}
      style={{ "--accent": product.accent }}
      initial={{
        opacity: 0,
        y: 40,
        scale: 0.94,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={{
        y: -10,
        scale: 1.025,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.12 },
      }}
      onClick={openProduct}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProduct();
        }
      }}
    >
      <div className="accent-bar" />

      <div className="product-icon">
        {product.logo ? (
          <img src={product.logo} alt={product.name} className="product-logo" />
        ) : (
          <product.icon size={26} />
        )}
      </div>

      <span className="product-category">{product.category}</span>
      <h3>{product.name}</h3>
      <p>{product.description}</p>

      <span className="product-detail-link">
        View product details
        <ArrowUpRight size={17} aria-hidden="true" />
      </span>

      <span className="hover-light" />
    </motion.div>
  );
}
