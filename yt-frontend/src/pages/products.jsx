// import React from 'react'
// import './products.css'
// import { Package } from 'lucide-react'
// import { motion } from 'framer-motion'

// export default function ProductsPage() {
//   const products = [
//     { name: 'Portfolio Website', description: 'Custom portfolio sites for professionals and creators.' },
//     { name: 'E-Commerce Platform', description: 'Responsive online stores with secure payment systems.' },
//     { name: 'Business Website', description: 'Company websites with modern UI and fast performance.' },
//     { name: 'Landing Pages', description: 'High-conversion marketing and product landing pages.' },
//     { name: 'Inventory Management', description: 'Track and manage stock, suppliers, and orders efficiently.' },
//     { name: 'HR Management', description: 'Employee data, payroll, and attendance in one system.' },
//     { name: 'CRM System', description: 'Manage customer interactions and sales pipelines effectively.' },
//     { name: 'Finance Suite', description: 'Automated accounting, invoices, and analytics tools.' },
//   ]

//   // Wave animation for title letters
//   const title = "Our Products"
//   const letters = title.split("")

//   const letterVariants = {
//     hidden: { opacity: 0, y: 40 },
//     visible: (i) => ({
//       opacity: 1,
//       y: 0,
//       transition: { delay: i * 0.05, duration: 0.5, ease: 'easeOut' },
//     }),
//   }

//   // Container and card animations for wave-like appearance
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.15 },
//     },
//   }

//   const cardVariants = {
//     hidden: { opacity: 0, y: 50, rotateX: -10 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       rotateX: 0,
//       transition: { duration: 0.6, ease: 'easeOut' },
//     },
//   }

//   return (
//     <section id="products" className="products-section">
//       <div className="container">
//         {/* Title Animation */}
//         <motion.h2
//           className="title"
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//         >
//           {letters.map((char, i) => (
//             <motion.span key={i} variants={letterVariants} custom={i}>
//               {char === " " ? "\u00A0" : char}
//             </motion.span>
//           ))}
//         </motion.h2>

//         {/* Product Grid */}
//         <motion.div
//           className="products-grid"
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, amount: 0.2 }}
//         >
//           {products.map((product, index) => (
//             <motion.div
//               key={index}
//               className="product-card"
//               variants={cardVariants}
//               whileHover={{ scale: 1.05, rotateY: 5 }}
//               transition={{ type: 'spring', stiffness: 200 }}
//             >
//               <motion.div
//                 className="icon-wrapper"
//                 whileHover={{
//                   rotate: 360,
//                   scale: 1.2,
//                   boxShadow: '0 0 25px rgba(255, 180, 0, 0.8)',
//                 }}
//                 transition={{ duration: 1 }}
//               >
//                 <Package size={40} className="icon" />
//               </motion.div>

//               <h4>{product.name}</h4>
//               <p>{product.description}</p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   )
// }


import React, { useRef } from "react";
import "./products.css";
import { Store, UtensilsCrossed, Trophy } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";

import eecLogo from "../assets/eec-logo.jpg";

export default function ProductsPage() {
  const sectionRef = useRef(null);

  /* Scroll progress for parallax */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const products = [
    {
      name: "EEC – Electronic Educare",
      logo: eecLogo,
      accent: "#f5c542", // Yellow
      description:
        "A unified digital campus combining LMS and ERP into one intelligent ecosystem connecting students, teachers, parents, and administrators.",
    },
    {
      name: "RMS – Retail Management System",
      icon: Store,
      accent: "#4f9cff", // Blue
      description:
        "A web-based retail platform digitizing product, inventory, sales, vendor, and employee operations with real-time insights.",
    },
    {
      name: "F&B – Food & Beverage Management System",
      icon: UtensilsCrossed,
      accent: "#3ccf91", // Green
      description:
        "A modern platform optimizing restaurant operations from orders and inventory to kitchen workflows and financial insights.",
    },
    {
      name: "SportBit – Sports Management System",
      icon: Trophy,
      accent: "#9b7cff", // Purple
      description:
        "A sports ecosystem enabling player discovery, performance analytics, health metrics, and data-driven club decisions.",
    },
  ];

  return (
    <section id="products" ref={sectionRef} className="products-section">
      {/* BACKGROUND AMBIENT MOTION */}
      <motion.div
        className="ambient-particles"
        style={{ y: bgY }}
        aria-hidden
      />

      <div className="container">
        {/* HEADER */}
        <motion.div
          className="products-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="title">Our Products</h2>
          <p className="subtitle">
            Living digital platforms designed to evolve, adapt, and perform.
          </p>
        </motion.div>

        {/* PRODUCT CARDS */}
        <div className="products-list">
          {products.map((product, index) => (
            <AliveCard key={index} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------
   ALIVE CARD COMPONENT
----------------------------------- */
function AliveCard({ product, index }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 80, damping: 15 });
  const springY = useSpring(y, { stiffness: 80, damping: 15 });

  return (
    <motion.div
      className="product-card"
      style={{
        "--accent": product.accent,
        x: springX,
        y: springY,
      }}
      initial={{
        opacity: 0,
        y: 60,
        scale: 0.9,
        filter: "blur(10px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.9,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      viewport={{ once: true, amount: 0.4 }}
      animate={{
        scale: [1, 1.015, 1],
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left - rect.width / 2) / 12);
        y.set((e.clientY - rect.top - rect.height / 2) / 12);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {/* Accent stripe */}
      <div className="accent-bar" />

      {/* LOGO OR ICON */}
      <div className="product-icon">
        {product.logo ? (
          <img
            src={product.logo}
            alt={product.name}
            className="product-logo"
          />
        ) : (
          <product.icon size={26} />
        )}
      </div>

      <h3>{product.name}</h3>
      <p>{product.description}</p>

      <span className="hover-light" />
    </motion.div>
  );
}
