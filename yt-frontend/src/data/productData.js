import { Store, Trophy, UtensilsCrossed } from "lucide-react";
import eecLogo from "../assets/eec-logo.jpg";

export const products = [
  {
    slug: "electronic-educare",
    name: "EEC - ELECTRONIC EDUCARE",
    shortName: "ELECTRONIC EDUCARE",
    logo: eecLogo,
    accent: "#ca8a04",
    category: "Education ERP and LMS",
    description:
      "A unified digital campus combining LMS and ERP into one intelligent ecosystem connecting students, teachers, parents, and administrators.",
    writeup:
      "Electronic Educare helps educational institutions move away from scattered registers, disconnected apps, and slow manual reporting. It brings learning, administration, communication, and performance visibility into one organized platform.",
    audience: [
      "Schools and colleges",
      "Coaching institutes",
      "Training centers",
      "Teachers, students, parents, and administrators",
    ],
    features: [
      "Student and staff management",
      "Learning and academic workflow support",
      "Attendance, communication, and reports",
      "Role-based access for admin, teacher, student, and parent users",
    ],
    outcomes: [
      "Clear campus visibility",
      "Faster administration",
      "Better parent and student engagement",
    ],
    productUrl: "",
  },
  {
    slug: "retail-management-system",
    name: "ERETAILMS - RETAIL MANAGEMENT SYSTEM",
    shortName: "ERETAILMS",
    icon: Store,
    accent: "#2563eb",
    category: "Retail Operations Platform",
    description:
      "A web-based retail platform digitizing product, inventory, sales, vendor, and employee operations with real-time insights.",
    writeup:
      "ERETAILMS gives retailers a practical way to control stock, billing, vendors, sales, and staff activity from a single system. It is built for teams that need accurate daily operations and useful business visibility.",
    audience: [
      "Retail shops and supermarkets",
      "Distributors and wholesalers",
      "Franchise stores",
      "Product-based businesses",
    ],
    features: [
      "Inventory and product management",
      "Sales, billing, and vendor workflows",
      "Employee and branch-level controls",
      "Reports for stock, revenue, and daily performance",
    ],
    outcomes: [
      "Less manual stock confusion",
      "Faster billing workflows",
      "Real-time retail insights",
    ],
    productUrl: "",
  },
  {
    slug: "food-and-beverage-management-system",
    name: "EFNBMMS - FOOD & BEVERAGE MANAGEMENT SYSTEM",
    shortName: "EFNBMMS",
    icon: UtensilsCrossed,
    accent: "#16a34a",
    category: "Restaurant and Kitchen Operations",
    description:
      "An intelligent ERP platform for modern restaurants, cafes, cloud kitchens, and food chains to manage orders, inventory, kitchen workflows, staff activity, and business performance from one connected system.",
    writeup:
      "EFNBMMS helps food and beverage businesses transform daily operations with a complete digital platform. From stock control and order management to full ERP workflows, reporting, and custom enterprise solutions, it gives owners and managers the visibility they need to reduce manual work, avoid mistakes, and scale with confidence.",
    audience: [
      "Restaurants and cafes",
      "Cloud kitchens",
      "Bakeries, hotels, and food counters",
      "Multi-branch food chains and enterprise F&B businesses",
    ],
    features: [
      "Inventory and order management",
      "Kitchen workflow and menu operations",
      "Full ERP suite for professional F&B teams",
      "Custom enterprise modules for growing restaurant chains",
      "Financial summaries, performance reports, and operational insights",
    ],
    outcomes: [
      "Smarter food and beverage operations",
      "Better control over inventory, orders, and costs",
      "A scalable ERP foundation for restaurants and chains",
    ],
    productUrl: "https://www.efnbmms.com/",
  },
  {
    slug: "sportbit",
    name: "ESPORTM - SPORTS MANAGEMENT SYSTEM",
    shortName: "ESPORTM",
    icon: Trophy,
    accent: "#7c3aed",
    category: "Sports Performance Platform",
    description:
      "A sports ecosystem enabling player discovery, performance analytics, health metrics, and data-driven club decisions.",
    writeup:
      "ESPORTM brings player profiles, performance data, coaching workflows, and sports organization management into a focused digital system. It helps teams make better decisions with structured sports data.",
    audience: [
      "Sports academies and clubs",
      "Coaches and players",
      "Tournament organizers",
      "Sports institutions",
    ],
    features: [
      "Player profile management",
      "Performance and health metrics",
      "Coach and club workflows",
      "Analytics for selection and improvement",
    ],
    outcomes: [
      "Better player visibility",
      "Data-driven coaching",
      "Organized sports operations",
    ],
    productUrl: "",
  },
];

export const getProductBySlug = (slug) =>
  products.find((product) => product.slug === slug);
