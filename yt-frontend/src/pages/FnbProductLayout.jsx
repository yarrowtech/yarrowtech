import Breadcrumbs from "../components/Breadcrumbs";
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  ChefHat,
  ClipboardList,
  Cloud,
  IndianRupee,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  Receipt,
  Settings,
  ShieldCheck,
  Star,
  Store,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import Seo from "../components/Seo";
import { trackProductExploreClick } from "../services/productTracking";
import chefImg from "../assets/fnbchef.webp";
import "./EecProductLayout.css";
import "./RetailProductLayout.css";
import "./FnbProductLayout.css";

const MODULES = [
  { icon: ClipboardList, label: "Order Management", tone: "green" },
  { icon: UtensilsCrossed, label: "Menu Management", tone: "orange" },
  { icon: Boxes, label: "Inventory Control", tone: "blue" },
  { icon: ChefHat, label: "Kitchen Operations", tone: "amber" },
  { icon: Users, label: "Staff Management", tone: "pink" },
  { icon: Wallet, label: "Accounts & Billing", tone: "purple" },
  { icon: BarChart3, label: "Reports & Analytics", tone: "teal" },
];

const HIGHLIGHTS = [
  {
    icon: Store,
    title: "Used by",
    text: "Restaurants, Cafes & Cloud Kitchens",
  },
  { icon: Star, title: "All-in-One", text: "Orders, Kitchen & ERP" },
  {
    icon: ShieldCheck,
    title: "Secure & Scalable",
    text: "For Multi-Branch Food Chains",
  },
  { icon: Cloud, title: "Accessible Anywhere", text: "Web-Based & Cloud-Secure" },
];

const SIDEBAR = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: ClipboardList, label: "Orders" },
  { icon: UtensilsCrossed, label: "Menu Management" },
  { icon: Boxes, label: "Inventory" },
  { icon: ChefHat, label: "Kitchen" },
  { icon: Users, label: "Staff Management" },
  { icon: Store, label: "Restaurant" },
  { icon: UserRound, label: "Vendors" },
  { icon: Wallet, label: "Accounts" },
  { icon: BarChart3, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

const STATS = [
  { icon: ClipboardList, label: "Today's Orders", value: "125", delta: "+12%", tone: "orange" },
  { icon: IndianRupee, label: "Today's Revenue", value: "₹24,560", delta: "+8%", tone: "green" },
  { icon: UtensilsCrossed, label: "Total Items", value: "280", delta: "+5%", tone: "green" },
  { icon: LayoutGrid, label: "Active Tables", value: "18 / 24", delta: "+10%", tone: "green" },
];

const SALES = [
  ["Mon", 30],
  ["Tue", 46],
  ["Wed", 58],
  ["Thu", 40],
  ["Fri", 72],
  ["Sat", 64],
  ["Sun", 90],
];

const POPULAR = [
  ["Chicken Biryani", 92, "320"],
  ["Paneer Butter Masala", 80, "280"],
  ["Pasta Alfredo", 68, "240"],
  ["Masala Dosa", 58, "210"],
  ["Cold Coffee", 50, "180"],
];

const ORDERS = [
  ["#1085", "T-4", "3 Items", "₹1,250", "Served"],
  ["#1084", "T-2", "2 Items", "₹780", "Preparing"],
  ["#1083", "T-7", "5 Items", "₹2,450", "Ready"],
  ["#1082", "T-1", "1 Item", "₹320", "Paid"],
];

const TABLES = [
  ["T1", "a"], ["T2", "o"], ["T3", "r"], ["T4", "o"],
  ["T5", "r"], ["T6", "o"], ["T7", "a"], ["T8", "r"],
  ["T9", "r"], ["T10", "o"], ["T11", "a"], ["T12", "r"],
];

export default function FnbProductLayout({ product }) {
  const signupEntries = Object.entries(product.signupPaths || {});
  const SIGNUP_LABELS = {
    admin: "Sign Up as Admin",
    vendor: "Sign Up as Vendor",
  };

  return (
    <main className="eec-page eec-blue fnb-green">
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
                EFNBMMS – <span>Food &amp; Beverage Management System</span>
              </h1>
              <p className="eec-lead">{product.description}</p>
              <p className="eec-writeup">{product.writeup}</p>

              <div className="eec-actions">
                {signupEntries.map(([key, path], index) => (
                  <Link
                    key={key}
                    to={path}
                    className={
                      index === 0 ? "eec-btn eec-btn-primary" : "eec-btn eec-btn-outline"
                    }
                  >
                    {SIGNUP_LABELS[key] || "Sign Up & Subscribe"}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                ))}
                {product.productUrl && (
                  <a
                    className="eec-btn eec-btn-outline"
                    href={product.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackProductExploreClick(product)}
                  >
                    Explore This Product
                    <ArrowRight size={18} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>

            <div className="eec-visual retail-visual fnb-visual" aria-hidden="true">
              <span className="eec-blob" />
              <ChefHat className="retail-deco deco-cart" size={46} />
              <Leaf className="retail-deco deco-box" size={40} />
              <UtensilsCrossed className="retail-deco deco-store" size={40} />
              <Receipt className="retail-deco deco-bars" size={40} />

              <div className="retail-laptop">
                <div className="retail-screen">
                  <div className="rd-top">
                    <b>EFNBMMS</b>
                    <span className="rd-search">Search orders, menu, inventory...</span>
                    <i />
                  </div>
                  <div className="rd-body">
                    <ul className="rd-nav">
                      {SIDEBAR.map(({ icon: Icon, label }, i) => (
                        <li key={label} className={i === 0 ? "active" : ""}>
                          <Icon size={10} />
                          {label}
                        </li>
                      ))}
                    </ul>
                    <div className="rd-main">
                      <div className="rd-stats">
                        {STATS.map(({ icon: Icon, label, value, delta, tone }) => (
                          <div key={label}>
                            <span className={`rd-stat-icon tone-${tone}`}>
                              <Icon size={13} />
                            </span>
                            <span>
                              <small>{label}</small>
                              <strong>{value}</strong>
                              <em>{delta}</em>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="rd-row">
                        <div className="rd-panel rd-chart">
                          <small>Sales Overview</small>
                          <div className="rd-barchart">
                            <div className="rd-y">
                              <span>40K</span>
                              <span>30K</span>
                              <span>20K</span>
                              <span>10K</span>
                            </div>
                            <div className="rd-bars-wrap">
                              {SALES.map(([day, h]) => (
                                <span key={day} style={{ height: `${h}%` }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="rd-panel rd-top-products fnb-popular">
                          <small>Popular Menu Items</small>
                          {POPULAR.map(([name, w, qty]) => (
                            <div key={name}>
                              <span>{name}</span>
                              <i style={{ width: `${w}%` }} />
                              <b>{qty}</b>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rd-row">
                        <div className="rd-panel fnb-orders">
                          <small>Recent Orders</small>
                          {ORDERS.map(([id, table, items, amount, status]) => (
                            <div key={id}>
                              <span>{id}</span>
                              <span>{table}</span>
                              <span>{items}</span>
                              <span>{amount}</span>
                              <em className={`st-${status.toLowerCase()}`}>{status}</em>
                            </div>
                          ))}
                        </div>
                        <div className="rd-panel fnb-tables">
                          <small>Table Status</small>
                          <div className="fnb-table-grid">
                            {TABLES.map(([t, s]) => (
                              <span key={t} className={`tb-${s}`}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <img
                className="retail-person fnb-chef"
                src={chefImg}
                alt=""
                width="667"
                height="1000"
              />

              <div className="eec-chip retail-chip-inventory">
                <span className="eec-chip-icon">
                  <UtensilsCrossed size={24} />
                </span>
                <span>
                  Menu
                  <br />
                  Management
                </span>
              </div>

              <div className="eec-chip retail-chip-sales">
                <span className="eec-chip-icon">
                  <Boxes size={22} />
                </span>
                <span>
                  Inventory
                  <br />
                  Management
                </span>
              </div>

              <div className="eec-chip retail-chip-reports">
                <span className="eec-chip-icon">
                  <ChefHat size={22} />
                </span>
                <span>
                  Kitchen
                  <br />
                  Operations
                </span>
              </div>
            </div>
          </div>

          <ul className="eec-modules retail-modules">
            {MODULES.map(({ icon: Icon, label, tone }) => (
              <li key={label}>
                <span className={`eec-module-icon tone-${tone}`}>
                  <Icon size={24} aria-hidden="true" />
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>

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
            <h2>Why Choose EFNBMMS</h2>
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
