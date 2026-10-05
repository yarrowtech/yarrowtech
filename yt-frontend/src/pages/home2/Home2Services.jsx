import React from "react";
import { Link } from "react-router-dom";
import { motion } from "../../components/MarketingMotion";
import {
  ArrowRight,
  Code,
  Cloud,
  Database,
  Bot,
  Globe,
  Smartphone,
} from "lucide-react";
import laptopImg from "../../assets/planlaptop.webp";
import mobileImg from "../../assets/mobile.webp";
import cloudImg from "../../assets/cloud.webp";
import backendImg from "../../assets/backend.webp";
import softwareImg from "../../assets/software.webp";
import aiAgentImg from "../../assets/aiagent.webp";
import "./Home2Services.css";

/* ---------- Illustrations (inline SVG, no external images) ---------- */
const O1 = "#ffb347";
const O2 = "#f97316";

function WebArt() {
  return (
    <img
      className="service-photo"
      src={laptopImg}
      alt=""
      width="760"
      height="507"
      loading="lazy"
    />
  );
}

function MobileArt() {
  return (
    <img
      className="service-photo is-mobile"
      src={mobileImg}
      alt=""
      width="640"
      height="582"
      loading="lazy"
    />
  );
}

function CloudArt() {
  return (
    <img
      className="service-photo is-cloud"
      src={cloudImg}
      alt=""
      width="720"
      height="480"
      loading="lazy"
    />
  );
}

function BackendArt() {
  return (
    <img
      className="service-photo is-cloud"
      src={backendImg}
      alt=""
      width="720"
      height="480"
      loading="lazy"
    />
  );
}

function AiArt() {
  return (
    <img
      className="service-photo is-cloud"
      src={aiAgentImg}
      alt=""
      width="760"
      height="507"
      loading="lazy"
    />
  );
}

function CodeArt() {
  return (
    <img
      className="service-photo is-cloud"
      src={softwareImg}
      alt=""
      width="720"
      height="480"
      loading="lazy"
    />
  );
}

const services = [
  {
    title: "Web Development",
    slug: "web-development",
    description:
      "Building responsive, high-performance websites tailored to your business goals.",
    icon: Globe,
    Art: WebArt,
  },
  {
    title: "Mobile App Development",
    slug: "mobile-app-development",
    description:
      "Creating cross-platform mobile applications with seamless user experiences.",
    icon: Smartphone,
    Art: MobileArt,
  },
  {
    title: "Cloud Solutions",
    slug: "cloud-solutions",
    description:
      "Empowering businesses with scalable and secure cloud-based infrastructures.",
    icon: Cloud,
    Art: CloudArt,
  },
  {
    title: "Backend Engineering",
    slug: "backend-engineering",
    description:
      "Designing robust APIs and database systems to power your applications.",
    icon: Database,
    Art: BackendArt,
  },
  {
    title: "AI Marketing Agents",
    slug: "ai-solutions",
    description:
      "Deploying intelligent AI agents that automate campaigns, content, and lead engagement to grow your brand.",
    icon: Bot,
    Art: AiArt,
  },
  {
    title: "Custom Software",
    slug: "custom-software-development",
    description:
      "Developing tailored software solutions to solve complex business challenges.",
    icon: Code,
    Art: CodeArt,
  },
];

export default function Home2Services() {
  return (
    <section id="services" className="v2-services-section">
      <span className="svc-dots svc-dots-left" aria-hidden="true" />
      <span className="svc-dots svc-dots-right" aria-hidden="true" />

      <div className="container">
        <motion.div
          className="services-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="services-kicker">Our Services</span>
          <h2 className="title">
            Our <span>Services</span>
          </h2>
          <p className="subtitle">
            Powerful digital solutions designed to accelerate your business.
          </p>
        </motion.div>

        <div className="services-grid">
          {services.map(({ title, slug, description, icon: Icon, Art }, index) => (
            <motion.article
              key={title}
              className="service-card"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.55,
                delay: (index % 3) * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
            >
              <span className="service-num">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="service-copy">
                <div className="icon-ring">
                  <Icon size={26} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <Link
                  className="service-link"
                  to={`/services/${slug}`}
                  aria-label={`Explore ${title} service`}
                >
                  Explore Service
                  <span className="service-arrow">
                    <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              </div>

              <div className="service-art" aria-hidden="true">
                <Art />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
