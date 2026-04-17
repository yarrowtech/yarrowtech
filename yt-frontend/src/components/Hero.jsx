import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added
import "./Hero.css";
import HeroImg from "../assets/laptop.png";
import HeroParticles from "./HeroParticles";

const Hero = () => {
  const navigate = useNavigate(); // ✅ navigation hook

  const words = ["Website", "AI Systems", "Mobile App", "Software", "ERP System"];
  const [wordIndex, setWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let i = 0;
    const word = words[wordIndex];
    setTypedText("");

    const typing = setInterval(() => {
      setTypedText(word.slice(0, i + 1));
      i++;
      if (i === word.length) clearInterval(typing);
    }, 80);

    const next = setTimeout(
      () => setWordIndex((p) => (p + 1) % words.length),
      2800
    );

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

        {/* ✅ UPDATED BUTTON */}
        <button
          className="cta-btn"
          onClick={() => {
            navigate("/request-demo"); // redirect to demo page
            window.scrollTo(0, 0); // optional UX
          }}
        >
          Get a Free Quote
        </button>
      </div>
    </section>
  );
};

export default Hero;