// import React, { useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// /* 🌐 PUBLIC WEBSITE */
// import Header from "./components/Header";
// import Hero from "./components/Hero";
// import Service from "./pages/services";
// import Products from "./pages/products";
// import Contact from "./pages/contact";
// import Expertise from "./pages/expertise";
// import About from "./pages/about";
// import ScrollProgress from "./components/ScrollProgress";
// import SectionRouteRedirect from "./components/SectionRouteRedirect";
// import Footer from "./components/Footer";



// /* 📰 BLOG */
// import BlogPage from "./pages/BlogPage";




// /* ⭐ FLOATING CONTACT MENU */
// import ContactMenu from "./components/ContactMenu";

// /* 🔐 ERP PROTECTED ROUTE */
// import ERPProtectedRoute from "./routes/ERPProtectedRoute";

// /* 🧩 ADMIN MODULE */
// import AdminLayout from "./pages/admin/AdminLayout";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import Users from "./pages/admin/Users";
// import Projects from "./pages/admin/Projects";
// import RequestDemoAdmin from "./pages/admin/RequestDemoAdmin";
// import ContactsAdmin from "./pages/admin/ContactsAdmin";
// import Settings from "./pages/admin/Settings";
// import AdminBlog from "./pages/admin/AdminBlog"; // ✅ ADD THIS

// /* 🧩 MANAGER MODULE */
// import ManagerLayout from "./pages/manager/ManagerLayout";
// import ManagerDashboard from "./pages/manager/ManagerDashboard";
// import ManageProjects from "./pages/manager/ManageProjects";
// import CreateClient from "./pages/manager/CreateClient";
// import Notifications from "./pages/manager/Notifications";
// import ManagerSettings from "./pages/manager/Settings";
// import ChatWindow from "./pages/manager/ChatWindow";

// /* 🧩 TECHNICAL LEAD */
// import TechnicalLayout from "./pages/technical/TechnicalLayout";
// import TechnicalDashboard from "./pages/technical/TechnicalDashboard";
// import ProjectUpdates from "./pages/technical/ProjectUpdates";
// import TeamOverview from "./pages/technical/TeamOverview";
// import TechnicalProfile from "./pages/technical/TechnicalProfile";

// /* 🧩 CLIENT MODULE */
// import ClientLayout from "./pages/client/ClientLayout";
// import ClientDashboard from "./pages/client/ClientDashboard";
// import MyProjects from "./pages/client/MyProjects";
// import Payments from "./pages/client/Payments";
// // import Profile from "./pages/client/Profile";

// /* 🔔 Toast */
// import { Toaster } from "react-hot-toast";

// /* Styles */
// import "./App.css";
// import "./styles/Admin.css";


// // PUBLIC HOME PAGE
// function Home() {
//   useEffect(() => {
//     if (window.location.hash) {
//       window.history.replaceState(null, "", "/#");
//     }
//     window.scrollTo({ top: 0, behavior: "auto" });
//   }, []);

//   return (
//     <>
//       <Hero />
//       <Service />
//       <Products />
//       <Expertise />
//       <About />
//       <Contact />
//       <Footer />
//     </>
//   );
// }


// // ⭐ SHOW CONTACT MENU ONLY ON PUBLIC PAGES
// function ContactMenuWrapper() {
//   const { pathname } = useLocation();

//   const isPrivateRoute =
//     pathname.startsWith("/admin") ||
//     pathname.startsWith("/manager") ||
//     pathname.startsWith("/technical") ||
//     pathname.startsWith("/client");

//   return isPrivateRoute ? null : <ContactMenu />;
// }


// export default function App() {
//   return (
//     <Router>
//       <div className="app">

//         {/* 🌟 PUBLIC ONLY CONTACT MENU */}
//         <ContactMenuWrapper />

//         <Routes>

//           {/* 🌍 PUBLIC ROUTES */}
//           <Route
//             path="/"
//             element={
//               <>
//                 <Header />
//                 <Home />
//                 <ScrollProgress />
//               </>
//             }
//           />
// {/* 📰 BLOG PAGE */}
//           {/* <Route
//             path="/blogs"
//             element={
//               <>
//                 <Header />
//                 <BlogPage />
//                 <Footer />
//               </>
//             }
//           /> */}






//           {/* Smooth Scroll Section Routes */}
//           {["services", "products", "expertise", "about", "contact", "footer"].map((sec) => (
//             <Route
//               key={sec}
//               path={`/${sec}`}
//               element={
//                 <>
//                   <Header />
//                   <SectionRouteRedirect sectionId={sec} />
//                 </>
//               }
//             />
//           ))}

//           {/* ========================== */}
//           {/* 🔐 ADMIN (Protected)      */}
//           {/* ========================== */}
//           <Route
//             path="/admin"
//             element={
//               <ERPProtectedRoute role="admin">
//                 <AdminLayout />
//               </ERPProtectedRoute>
//             }
//           >
//             <Route index element={<AdminDashboard />} />
//             <Route path="dashboard" element={<AdminDashboard />} />
//             <Route path="users" element={<Users />} />
//             <Route path="projects" element={<Projects />} />
//             <Route path="blogs" element={<AdminBlog />} />   {/* ✅ BLOG ROUTE */}
//             <Route path="requests" element={<RequestDemoAdmin />} />
//             <Route path="contacts" element={<ContactsAdmin />} />
//             <Route path="settings" element={<Settings />} />
//           </Route>

//           {/* ========================== */}
//           {/* 🔐 MANAGER (Protected)     */}
//           {/* ========================== */}
//           <Route
//             path="/manager"
//             element={
//               <ERPProtectedRoute role="manager">
//                 <ManagerLayout />
//               </ERPProtectedRoute>
//             }
//           >
//             <Route index element={<ManagerDashboard />} />
//             <Route path="dashboard" element={<ManagerDashboard />} />
//             <Route path="projects" element={<ManageProjects />} />
//             <Route path="create-client" element={<CreateClient />} />
//             <Route path="notifications" element={<Notifications />} />
//             <Route path="settings" element={<ManagerSettings />} />
//             <Route path="chat" element={<ChatWindow />} />
//           </Route>

//           {/* ========================== */}
//           {/* 🔐 TECHNICAL LEAD          */}
//           {/* ========================== */}
//           <Route
//   path="/techlead"
//   element={
//     <ERPProtectedRoute role="techlead">
//       <TechnicalLayout />
//     </ERPProtectedRoute>
//   }
// >
//   <Route index element={<TechnicalDashboard />} />
//   <Route path="dashboard" element={<TechnicalDashboard />} />
//   <Route path="project-updates" element={<ProjectUpdates />} />
//   <Route path="team-overview" element={<TeamOverview />} />
//   <Route path="profile" element={<TechnicalProfile />} />
// </Route>

//           {/* ========================== */}
//           {/* 🔐 CLIENT (Protected)      */}
//           {/* ========================== */}
//           <Route
//             path="/client"
//             element={
//               <ERPProtectedRoute role="client">
//                 <ClientLayout />
//               </ERPProtectedRoute>
//             }
//           >
//             <Route index element={<ClientDashboard />} />
//             <Route path="dashboard" element={<ClientDashboard />} />
//             <Route path="projects" element={<MyProjects />} />
//             <Route path="payments" element={<Payments />} />
//             <Route path="history" element={<ProjectHistory />} />
//             <Route path="profile" element={<Profile />} />
//           </Route>

//           {/* 404 fallback */}
//           <Route
//             path="*"
//             element={
//               <>
//                 <Header />
//                 <Home />
//               </>
//             }
//           />
//         </Routes>

//         <Toaster position="top-right" />
//       </div>
//     </Router>
//   );
// }









// import React, { useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   useLocation,
// } from "react-router-dom";

// /* 🌐 PUBLIC WEBSITE */
// import Header from "./components/Header";
// import Hero from "./components/Hero";
// import Service from "./pages/services";
// import Products from "./pages/products";
// import Contact from "./pages/contact";
// import Expertise from "./pages/expertise";
// import About from "./pages/about";
// import ScrollProgress from "./components/ScrollProgress";
// import SectionRouteRedirect from "./components/SectionRouteRedirect";
// import Footer from "./components/Footer";

// /* ⭐ FLOATING CONTACT MENU */
// import ContactMenu from "./components/ContactMenu";

// /* 🔐 ERP PROTECTED ROUTE */
// import ERPProtectedRoute from "./routes/ERPProtectedRoute";

// /* 🧩 ADMIN MODULE */
// import AdminLayout from "./pages/admin/AdminLayout";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import Users from "./pages/admin/Users";
// import Projects from "./pages/admin/Projects";
// import RequestDemoAdmin from "./pages/admin/RequestDemoAdmin";
// import ContactsAdmin from "./pages/admin/ContactsAdmin";
// import Settings from "./pages/admin/Settings";
// import AdminBlog from "./pages/admin/AdminBlog";

// /* 🧩 MANAGER MODULE */
// import ManagerLayout from "./pages/manager/ManagerLayout";
// import ManagerDashboard from "./pages/manager/ManagerDashboard";
// import ManageProjects from "./pages/manager/ManageProjects";
// import CreateClient from "./pages/manager/CreateClient";
// import Notifications from "./pages/manager/Notifications";
// import ManagerSettings from "./pages/manager/Settings";
// import ChatWindow from "./pages/manager/ChatWindow";
// import RequestDemoManager from "./pages/manager/RequestDemoManager";

// /* 🧩 TECH LEAD */
// import TechnicalLayout from "./pages/technical/TechnicalLayout";
// import TechnicalDashboard from "./pages/technical/TechnicalDashboard";
// import ProjectUpdates from "./pages/technical/ProjectUpdates";
// import TeamOverview from "./pages/technical/TeamOverview";
// import TechnicalProfile from "./pages/technical/TechnicalProfile";

// /* 🧩 CLIENT MODULE */
// import ClientLayout from "./pages/client/ClientLayout";
// import ClientDashboard from "./pages/client/ClientDashboard";
// import MyProjects from "./pages/client/MyProjects";
// import Payments from "./pages/client/Payments";
// // import Profile from "./pages/client/Profile";

// /* 🔔 Toast */
// import { Toaster } from "react-hot-toast";

// /* Styles */
// import "./App.css";
// import "./styles/Admin.css";

// /* =======================
//    HOME PAGE
// ======================= */
// function Home() {
//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "auto" });
//   }, []);

//   return (
//     <>
//       <Hero />
//       <Service />
//       <Products />
//       <Expertise />
//       <About />
//       <Contact />
//       <Footer />
//     </>
//   );
// }

// /* =======================
//    CONTACT MENU WRAPPER
// ======================= */
// function ContactMenuWrapper() {
//   const { pathname } = useLocation();

//   const isPrivateRoute =
//     pathname.startsWith("/admin") ||
//     pathname.startsWith("/manager") ||
//     pathname.startsWith("/techlead") ||
//     pathname.startsWith("/client");

//   return isPrivateRoute ? null : <ContactMenu />;
// }

// /* =======================
//    404 PAGE
// ======================= */
// function NotFound() {
//   return (
//     <div style={{ padding: "60px", textAlign: "center" }}>
//       <h1>404 – Page Not Found</h1>
//       <p>The page you are trying to access does not exist.</p>
//     </div>
//   );
// }

// /* =======================
//    APP
// ======================= */
// export default function App() {
//   return (
//     <Router>
//       <ContactMenuWrapper />

//       <div className="app">
//         <Routes>
//           {/* 🌍 PUBLIC HOME */}
//           <Route
//             path="/"
//             element={
//               <>
//                 <Header />
//                 <Home />
//                 <ScrollProgress />
//               </>
//             }
//           />

//           {/* SECTION ROUTES */}
//           {["services", "products", "expertise", "about", "contact"].map(
//             (sec) => (
//               <Route
//                 key={sec}
//                 path={`/${sec}`}
//                 element={
//                   <>
//                     <Header />
//                     <SectionRouteRedirect sectionId={sec} />
//                   </>
//                 }
//               />
//             )
//           )}

//           {/* ==========================
//              🔐 ADMIN
//           ========================== */}
//           <Route
//             path="/admin"
//             element={
//               <ERPProtectedRoute role="admin">
//                 <AdminLayout />
//               </ERPProtectedRoute>
//             }
//           >
//             <Route index element={<AdminDashboard />} />
//             <Route path="dashboard" element={<AdminDashboard />} />
//             <Route path="users" element={<Users />} />
//             <Route path="projects" element={<Projects />} />
//             <Route path="blogs" element={<AdminBlog />} />
//             <Route path="requests" element={<RequestDemoAdmin />} />
//             <Route path="contacts" element={<ContactsAdmin />} />
//             <Route path="settings" element={<Settings />} />
//           </Route>

//           {/* ==========================
//              🔐 MANAGER
//           ========================== */}
//           <Route
//             path="/manager"
//             element={
//               <ERPProtectedRoute role="manager">
//                 <ManagerLayout />
//               </ERPProtectedRoute>
//             }
//           >
//             <Route index element={<ManagerDashboard />} />
//             <Route path="dashboard" element={<ManagerDashboard />} />
//             <Route path="projects" element={<ManageProjects />} />
//             <Route path="create-client" element={<CreateClient />} />
//             <Route path="notifications" element={<Notifications />} />
//             <Route path="requests" element={<RequestDemoManager />} />
//             <Route path="settings" element={<ManagerSettings />} />
//             <Route path="chat" element={<ChatWindow />} />
//           </Route>

//           {/* ==========================
//              🔐 TECH LEAD
//           ========================== */}
//           <Route
//             path="/techlead"
//             element={
//               <ERPProtectedRoute role="techlead">
//                 <TechnicalLayout />
//               </ERPProtectedRoute>
//             }
//           >
//             <Route index element={<TechnicalDashboard />} />
//             <Route path="dashboard" element={<TechnicalDashboard />} />
//             <Route path="project-updates" element={<ProjectUpdates />} />
//             <Route path="team-overview" element={<TeamOverview />} />
//             <Route path="profile" element={<TechnicalProfile />} />
//           </Route>

//           {/* ==========================
//              🔐 CLIENT
//           ========================== */}
//           <Route
//             path="/client"
//             element={
//               <ERPProtectedRoute role="client">
//                 <ClientLayout />
//               </ERPProtectedRoute>
//             }
//           >
//             <Route index element={<ClientDashboard />} />
//             <Route path="dashboard" element={<ClientDashboard />} />
//             <Route path="projects" element={<MyProjects />} />
//             <Route path="payments" element={<Payments />} />
//             <Route path="history" element={<ProjectHistory />} />
//             <Route path="profile" element={<Profile />} />
//           </Route>

//           {/* 🚫 404 */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>

//         <Toaster position="top-right" />
//       </div>
//     </Router>
//   );
// }









import React, { useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";

/* 🌐 PUBLIC WEBSITE */
import Seo from "./components/Seo";
import RouteMetadata from "./components/RouteMetadata";
import { lazyPage } from "./utils/lazyPage";
const MarketingPage = lazyPage(() => import("./pages/MarketingPage"));
import Header from "./components/Header";
const Hero = lazy(() => import("./components/Hero"));
const Service = lazy(() => import("./pages/services"));
const Products = lazy(() => import("./pages/products"));
const ProductDetailsPage = lazyPage(() => import("./pages/ProductDetailsPage"));
const EfnbmmsSignupPage = lazy(() => import("./pages/EfnbmmsSignupPage"));
const EfnbmmsVendorSignupPage = lazy(() => import("./pages/EfnbmmsVendorSignupPage"));
const Expertise = lazy(() => import("./pages/expertise"));
const FAQ = lazy(() => import("./pages/faq"));
const About = lazy(() => import("./pages/about"));
import ScrollProgress from "./components/ScrollProgress";
import SectionRouteRedirect from "./components/SectionRouteRedirect";
const Footer = lazy(() => import("./components/Footer"));
import RequestDemoForm from "./components/RequestDemoForm";
import Home2 from "./pages/home2/Home2";
import Home2Footer from "./pages/home2/Home2Footer";

/* ⭐ FLOATING CONTACT MENU */
import ContactMenu from "./components/ContactMenu";

/* 🔐 ERP PROTECTED ROUTE */
import ERPProtectedRoute from "./routes/ERPProtectedRoute";

/* 🧩 ADMIN MODULE */
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Users = lazy(() => import("./pages/admin/Users"));
const Projects = lazy(() => import("./pages/admin/Projects"));
const RequestDemoAdmin = lazy(() => import("./pages/admin/RequestDemoAdmin"));
const ContactsAdmin = lazy(() => import("./pages/admin/ContactsAdmin"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const CareerApplications = lazy(() => import("./pages/admin/CareerApplications"));
const AdminProductUsers = lazy(() => import("./pages/admin/ProductUsers"));
const AdminProductUserDetails = lazy(() => import("./pages/admin/ProductUserDetails"));
const ProductAnalytics = lazy(() => import("./pages/admin/ProductAnalytics"));
const ProjectAnalytics = lazy(() => import("./pages/admin/ProjectAnalytics"));
import ProjectAnalyticsTracker from "./components/ProjectAnalyticsTracker";

/* 🧩 MANAGER MODULE */
const ManagerLayout = lazy(() => import("./pages/manager/ManagerLayout"));
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard"));
const ManageProjects = lazy(() => import("./pages/manager/ManageProjects"));
const ProjectDetails = lazy(() => import("./pages/manager/ProjectDetails"));
const CreateClient = lazy(() => import("./pages/manager/CreateClient"));
const Notifications = lazy(() => import("./pages/manager/Notifications"));
const ManagerSettings = lazy(() => import("./pages/manager/Settings"));
const ChatWindow = lazy(() => import("./pages/manager/ChatWindow"));
const RequestDemoManager = lazy(() => import("./pages/manager/RequestDemoManager"));
const ManagerProductUsers = lazy(() => import("./pages/manager/ProductUsers"));
const ManagerProductUserDetails = lazy(() => import("./pages/manager/ProductUserDetails"));

/* 🧩 TECH LEAD */
const TechnicalLayout = lazy(() => import("./pages/technical/TechnicalLayout"));
const TechnicalDashboard = lazy(() => import("./pages/technical/TechnicalDashboard"));
const ProjectUpdates = lazy(() => import("./pages/technical/ProjectUpdates"));
const TeamOverview = lazy(() => import("./pages/technical/TeamOverview"));
const TechnicalProfile = lazy(() => import("./pages/technical/TechnicalProfile"));

/* 🧩 CLIENT MODULE */
const ClientLayout = lazy(() => import("./pages/client/ClientLayout"));
const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard"));
const MyProjects = lazy(() => import("./pages/client/MyProjects"));
const Payments = lazy(() => import("./pages/client/Payments"));
const Profile = lazy(() => import("./pages/client/Profile"));
const ProductUserLayout = lazy(() => import("./pages/productuser/ProductUserLayout"));
const ProductUserDashboard = lazy(() => import("./pages/productuser/ProductUserDashboard"));
const ProductUserProjects = lazy(() => import("./pages/productuser/ProductUserProjects"));
const ProductUserPayments = lazy(() => import("./pages/productuser/ProductUserPayments"));
const ProductUserChat = lazy(() => import("./pages/productuser/ProductUserChat"));

/* 🔔 Toast */
import { Toaster } from "react-hot-toast";

/* Theme */
import { ThemeProvider } from "./context/ThemeContext";

/* Styles */
import "./App.css";
import "./styles/Admin.css";

/* =======================
   HOME PAGE
======================= */
function Home() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <>
      {/* Legacy alternate homepage — kept reachable but not indexed
          separately from the real homepage at "/". */}
      <Seo title="Home (classic)" path="/home-classic" noindex />
      <Hero />
      <Service />
      <Products />
      <Expertise />
      <FAQ />
      <About />
      <Footer />
    </>
  );
}

/* =======================
   CONTACT MENU WRAPPER
======================= */
function ContactMenuWrapper() {
  const { pathname } = useLocation();

  const isHidden =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/techlead") ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/product-user");

  return isHidden ? null : <ContactMenu />;
}

/* =======================
   404 PAGE
======================= */
function NotFound() {
  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <Seo title="Page Not Found" noindex />
      <h1>404 – Page Not Found</h1>
      <p>The page you are trying to access does not exist.</p>
      <p><Link to="/">Go Home</Link> | <Link to="/services">Explore Services</Link> | <Link to="/products">Explore Products</Link></p>
    </div>
  );
}

/* =======================
   APP
======================= */
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <RouteMetadata />
        <ProjectAnalyticsTracker />
        <ContactMenuWrapper />

        <div className="app">
          <Suspense fallback={<div role="status" style={{ padding: "120px 24px" }}>Loading page...</div>}>
          <Routes>
            {/* PUBLIC HOME */}
            <Route
              path="/"
              element={
                <>
                  <Header headerClass="header-warm" />
                  <Home2 />
                  <ScrollProgress />
                </>
              }
            />

            <Route
              path="/home-classic"
              element={
                <>
                  <Header />
                  <Home />
                  <ScrollProgress />
                </>
              }
            />

            {["/services", "/services/:slug", "/products", "/industries", "/industries/:slug", "/blog", "/blog/:slug", "/case-studies", "/contact"].map(path => (
              <Route key={path} path={path} element={<><Header headerClass="header-warm" /><MarketingPage /><Home2Footer /></>} />
            ))}

            {/* SECTION ROUTES */}
            {["expertise", "faq", "about"].map(
              (sec) => (
                <Route
                  key={sec}
                  path={`/${sec}`}
                  element={
                    <>
                      <Header />
                      <SectionRouteRedirect sectionId={sec} />
                    </>
                  }
                />
              )
            )}

            {/* ==========================
             🔐 ERP LOGIN (PUBLIC)
          ========================== */}
            <Route
              path="/products/:productSlug"
              element={
                <>
                  <Header headerClass="header-warm" />
                  <ProductDetailsPage />
                  <Home2Footer />
                </>
              }
            />

            {/* EFNBMMS product signup / subscription checkout */}
            <Route
              path="/efnbmms/signup"
              element={
                <>
                  <Header headerClass="header-warm" />
                  <EfnbmmsSignupPage />
                  <Home2Footer />
                </>
              }
            />

            <Route
              path="/efnbmms/vendor/signup"
              element={
                <>
                  <Header headerClass="header-warm" />
                  <EfnbmmsVendorSignupPage />
                  <Home2Footer />
                </>
              }
            />

            {/* HOME2 – direct route kept alongside the new default landing page */}
            <Route
              path="/home2"
              element={
                <>
                  <Header headerClass="header-warm" />
                  <Home2 />
                  <ScrollProgress />
                </>
              }
            />

            {/* ==========================
             🔐 ADMIN
          ========================== */}
            <Route
              path="/admin"
              element={
                <ERPProtectedRoute role="admin">
                  <AdminLayout />
                </ERPProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="product-users" element={<AdminProductUsers />} />
              <Route path="product-users/:id" element={<AdminProductUserDetails />} />
              <Route path="product-analytics" element={<ProductAnalytics />} />
              <Route path="project-analytics" element={<ProjectAnalytics />} />
              <Route path="projects" element={<Projects />} />
              <Route path="blogs" element={<AdminBlog />} />
              <Route path="requests" element={<RequestDemoAdmin />} />
              <Route path="contacts" element={<ContactsAdmin />} />
              <Route path="careers" element={<CareerApplications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* ==========================
             🔐 MANAGER
          ========================== */}
            <Route
              path="/manager"
              element={
                <ERPProtectedRoute role="manager">
                  <ManagerLayout />
                </ERPProtectedRoute>
              }
            >
              <Route index element={<ManagerDashboard />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="projects" element={<ManageProjects />} />
              <Route path="projects/:projectId" element={<ProjectDetails />} />
              <Route path="product-users" element={<ManagerProductUsers />} />
              <Route path="product-users/:id" element={<ManagerProductUserDetails />} />
              <Route path="create-client" element={<CreateClient />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="requests" element={<RequestDemoManager />} />
              <Route path="contacts" element={<ContactsAdmin />} />
              <Route path="careers" element={<CareerApplications />} />
              <Route path="settings" element={<ManagerSettings />} />
              <Route path="chat" element={<ChatWindow />} />
            </Route>

            {/* ==========================
             🔐 TECH LEAD
          ========================== */}
            <Route
              path="/techlead"
              element={
                <ERPProtectedRoute role="techlead">
                  <TechnicalLayout />
                </ERPProtectedRoute>
              }
            >
              <Route index element={<TechnicalDashboard />} />
              <Route path="dashboard" element={<TechnicalDashboard />} />
              <Route path="project-updates" element={<ProjectUpdates />} />
              <Route path="team-overview" element={<TeamOverview />} />
              <Route path="profile" element={<TechnicalProfile />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* ==========================
             🔐 CLIENT
          ========================== */}
            <Route
              path="/client"
              element={
                <ERPProtectedRoute role="client">
                  <ClientLayout />
                </ERPProtectedRoute>
              }
            >
              <Route index element={<ClientDashboard />} />
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="projects" element={<MyProjects />} />
              <Route path="payments" element={<Payments />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            <Route
              path="/product-user"
              element={
                <ERPProtectedRoute role="productuser">
                  <ProductUserLayout />
                </ERPProtectedRoute>
              }
            >
              <Route index element={<ProductUserDashboard />} />
              <Route path="dashboard" element={<ProductUserDashboard />} />
              <Route path="projects" element={<ProductUserProjects />} />
              <Route path="payments" element={<ProductUserPayments />} />
              <Route path="chat" element={<ProductUserChat />} />
            </Route>
            {/* 📩 REQUEST DEMO PAGE */}
            <Route
              path="/request-demo"
              element={
                <>
                  <Seo
                    title="Request a Demo"
                    description="Tell us about your project and we'll schedule a demo to show how YarrowTech can build your custom software or ERP solution."
                    path="/request-demo"
                  />
                  <Header headerClass="header-warm" />
                  <div style={{ paddingTop: "100px" }}>
                    <h1 style={{ textAlign: "center", marginBottom: "24px" }}>Request a YarrowTech Demo</h1>
                    <RequestDemoForm />
                  </div>
                  <Home2Footer />
                </>
              }
            />
            {/* 🚫 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>

          <Toaster position="top-right" />
        </div>
      </Router>
    </ThemeProvider>
  );
}


export async function prepareInitialPage(pathname) {
  if (/^\/products\/[^/]+\/?$/.test(pathname)) await ProductDetailsPage.preload();
  else if (/^\/(services|products|industries|blog|case-studies|contact)(\/|$)/.test(pathname)) await MarketingPage.preload();
}
