import React from "react";
import { motion } from "framer-motion";
import "./Home2About.css";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function Home2About() {
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
    <section id="about" className="v2-about-section">
      <div className="container">

        <motion.div
          className="about-text"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={gridVariants}
        >
          <motion.h2 className="title" variants={fadeUp}>About Us</motion.h2>

          <motion.p className="desc" variants={fadeUp}>
            <span className="v2-highlight">YarrowTech</span>, we are a next-generation software development
            company dedicated to transforming ideas into intelligent, high-impact digital solutions.
            Our expertise spans custom software development, ERP systems, AI-driven applications,
            and full-stack web and mobile development—built to support the evolving needs
            of modern businesses.
          </motion.p>

          <motion.p className="desc" variants={fadeUp}>
            Our mission is to empower organizations to streamline operations, enhance productivity,
            and scale confidently through secure, high-performance, and future-ready technology.
          </motion.p>

          <motion.p className="desc last-para" variants={fadeUp}>
            Backed by a passionate team of engineers, designers, and technology strategists,
            we deliver end-to-end solutions rooted in innovation, precision, and integrity—
            ensuring every product we build is reliable, impactful, and aligned with your
            long-term vision.
          </motion.p>
        </motion.div>

        <div className="values-section">
          <h3 className="values-title">Our Core Values</h3>

          <motion.div
            className="values-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={gridVariants}
          >
            {values.map((v, i) => (
              <motion.div className="value-card-wrap" key={i} variants={fadeUp}>
                <div className="value-card">
                  <h4>{v.title}</h4>
                  <p>{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
