import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  Cloud,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import Seo from "../components/Seo";
import staffImg from "../assets/eretailsmsboy.webp";
import "./EecProductLayout.css";
import "./RetailProductLayout.css";

const MODULES = [
  { icon: Package, label: "Product Management", tone: "blue" },
  { icon: Boxes, label: "Inventory Tracking", tone: "green" },
  { icon: ShoppingCart, label: "Sales & Billing", tone: "purple" },
  { icon: Truck, label: "Purchase & Vendors", tone: "orange" },
  { icon: Users, label: "Staff Management", tone: "pink" },
  { icon: UserRound, label: "Customer Management", tone: "teal" },
  { icon: BarChart3, label: "Reports & Analytics", tone: "amber" },
];

const HIGHLIGHTS = [
  {
    icon: Store,
    title: "Used by",
    text: "Retail Shops, Supermarkets & Distributors",
  },
  { icon: Star, title: "All-in-One", text: "Stock, Billing & Vendors" },
  {
    icon: ShieldCheck,
    title: "Secure & Scalable",
    text: "For Multi-Store Chains",
  },
  { icon: Cloud, title: "Accessible Anywhere", text: "Web-Based & Cloud-Secure" },
];

const SIDEBAR = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Package, label: "Products" },
  { icon: ShoppingCart, label: "Sales" },
  { icon: Truck, label: "Purchases" },
  { icon: Boxes, label: "Inventory" },
  { icon: ClipboardList, label: "Vendors" },
  { icon: Users, label: "Customers" },
  { icon: BarChart3, label: "Reports" },
  { icon: UserRound, label: "Employees" },
  { icon: Settings, label: "Settings" },
];

const STATS = [
  { icon: ShoppingCart, label: "Total Sales", value: "₹1,24,500", delta: "+12%", tone: "blue" },
  { icon: Package, label: "Total Products", value: "2,580", delta: "+8%", tone: "blue" },
  { icon: Users, label: "Total Customers", value: "856", delta: "+10%", tone: "blue" },
  { icon: ClipboardList, label: "Pending", value: "24", delta: "-5%", tone: "pink" },
];

const TOP_PRODUCTS = [
  ["Rice (5kg)", 92, "320"],
  ["Cooking Oil", 78, "260"],
  ["Wheat Flour", 66, "240"],
  ["Sugar (5kg)", 56, "210"],
];

const SALES_BARS = [34, 52, 40, 64, 46, 78, 58, 72, 50, 86, 62, 92];

const STOCK = [
  ["In Stock", "1,860", "#2563eb"],
  ["Low Stock", "520", "#f59e0b"],
  ["Out of Stock", "200", "#ef4444"],
];

const RECENT_SALES = [
  ["INV-001", "Walk-in Customer", "₹2,450", "Paid"],
  ["INV-002", "Pinali Mart", "₹5,680", "Paid"],
  ["INV-003", "City Stores", "₹1,320", "Pending"],
  ["INV-004", "Super Retail", "₹3,890", "Paid"],
];

export default function RetailProductLayout({ product }) {
  return (
    <main className="eec-page eec-blue">
      <Seo
        title={product.shortName}
        description={product.description}
        path={`/products/${product.slug}`}
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
              <h1 className="eec-title">
                ERETAILMS – <span>Retail Management System</span>
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
            </div>

            <div className="eec-visual retail-visual" aria-hidden="true">
              <span className="eec-blob" />
              <ShoppingCart className="retail-deco deco-cart" size={44} />
              <Package className="retail-deco deco-box" size={40} />
              <Store className="retail-deco deco-store" size={40} />
              <BarChart3 className="retail-deco deco-bars" size={40} />

              <div className="retail-laptop">
                <div className="retail-screen">
                  <div className="rd-top">
                    <b>ERetailMS</b>
                    <span className="rd-search">Search products, orders, customers...</span>
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
                              <em className={delta.startsWith("-") ? "down" : ""}>{delta}</em>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="rd-row">
                        <div className="rd-panel rd-chart">
                          <small>Sales Overview</small>
                          <div className="rd-barchart">
                            <div className="rd-y">
                              <span>80K</span>
                              <span>60K</span>
                              <span>40K</span>
                              <span>20K</span>
                            </div>
                            <div className="rd-bars-wrap">
                              {SALES_BARS.map((h, i) => (
                                <span key={i} style={{ height: `${h}%` }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="rd-panel rd-top-products">
                          <small>Top Selling Products</small>
                          {TOP_PRODUCTS.map(([name, w, qty]) => (
                            <div key={name}>
                              <span>{name}</span>
                              <i style={{ width: `${w}%` }} />
                              <b>{qty}</b>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rd-row">
                        <div className="rd-panel rd-sales">
                          <small>Recent Sales</small>
                          {RECENT_SALES.map(([id, customer, amount, status]) => (
                            <div key={id}>
                              <span>{id}</span>
                              <span>{customer}</span>
                              <span>{amount}</span>
                              <em className={status === "Pending" ? "pending" : ""}>{status}</em>
                            </div>
                          ))}
                        </div>
                        <div className="rd-panel rd-inventory">
                          <small>Inventory Status</small>
                          <div className="rd-inv-body">
                            <div className="rd-donut">
                              <span>
                                <b>2,580</b>
                                Total
                              </span>
                            </div>
                            <ul className="rd-legend">
                              {STOCK.map(([label, qty, color]) => (
                                <li key={label}>
                                  <i style={{ background: color }} />
                                  {label}
                                  <b>{qty}</b>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="retail-base" />
              </div>

              <img
                className="retail-person"
                src={staffImg}
                alt=""
                width="751"
                height="1000"
              />

              <div className="eec-chip retail-chip-inventory">
                <span className="eec-chip-icon">
                  <Boxes size={24} />
                </span>
                <span>
                  Inventory
                  <br />
                  Management
                </span>
              </div>

              <div className="eec-chip retail-chip-sales">
                <span className="eec-chip-icon">
                  <ShoppingCart size={22} />
                </span>
                <span>
                  Sales &amp;
                  <br />
                  Billing
                </span>
              </div>

              <div className="eec-chip retail-chip-reports">
                <span className="eec-chip-icon">
                  <BarChart3 size={22} />
                </span>
                <span>
                  Reports &amp;
                  <br />
                  Analytics
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
            <h2>Why Choose ERetailMS</h2>
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
