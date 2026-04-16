import React from "react";
import "./about.css";

export default function AboutUs() {
  const values = [
    {
      title: "Innovation that Drives Growth",
      desc: "We innovate with purpose—building modern, scalable, and future-ready software that keeps your business ahead in a rapidly evolving digital world.",
    },
    {
      title: "Client-Centric Approach",
      desc: "Every project starts with understanding your goals. We design tailored, user-friendly, and outcome-driven solutions that solve real business problems.",
    },
    {
      title: "Quality & Reliability",
      desc: "We follow rigorous development and testing practices to ensure high performance, stability, security, and long-term reliability.",
    },
    {
      title: "Transparency & Trust",
      desc: "We maintain clear communication and provide complete visibility at every stage to build partnerships rooted in trust.",
    },
    {
      title: "Future-Focused Technology",
      desc: "We leverage cutting-edge technologies including AI, cloud computing, IoT, and data analytics to future-proof your business.",
    },
    {
      title: "Commitment to Excellence",
      desc: "We constantly refine our craft to deliver high-quality solutions that exceed expectations and create long-lasting business value.",
    },
  ];

  return (
    <section id="about" className="about-section">
      <div className="container">

        {/* -------- ABOUT TEXT -------- */}
        <div className="about-text">
          <h2 className="title">About Us</h2>

          <p className="desc">
             <span className="highlight">YarrowTech</span>, we are a next-generation software development
            company dedicated to transforming ideas into intelligent, high-impact digital solutions.
            Our expertise spans custom software development, ERP systems, AI-driven applications,
            and full-stack web and mobile development—built to support the evolving needs
            of modern businesses.
          </p>

          <p className="desc">
            Our mission is to empower organizations to streamline operations, enhance productivity,
            and scale confidently through secure, high-performance, and future-ready technology.
          </p>

          <p className="desc last-para">
            Backed by a passionate team of engineers, designers, and technology strategists,
            we deliver end-to-end solutions rooted in innovation, precision, and integrity—
            ensuring every product we build is reliable, impactful, and aligned with your
            long-term vision.
          </p>
        </div>

        {/* -------- CORE VALUES -------- */}
        <div className="values-section">
          <h3 className="values-title">Our Core Values</h3>

          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card" key={i}>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
