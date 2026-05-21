import React, { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { products } from "../data/productData";
import "./products.css";

export default function ProductsPage() {
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
      className="products-section"
      style={{ position: "relative" }}
    >
      <motion.div
        className="ambient-particles"
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 80, damping: 15 });
  const springY = useSpring(y, { stiffness: 80, damping: 15 });

  const openProduct = () => navigate(`/products/${product.slug}`);

  return (
    <motion.div
      className="product-card"
      role="button"
      tabIndex={0}
      style={{
        "--accent": product.accent,
        x: springX,
        y: springY,
      }}
      initial={{
        opacity: 0,
        y: 60,
        scale: 0.9,
        filter: "blur(10px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.9,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      viewport={{ once: true, amount: 0.4 }}
      animate={{
        scale: [1, 1.015, 1],
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) / 12);
        y.set((event.clientY - rect.top - rect.height / 2) / 12);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
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
