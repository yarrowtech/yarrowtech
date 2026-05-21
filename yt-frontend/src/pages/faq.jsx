import React, { useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./faq.css";

const faqs = [
  {
    question: "What services does YarrowTech provide?",
    answer:
      "We provide website development, mobile app development, ERP systems, custom software, cloud solutions, backend engineering, UI/UX design, and AI-powered business systems.",
  },
  {
    question: "Can you build a custom ERP for my business?",
    answer:
      "Yes. We build custom ERP platforms based on your workflow, including modules for clients, projects, payments, inventory, employees, reporting, and role-based dashboards.",
  },
  {
    question: "Which products are available from YarrowTech?",
    answer:
      "Our product ecosystem includes Electronic Educare, eretailms, emnbmms, and esportm for sports management.",
  },
  {
    question: "Can any business or organization use your products?",
    answer:
      "Yes. Our products are built for real business use and can be adapted for schools, retail stores, restaurants, food businesses, sports clubs, academies, and growing organizations.",
  },
  {
    question: "Who can use Electronic Educare?",
    answer:
      "Electronic Educare is useful for schools, colleges, coaching institutes, training centers, teachers, students, parents, and administrators who need one platform for learning and campus management.",
  },
  {
    question: "Who can use eretailms?",
    answer:
      "Retail shops, supermarkets, distributors, wholesalers, franchise stores, and product-based businesses can use it to manage inventory, billing, vendors, employees, and daily sales.",
  },
  {
    question: "Who can use emnbmms?",
    answer:
      "Restaurants, cafes, cloud kitchens, bakeries, hotels, and food service businesses can use it to manage orders, inventory, kitchen workflows, menu items, and financial tracking.",
  },
  {
    question: "Who can use esportm?",
    answer:
      "esportm is designed for sports academies, clubs, coaches, players, tournament organizers, and sports institutions that need player profiles, performance tracking, and data-driven management.",
  },
  {
    question: "Can your products be customized for my company?",
    answer:
      "Yes. We can customize modules, dashboards, user roles, reports, branding, workflows, and integrations based on how your company operates.",
  },
  {
    question: "Can users access your products from anywhere?",
    answer:
      "Yes. Our products can be deployed as web-based platforms so authorized users can access them from office, home, or field locations using a secure login.",
  },
  {
    question: "Do your products support different user roles?",
    answer:
      "Yes. Products can include role-based access for admins, managers, staff, clients, students, parents, coaches, players, or other users depending on the product.",
  },
  {
    question: "Can reports and analytics be included in the products?",
    answer:
      "Yes. We can add dashboards, charts, financial summaries, attendance reports, inventory reports, performance analytics, and other business insights.",
  },
  {
    question: "Can your products manage payments or invoices?",
    answer:
      "Yes. Payment tracking, invoice generation, due reminders, transaction history, and payment summaries can be added based on the product requirement.",
  },
  {
    question: "Can we use only selected modules from a product?",
    answer:
      "Yes. You do not need to use every module. We can provide only the modules your organization needs and expand the system later when required.",
  },
  {
    question: "Can product data be migrated from our old system?",
    answer:
      "Yes. If you already have data in spreadsheets or another system, we can help migrate important records such as users, products, inventory, students, orders, or clients.",
  },
  {
    question: "Are your products suitable for small businesses?",
    answer:
      "Yes. Our products can be configured for small teams and growing businesses, then scaled with more users, branches, modules, and reports as operations expand.",
  },
  {
    question: "Can your products be used by multiple branches?",
    answer:
      "Yes. Multi-branch support can be added for schools, retail chains, restaurants, academies, and organizations that need centralized control with branch-level access.",
  },
  {
    question: "Do you create both web and mobile applications?",
    answer:
      "Yes. We create responsive websites, web applications, admin portals, and mobile apps with a focus on performance, usability, and long-term scalability.",
  },
  {
    question: "Can AI features be added to our software?",
    answer:
      "Yes. We can add AI-driven automation, analytics, chat support, recommendations, document processing, and smart workflow assistance depending on your business needs.",
  },
  {
    question: "How does the project development process work?",
    answer:
      "We start by understanding your requirements, then plan the features, design the user experience, develop the system, test it carefully, and support deployment.",
  },
  {
    question: "Do you provide support after project delivery?",
    answer:
      "Yes. We can provide maintenance, feature upgrades, bug fixes, performance improvements, hosting support, and ongoing technical guidance after launch.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="faq-section">
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
          <h2>Frequently Asked Questions</h2>
          <p>
            Clear answers about our services, products, project process, and
            long-term support.
          </p>
        </motion.div>

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
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{item.question}</span>
                  <ChevronDown size={22} aria-hidden="true" />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
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
    </section>
  );
}
