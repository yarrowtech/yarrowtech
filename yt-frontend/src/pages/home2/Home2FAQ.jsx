import React, { useState } from "react";
import {
  Bot,
  Building2,
  ChartColumn,
  ChevronDown,
  CircleHelp,
  Cloud,
  CreditCard,
  Database,
  Gamepad2,
  GraduationCap,
  Headphones,
  Laptop,
  Layers,
  LayoutGrid,
  Network,
  Settings,
  ShoppingCart,
  Smartphone,
  Store,
  UtensilsCrossed,
  Users,
  Workflow,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Home2FAQ.css";

const faqs = [
  {
    icon: Laptop,
    question: "What services does YarrowTech provide?",
    answer:
      "We provide website development, mobile app development, ERP systems, custom software, cloud solutions, backend engineering, UI/UX design, and AI-powered business systems.",
  },
  {
    icon: Layers,
    question: "Can you build a custom ERP for my business?",
    answer:
      "Yes. We build custom ERP platforms based on your workflow, including modules for clients, projects, payments, inventory, employees, reporting, and role-based dashboards.",
  },
  {
    icon: LayoutGrid,
    question: "Which products are available from YarrowTech?",
    answer:
      "Our product ecosystem includes EEC, ERETAILMS, EFNBMMS, and ESPORTM for education, retail, food and beverage, and sports management.",
  },
  {
    icon: Building2,
    question: "Can any business or organization use your products?",
    answer:
      "Yes. Our products are built for real business use and can be adapted for schools, retail stores, restaurants, food businesses, sports clubs, academies, and growing organizations.",
  },
  {
    icon: GraduationCap,
    question: "Who can use Electronic Educare?",
    answer:
      "Electronic Educare is useful for schools, colleges, coaching institutes, training centers, teachers, students, parents, and administrators who need one platform for learning and campus management.",
  },
  {
    icon: ShoppingCart,
    question: "Who can use ERETAILMS?",
    answer:
      "Retail shops, supermarkets, distributors, wholesalers, franchise stores, and product-based businesses can use it to manage inventory, billing, vendors, employees, and daily sales.",
  },
  {
    icon: UtensilsCrossed,
    question: "Who can use EFNBMMS?",
    answer:
      "Restaurants, cafes, cloud kitchens, bakeries, hotels, and food chains can use it to manage orders, inventory, kitchen workflows, menu operations, financial tracking, and ERP-level business visibility.",
  },
  {
    icon: Gamepad2,
    question: "Who can use ESPORTM?",
    answer:
      "ESPORTM is designed for sports academies, clubs, coaches, players, tournament organizers, and sports institutions that need player profiles, performance tracking, and data-driven management.",
  },
  {
    icon: Settings,
    question: "Can your products be customized for my company?",
    answer:
      "Yes. We can customize modules, dashboards, user roles, reports, branding, workflows, and integrations based on how your company operates.",
  },
  {
    icon: Cloud,
    question: "Can users access your products from anywhere?",
    answer:
      "Yes. Our products can be deployed as web-based platforms so authorized users can access them from office, home, or field locations using a secure login.",
  },
  {
    icon: Users,
    question: "Do your products support different user roles?",
    answer:
      "Yes. Products can include role-based access for admins, managers, staff, clients, students, parents, coaches, players, or other users depending on the product.",
  },
  {
    icon: ChartColumn,
    question: "Can reports and analytics be included in the products?",
    answer:
      "Yes. We can add dashboards, charts, financial summaries, attendance reports, inventory reports, performance analytics, and other business insights.",
  },
  {
    icon: CreditCard,
    question: "Can your products manage payments or invoices?",
    answer:
      "Yes. Payment tracking, invoice generation, due reminders, transaction history, and payment summaries can be added based on the product requirement.",
  },
  {
    icon: LayoutGrid,
    question: "Can we use only selected modules from a product?",
    answer:
      "Yes. You do not need to use every module. We can provide only the modules your organization needs and expand the system later when required.",
  },
  {
    icon: Database,
    question: "Can product data be migrated from our old system?",
    answer:
      "Yes. If you already have data in spreadsheets or another system, we can help migrate important records such as users, products, inventory, students, orders, or clients.",
  },
  {
    icon: Store,
    question: "Are your products suitable for small businesses?",
    answer:
      "Yes. Our products can be configured for small teams and growing businesses, then scaled with more users, branches, modules, and reports as operations expand.",
  },
  {
    icon: Network,
    question: "Can your products be used by multiple branches?",
    answer:
      "Yes. Multi-branch support can be added for schools, retail chains, restaurants, academies, and organizations that need centralized control with branch-level access.",
  },
  {
    icon: Smartphone,
    question: "Do you create both web and mobile applications?",
    answer:
      "Yes. We create responsive websites, web applications, admin portals, and mobile apps with a focus on performance, usability, and long-term scalability.",
  },
  {
    icon: Bot,
    question: "Can AI features be added to our software?",
    answer:
      "Yes. We can add AI-driven automation, analytics, chat support, recommendations, document processing, and smart workflow assistance depending on your business needs.",
  },
  {
    icon: Workflow,
    question: "How does the project development process work?",
    answer:
      "We start by understanding your requirements, then plan the features, design the user experience, develop the system, test it carefully, and support deployment.",
  },
  {
    icon: Headphones,
    question: "Do you provide support after project delivery?",
    answer:
      "Yes. We can provide maintenance, feature upgrades, bug fixes, performance improvements, hosting support, and ongoing technical guidance after launch.",
  },
];


function FaqArt() {
  return (
    <svg viewBox="0 0 300 520" aria-hidden="true">
      <defs>
        <linearGradient id="fq-or" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc15a" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="fq-or2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <ellipse cx="150" cy="470" rx="130" ry="26" fill="#f6dcc0" opacity=".55" />
      {/* big question mark */}
      <path
        d="M96 150 C92 92 134 56 182 62 C236 68 262 118 238 164 C222 194 188 206 182 242 L182 262"
        fill="none" stroke="url(#fq-or)" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="182" cy="320" r="28" fill="url(#fq-or)" />
      {/* small ? bubble */}
      <g transform="translate(18 66) rotate(-8)">
        <rect width="64" height="58" rx="15" fill="url(#fq-or)" />
        <path d="M18 58 l-8 18 l26 -12 Z" fill="#f97316" />
        <text x="32" y="43" textAnchor="middle" fontSize="40" fontWeight="800" fill="#fff">?</text>
      </g>
      {/* dots bubble */}
      <g transform="translate(34 218)">
        <rect width="92" height="58" rx="18" fill="#ffffff" stroke="#f3e3d1" />
        <path d="M70 58 l14 14 l-4 -14 Z" fill="#ffffff" stroke="#f3e3d1" />
        <circle cx="28" cy="29" r="6" fill="#ffb347" />
        <circle cx="46" cy="29" r="6" fill="#f97316" />
        <circle cx="64" cy="29" r="6" fill="#ffb347" />
      </g>
      {/* FAQ card */}
      <g transform="translate(26 296) rotate(-4)">
        <rect x="-4" y="6" width="150" height="176" rx="16" fill="#f4c27a" />
        <rect width="150" height="176" rx="16" fill="#ffffff" stroke="#f3e3d1" />
        <text x="75" y="48" textAnchor="middle" fontSize="30" fontWeight="800" fill="#2a140a">FAQ</text>
        {[72, 108, 144].map((y) => (
          <g key={y}>
            <circle cx="30" cy={y} r="11" fill="url(#fq-or2)" />
            <path d={`M25 ${y} l4 4 l7 -9`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="50" y={y - 8} width="76" height="6" rx="3" fill="#e6e9ef" />
            <rect x="50" y={y + 3} width="52" height="6" rx="3" fill="#eef0f4" />
          </g>
        ))}
      </g>
      {/* orange speech */}
      <g transform="translate(176 346) rotate(8)">
        <rect width="84" height="54" rx="14" fill="url(#fq-or)" />
        <rect x="16" y="18" width="50" height="6" rx="3" fill="#fff" />
        <rect x="16" y="30" width="34" height="6" rx="3" fill="#fff" opacity=".85" />
      </g>
      {/* ? bubble bottom */}
      <g transform="translate(150 410) rotate(-6)">
        <rect width="74" height="68" rx="17" fill="url(#fq-or)" />
        <path d="M44 68 l10 20 l-26 -12 Z" fill="#f97316" />
        <text x="37" y="52" textAnchor="middle" fontSize="48" fontWeight="800" fill="#fff">?</text>
      </g>
      {/* plant */}
      <g transform="translate(0 404)">
        <path d="M40 44 C20 30 18 6 30 -6 C44 8 48 28 40 44 Z" fill="#6aa84f" />
        <path d="M46 44 C50 22 66 8 84 6 C80 26 66 42 46 44 Z" fill="#8cc152" />
        <path d="M34 48 C24 38 6 38 -2 28 C14 20 34 28 34 48 Z" fill="#79b043" />
        <path d="M18 48 h54 l-8 38 h-38 Z" fill="#ffffff" stroke="#efe1d2" />
      </g>
    </svg>
  );
}

export default function Home2FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="v2-faq-section">
      <div className="faq-container">
        <motion.div
          className="faq-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6 }}
        >
          <span className="faq-badge">
            <CircleHelp size={17} aria-hidden="true" />
            FAQ
          </span>
          <h2>
            Frequently Asked <span>Questions</span>
          </h2>
          <p>
            Clear answers about our services, products, project process, and
            long-term support.
          </p>
        </motion.div>

        <div className="faq-body">
        <div className="faq-art">
          <FaqArt />
        </div>
        <div className="faq-list">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                className={`faq-item ${isOpen ? "active" : ""}`}
                key={item.question}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-v2-${index}`}
                >
                  <span className="faq-icon">
                    <item.icon size={20} aria-hidden="true" />
                  </span>
                  <span className="faq-q-text">{item.question}</span>
                  <ChevronDown className="faq-chevron" size={20} aria-hidden="true" />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-v2-${index}`}
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    >
                      <p>{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
