import React, { useEffect, useState } from "react";
import "./Home2Hero.css";
import HeroImg from "../../assets/laptop&phone.png";

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
      <div className="hero-content">
        <div className="hero-copy">
          <h1 className="hero-title">
            Industry-focused <br />
            <span className="highlight">{typedText}</span> <br />
            Development Company
          </h1>

          <p className="hero-subtitle">
            Transform your operations with innovative software, AI-powered systems
            <br />
            and customized ERP solutions designed to scale your business efficiently
          </p>

          <div className="hero-actions">
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
          </div>
        </div>

        <div className="heroImg" aria-hidden="true">
          <img src={HeroImg} alt="Yarrow Tech laptop and phone showcase" />
        </div>
      </div>
    </section>
  );
};

export default Home2Hero;
