import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Home2Hero.css";
import HeroImg from "../../assets/result.png";

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

const Home2Hero = () => {
  const words = ["Website", "AI Systems", "Mobile App", "Software", "ERP System"];
  const [wordIndex, setWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let i = 0;
    const word = words[wordIndex];
    setTypedText("");

    const typing = setInterval(() => {
      setTypedText(word.slice(0, i + 1));
      i += 1;

      if (i === word.length) {
        clearInterval(typing);
      }
    }, 80);

    const next = setTimeout(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2800);

    return () => {
      clearInterval(typing);
      clearTimeout(next);
    };
  }, [wordIndex]);

  return (
    <section id="home" className="v2-hero">
      <motion.div
        className="hero-content"
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="hero-copy">
          <motion.h1 className="hero-title" variants={heroItemVariants}>
            Industry-focused <br />
            <span className="highlight">{typedText}</span> <br />
            Development Company
          </motion.h1>

          <motion.p className="hero-subtitle" variants={heroItemVariants}>
            Transform your operations with innovative software, AI-powered systems
            <br />
            and customized ERP solutions designed to scale your business efficiently
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
              Get Free Demo
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
              Explore Our Product
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
      </motion.div>
    </section>
  );
};

export default Home2Hero;

