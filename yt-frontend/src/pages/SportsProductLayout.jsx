import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Cloud,
  Dumbbell,
  HeartPulse,
  LayoutDashboard,
  Medal,
  Settings,
  ShieldCheck,
  Star,
  Swords,
  Target,
  Trophy,
  UserRound,
  Users,
  Video,
} from "lucide-react";
import Seo from "../components/Seo";
import playerImg from "../assets/esportmplayer.webp";
import "./EecProductLayout.css";
import "./RetailProductLayout.css";
import "./SportsProductLayout.css";

const MODULES = [
  { icon: UserRound, label: "Player Profiles", tone: "purple" },
  { icon: Activity, label: "Performance Metrics", tone: "blue" },
  { icon: HeartPulse, label: "Health Tracking", tone: "pink" },
  { icon: Dumbbell, label: "Coach Workflows", tone: "orange" },
  { icon: Swords, label: "Match Analysis", tone: "teal" },
  { icon: Users, label: "Club Management", tone: "green" },
  { icon: BarChart3, label: "Reports & Insights", tone: "amber" },
];

const HIGHLIGHTS = [
  {
    icon: Trophy,
    title: "Used by",
    text: "Academies, Clubs & Tournament Organizers",
  },
  { icon: Star, title: "All-in-One", text: "Players, Coaches & Analytics" },
  {
    icon: ShieldCheck,
    title: "Secure & Scalable",
    text: "For Growing Sports Organizations",
  },
  { icon: Cloud, title: "Accessible Anywhere", text: "Web-Based & Cloud-Secure" },
];

const SIDEBAR = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: UserRound, label: "Players" },
  { icon: Users, label: "Clubs" },
  { icon: Swords, label: "Matches" },
  { icon: Activity, label: "Analysis" },
  { icon: Video, label: "Video Analysis" },
  { icon: BarChart3, label: "Reports" },
  { icon: CalendarDays, label: "Schedule" },
  { icon: Settings, label: "Settings" },
];

const STATS = [
  { icon: Swords, label: "Matches Analyzed", value: "32", delta: "+12%", tone: "purple" },
  { icon: Users, label: "Players Analyzed", value: "268", delta: "+6%", tone: "orange" },
  { icon: Target, label: "Goals", value: "56", delta: "+15%", tone: "green" },
  { icon: Medal, label: "Pass Accuracy", value: "82%", delta: "+4%", tone: "amber" },
];

const PERFORMANCE = [
  ["Jan", 32],
  ["Feb", 48],
  ["Mar", 40],
  ["Apr", 62],
  ["May", 54],
  ["Jun", 76],
  ["Jul", 88],
];

const TOP_PLAYERS = [
  ["Virat Sharma", 88, "88"],
  ["Arjun Patel", 85, "85"],
  ["Rohit Das", 82, "82"],
  ["Kabir Sen", 78, "78"],
  ["Ishan Roy", 75, "75"],
];

const EVENTS = [
  ["Passes", 94, "1,248"],
  ["Shots", 46, "143"],
  ["Tackles", 36, "98"],
  ["Intercepts", 30, "76"],
  ["Fouls", 18, "40"],
];

export default function SportsProductLayout({ product }) {
  return (
    <main className="eec-page eec-blue sport-purple">
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
                ESPORTM – <span>Sports Management System</span>
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

            <div className="eec-visual retail-visual sport-visual" aria-hidden="true">
              <span className="eec-blob" />
              <Trophy className="retail-deco deco-cart" size={46} />
              <Medal className="retail-deco deco-box" size={40} />
              <Target className="retail-deco deco-store" size={40} />
              <Activity className="retail-deco deco-bars" size={40} />

              <div className="retail-laptop">
                <div className="retail-screen">
                  <div className="rd-top">
                    <b>SportM</b>
                    <span className="rd-search">Welcome back, John Doe</span>
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
                          <small>Performance Overview</small>
                          <div className="rd-barchart">
                            <div className="rd-y">
                              <span>100</span>
                              <span>75</span>
                              <span>50</span>
                              <span>25</span>
                            </div>
                            <div className="rd-bars-wrap">
                              {PERFORMANCE.map(([m, h]) => (
                                <span key={m} style={{ height: `${h}%` }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="rd-panel rd-top-products sport-players">
                          <small>Top Players</small>
                          {TOP_PLAYERS.map(([name, w, score]) => (
                            <div key={name}>
                              <span>{name}</span>
                              <i style={{ width: `${w}%` }} />
                              <b>{score}</b>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rd-row">
                        <div className="rd-panel sport-events">
                          <small>Event Detection</small>
                          {EVENTS.map(([name, w, count]) => (
                            <div key={name}>
                              <span>{name}</span>
                              <i style={{ width: `${w}%` }} />
                              <b>{count}</b>
                            </div>
                          ))}
                        </div>
                        <div className="rd-panel sport-rate">
                          <small>Pass Success Rate</small>
                          <div className="rd-donut">
                            <span>
                              <b>82%</b>
                              Success
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <img
                className="retail-person sport-player"
                src={playerImg}
                alt=""
                width="667"
                height="1000"
              />

              <div className="eec-chip retail-chip-inventory">
                <span className="eec-chip-icon">
                  <Activity size={24} />
                </span>
                <span>
                  Player
                  <br />
                  Analytics
                </span>
              </div>

              <div className="eec-chip retail-chip-sales">
                <span className="eec-chip-icon">
                  <HeartPulse size={22} />
                </span>
                <span>
                  Health
                  <br />
                  Metrics
                </span>
              </div>

              <div className="eec-chip retail-chip-reports">
                <span className="eec-chip-icon">
                  <Dumbbell size={22} />
                </span>
                <span>
                  Coach
                  <br />
                  Workflows
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
            <h2>Why Choose ESPORTM</h2>
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
