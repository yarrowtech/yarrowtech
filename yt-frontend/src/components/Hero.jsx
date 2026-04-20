import React, { useEffect, useState } from "react";
import "./Hero.css";
import HeroImg from "../assets/laptop.png";
import HeroParticles from "./HeroParticles";

const Hero = () => {
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
    <section id="home" className="hero">
      <HeroParticles />

      <div className="hero-content">
        <div className="heroImg">
          <img src={HeroImg} alt="ERP Laptop" />
        </div>

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

        <button
          className="cta-btn"
          onClick={() => {
            if (typeof window !== "undefined" && window.openFreeTrialModal) {
              window.openFreeTrialModal();
            }
          }}
        >
          Get a Free Quote
        </button>
      </div>
    </section>
  );
};

export default Hero;
