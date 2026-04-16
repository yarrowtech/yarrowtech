import React from "react";
import { motion } from "framer-motion";
import { Code, Smartphone, Cloud, Database, Globe, Layers } from "lucide-react";
import "./services.css";

export default function ServicePage() {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.7, y: 60 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 140 },
    },
  };

  const services = [
    {
      title: "Web Development",
      description:
        "Building responsive, high-performance websites tailored to your business goals.",
      icon: <Globe size={40} />,
    },
    {
      title: "Mobile App Development",
      description:
        "Creating cross-platform mobile applications with seamless user experiences.",
      icon: <Smartphone size={40} />,
    },
    {
      title: "Cloud Solutions",
      description:
        "Empowering businesses with scalable and secure cloud-based infrastructures.",
      icon: <Cloud size={40} />,
    },
    {
      title: "Backend Engineering",
      description:
        "Designing robust APIs and database systems to power your applications.",
      icon: <Database size={40} />,
    },
    {
      title: "UI/UX Design",
      description:
        "Crafting visually stunning and intuitive designs focused on user engagement.",
      icon: <Layers size={40} />,
    },
    {
      title: "Custom Software",
      description:
        "Developing tailored software solutions to solve complex business challenges.",
      icon: <Code size={40} />,
    },
  ];

  return (
    <section id="services" className="services-section">
      {/* Floating Particles */}
      <ul className="floating-particles">
        {Array.from({ length: 40 }).map((_, i) => (
          <li
            key={i}
            style={{
              left: Math.random() * 100 + "%",
              animationDuration: 10 + Math.random() * 12 + "s",
              animationDelay: Math.random() * 5 + "s",
            }}
          ></li>
        ))}
      </ul>

      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="title"
        >
          Our Services
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="subtitle"
        >
          Powerful digital solutions designed to accelerate your business.
        </motion.p>

        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ rotateX: 4, rotateY: 2, scale: 1.03 }}
              className="service-card"
            >
              <div className="icon-ring">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
