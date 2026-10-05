import React from "react";
import { motion } from "framer-motion";
import {
  ChartColumn,
  Gem,
  Handshake,
  Lightbulb,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import logo from "../../assets/logo.png";
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

const values = [
  {
    icon: Lightbulb,
    title: "Innovation that Drives Growth",
    desc: "We innovate with purpose—building modern, scalable, and future-ready software that keeps your business ahead in a rapidly evolving digital world.",
  },
  {
    icon: Users,
    title: "Client-Centric Approach",
    desc: "Every project starts with understanding your goals. We design tailored, user-friendly, and outcome-driven solutions that solve real business problems.",
  },
  {
    icon: ShieldCheck,
    title: "Quality & Reliability",
    desc: "We follow rigorous development and testing practices to ensure high performance, stability, security, and long-term reliability.",
  },
  {
    icon: Handshake,
    title: "Transparency & Trust",
    desc: "We maintain clear communication and provide complete visibility at every stage to build partnerships rooted in trust.",
  },
  {
    icon: Settings,
    title: "Future-Focused Technology",
    desc: "We leverage cutting-edge technologies including AI, cloud computing, IoT, and data analytics to future-proof your business.",
  },
  {
    icon: Trophy,
    title: "Commitment to Excellence",
    desc: "We constantly refine our craft to deliver high-quality solutions that exceed expectations and create long-lasting business value.",
  },
];

export default function Home2About() {
  return (
    <section id="about" className="v2-about-section">
      <span className="ab-dots ab-dots-a" aria-hidden="true" />
      <span className="ab-dots ab-dots-b" aria-hidden="true" />

      <div className="container">
        <div className="about-top">
          <motion.div
            className="about-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="ring ring-outer" aria-hidden="true" />
            <span className="ring ring-orbit" aria-hidden="true" />
            <span className="blob-glow" aria-hidden="true" />
            <div className="blob-frame">
              <img
                className="blob-logo"
                src={logo}
                alt="YarrowTech"
                width="220"
                height="220"
              />
              <span className="blob-brand">YarrowTech</span>
            </div>
            <span className="orb orb-a" aria-hidden="true" />
            <span className="orb orb-b" aria-hidden="true" />

            <div className="about-chip chip-team">
              <span className="chip-icon">
                <Users size={22} aria-hidden="true" />
              </span>
              <span>
                Passionate
                <br />
                Team
              </span>
            </div>
            <div className="about-chip chip-innov">
              <span className="chip-icon">
                <Lightbulb size={22} aria-hidden="true" />
              </span>
              <span>
                Innovative
                <br />
                Solutions
              </span>
            </div>
            <div className="about-chip chip-growth">
              <span className="chip-icon">
                <ChartColumn size={22} aria-hidden="true" />
              </span>
              <span>
                Future
                <br />
                Growth
              </span>
            </div>
          </motion.div>

          <motion.div
            className="about-text"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={gridVariants}
          >
            <motion.span className="about-pill" variants={fadeUp}>
              <i aria-hidden="true" />
              About Us
            </motion.span>
            <motion.h2 className="title" variants={fadeUp}>
              About <span>Us</span>
            </motion.h2>

            <motion.p className="desc" variants={fadeUp}>
              <span className="v2-highlight">YarrowTech</span>, we are a
              next-generation software development company dedicated to
              transforming ideas into intelligent, high-impact digital solutions.
              Our expertise spans custom software development, ERP systems,
              AI-driven applications, and full-stack web and mobile
              development—built to support the evolving needs of modern
              businesses.
            </motion.p>

            <motion.p className="desc" variants={fadeUp}>
              Our mission is to empower organizations to streamline operations,
              enhance productivity, and scale confidently through secure,
              high-performance, and future-ready technology.
            </motion.p>

            <motion.p className="desc last-para" variants={fadeUp}>
              Backed by a passionate team of engineers, designers, and technology
              strategists, we deliver end-to-end solutions rooted in innovation,
              precision, and integrity—ensuring every product we build is
              reliable, impactful, and aligned with your long-term vision.
            </motion.p>
          </motion.div>
        </div>

        <div className="values-section">
          <motion.div
            className="values-head"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <span className="about-pill">
              <Gem size={15} aria-hidden="true" />
              Our Values
            </span>
            <h3 className="values-title">
              Our Core <span>Values</span>
            </h3>
          </motion.div>

          <motion.div
            className="values-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={gridVariants}
          >
            {values.map(({ icon: Icon, title, desc }, i) => (
              <motion.div className="value-card-wrap" key={title} variants={fadeUp}>
                <div className="value-card">
                  <span className="value-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="value-icon">
                    <Icon size={28} aria-hidden="true" />
                  </span>
                  <div className="value-body">
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
