import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import "./Home2Hero.css";
import HeroImg from "../../assets/result.png";
import eecImage from "../../assets/eec.png";
import retailImage from "../../assets/eretailms.png";
import foodImage from "../../assets/efnbmms.png";
import sportsImage from "../../assets/esportm.png";
import { products } from "../../data/productData";

const productImages = {
  "electronic-educare": eecImage,
  "retail-management-system": retailImage,
  "food-and-beverage-management-system": foodImage,
  sportbit: sportsImage,
};

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const EYEBROW_WORDS = ["Software", "AI Systems", "Mobile App", "ERP System"];

const Home2Hero = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setWordIndex((prev) => (prev + 1) % EYEBROW_WORDS.length),
      2200
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="v2-hero">
      <motion.div
        className="hero-content"
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="hero-copy">
          <motion.p className="hero-kicker" variants={heroItemVariants}>
            Industry-focused
          </motion.p>
          <motion.div className="hero-eyebrow" variants={heroItemVariants} aria-live="polite">
            <AnimatePresence initial={false}>
              <motion.span
                key={EYEBROW_WORDS[wordIndex]}
                className="hero-eyebrow-word"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {EYEBROW_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.div>
          <motion.h1 className="hero-title" variants={heroItemVariants}>
            Development <br />
            <span className="highlight">Company</span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={heroItemVariants}>
            Transform your operations with innovative software, AI-powered systems
            and customized ERP solutions designed to scale your business efficiently.
          </motion.p>

          <motion.div className="hero-actions" variants={heroItemVariants}>
            <button
              className="cta-btn"
              onClick={() => {
                if (typeof window !== "undefined" && window.openFreeTrialModal) {
                  window.openFreeTrialModal();
                }
              }}
            >
              Get Free Demo <ArrowRight size={17} aria-hidden="true" />
            </button>

            <button
              className="cta-btn secondary-cta-btn"
              onClick={() => {
                const productsSection = document.getElementById("products");
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Explore Our Products <ArrowRight size={17} aria-hidden="true" />
            </button>
          </motion.div>

        </div>

        <motion.div
          className="heroImg"
          aria-hidden="true"
          variants={heroItemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        >
          <img src={HeroImg} alt="Yarrow Tech laptop and phone showcase" />
        </motion.div>

        <motion.div className="hero-products-strip" variants={heroItemVariants}>
          <div className="hero-products-heading">
            <h2 className="hero-products-label">Our Products</h2>
            <a className="hero-products-all" href="#products">
              View All Products <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-products-grid">
            {products.map((product) => (
              <div key={product.slug} className="hero-product-card">
                <Link
                  className="hero-product-link"
                  to={`/products/${product.slug}`}
                  aria-label={`View ${product.shortName} product`}
                >
                  <img
                    src={productImages[product.slug]}
                    alt={`${product.shortName} product preview`}
                    className="hero-product-image"
                    width="1254"
                    height="1254"
                  />
                  <span className="hero-product-arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Home2Hero;

