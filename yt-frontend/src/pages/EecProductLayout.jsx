import Breadcrumbs from "../components/Breadcrumbs";
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Cloud,
  FileText,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  MessageSquare,
  School,
  ShieldCheck,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import Seo from "../components/Seo";
import { trackProductExploreClick } from "../services/productTracking";
import studentImg from "../assets/eecstudent.webp";
import "./EecProductLayout.css";

const MODULES = [
  { icon: GraduationCap, label: "Academic Management", tone: "blue" },
  { icon: Users, label: "Student Information", tone: "blue" },
  { icon: BookOpen, label: "Online Learning", tone: "purple" },
  { icon: IndianRupee, label: "Fees & Accounts", tone: "orange" },
  { icon: MessageSquare, label: "Communication", tone: "green" },
  { icon: BarChart3, label: "Reports & Analytics", tone: "green" },
];

const HIGHLIGHTS = [
  {
    icon: Users,
    title: "Used by",
    text: "Schools, Coaching Centers & Training Institutes",
  },
  { icon: Star, title: "All-in-One", text: "ERP + LMS Platform" },
  {
    icon: ShieldCheck,
    title: "Secure & Scalable",
    text: "For Growing Institutions",
  },
  { icon: Cloud, title: "Accessible Anywhere", text: "On Web & Mobile" },
];

const SIDEBAR = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: UserRound, label: "Students" },
  { icon: Users, label: "Teachers" },
  { icon: School, label: "Classes" },
  { icon: ClipboardList, label: "Exams" },
  { icon: FileText, label: "Fees" },
  { icon: CalendarCheck, label: "Attendance" },
  { icon: BarChart3, label: "Reports" },
];

const BARS = [38, 62, 46, 78, 54, 70, 88];

export default function EecProductLayout({ product }) {
  return (
    <main className="eec-page">
      <Seo
        title={product.shortName}
        description={product.description}
        path={`/products/${product.slug}`}
        breadcrumbs={[{ name: "Products", path: "/products" }, { name: product.shortName, path: `/products/${product.slug}` }]}
      />

      <section className="eec-hero">
        <div className="eec-shell">
          <div className="eec-card">
            <div className="eec-copy">
              <Link to="/products" className="eec-back">
                <ArrowLeft size={16} aria-hidden="true" />
                Back to products
              </Link>

              <span className="eec-category">{product.category}</span>
              <Breadcrumbs items={[{ name: "Products", path: "/products" }, { name: product.shortName, path: `/products/${product.slug}` }]} />
              <h1 className="eec-title">
                EEC – Electronic <span>Educare</span>
              </h1>
              <p className="eec-lead">{product.description}</p>
              <p className="eec-writeup">{product.writeup}</p>

              <div className="eec-actions">
                {product.productUrl ? (
                  <a
                    className="eec-btn eec-btn-primary"
                    href={product.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackProductExploreClick(product)}
                  >
                    Explore This Product
                    <ArrowRight size={18} aria-hidden="true" />
                  </a>
                ) : (
                  <button className="eec-btn eec-btn-primary" type="button" disabled>
                    Product Link Coming Soon
                  </button>
                )}
              </div>

              <ul className="eec-modules">
                {MODULES.map(({ icon: Icon, label, tone }) => (
                  <li key={label}>
                    <span className={`eec-module-icon tone-${tone}`}>
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="eec-visual" aria-hidden="true">
              <span className="eec-blob" />
              <span className="eec-dots" />

              <div className="eec-cap-badge">
                <GraduationCap size={34} />
              </div>

              <div className="eec-mock">
                <div className="eec-mock-top">
                  <b>EEC</b>
                  <i />
                </div>
                <div className="eec-mock-body">
                  <ul className="eec-mock-nav">
                    {SIDEBAR.map(({ icon: Icon, label }, i) => (
                      <li key={label} className={i === 0 ? "active" : ""}>
                        <Icon size={12} />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <div className="eec-mock-main">
                    <div className="eec-mock-stats">
                      <div>
                        <small>Total Students</small>
                        <strong>
                          1,248 <em>+12%</em>
                        </strong>
                      </div>
                      <div>
                        <small>Total Teachers</small>
                        <strong>
                          86 <em>+8%</em>
                        </strong>
                      </div>
                    </div>
                    <div className="eec-mock-chart">
                      <small>Attendance Overview</small>
                      <div className="eec-bars">
                        {BARS.map((h, i) => (
                          <span key={i} style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <img
                className="eec-student"
                src={studentImg}
                alt=""
                width="715"
                height="1000"
              />

              <div className="eec-chip eec-chip-lms">
                <span className="eec-chip-icon">
                  <BookOpen size={24} />
                </span>
                <span>
                  Learning
                  <br />
                  Management System
                </span>
              </div>

              <div className="eec-chip eec-chip-school">
                <span className="eec-chip-icon">
                  <School size={22} />
                </span>
                <span>
                  School / Coaching /
                  <br />
                  Training Center
                </span>
              </div>
            </div>
          </div>

          <div className="eec-highlights">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <div className="eec-highlight" key={title}>
                <Icon size={30} aria-hidden="true" />
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="eec-details">
        <div className="eec-shell eec-details-grid">
          <article>
            <h2>Who Can Use It</h2>
            <ul>
              {product.audience.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h2>Key Features</h2>
            <ul>
              {product.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h2>What You Gain</h2>
            <ul>
              {product.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
