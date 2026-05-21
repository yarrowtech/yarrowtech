import { Store, Trophy, UtensilsCrossed } from "lucide-react";
import eecLogo from "../assets/eec-logo.jpg";

export const products = [
  {
    slug: "electronic-educare",
    name: "EEC - Electronic Educare",
    shortName: "Electronic Educare",
    logo: eecLogo,
    accent: "#f5c542",
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
    name: "eretailms - Retail Management System",
    shortName: "eretailms",
    icon: Store,
    accent: "#4f9cff",
    category: "Retail Operations Platform",
    description:
      "A web-based retail platform digitizing product, inventory, sales, vendor, and employee operations with real-time insights.",
    writeup:
      "eretailms gives retailers a practical way to control stock, billing, vendors, sales, and staff activity from a single system. It is built for teams that need accurate daily operations and useful business visibility.",
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
    name: "emnbmms - Food & Beverage Management System",
    shortName: "emnbmms",
    icon: UtensilsCrossed,
    accent: "#3ccf91",
    category: "Restaurant and Kitchen Operations",
    description:
      "A modern platform optimizing restaurant operations from orders and inventory to kitchen workflows and financial insights.",
    writeup:
      "emnbmms helps food businesses manage orders, menus, inventory, kitchen activity, and financial tracking in one place. It is designed to make service smoother and reduce operational blind spots.",
    audience: [
      "Restaurants and cafes",
      "Cloud kitchens",
      "Bakeries and hotels",
      "Food service businesses",
    ],
    features: [
      "Menu and order management",
      "Kitchen workflow tracking",
      "Inventory and ingredient visibility",
      "Financial summaries and operational reports",
    ],
    outcomes: [
      "Smoother order handling",
      "Improved kitchen coordination",
      "Better control over stock and costs",
    ],
    productUrl: "",
  },
  {
    slug: "sportbit",
    name: "esportm - Sports Management System",
    shortName: "esportm",
    icon: Trophy,
    accent: "#9b7cff",
    category: "Sports Performance Platform",
    description:
      "A sports ecosystem enabling player discovery, performance analytics, health metrics, and data-driven club decisions.",
    writeup:
      "esportm brings player profiles, performance data, coaching workflows, and sports organization management into a focused digital system. It helps teams make better decisions with structured sports data.",
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
