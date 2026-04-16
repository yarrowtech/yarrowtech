// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Lottie from "lottie-react";
// import axios from "axios";
// import { GoogleLogin } from "@react-oauth/google";
// import { Eye, EyeOff } from "lucide-react";

// import "./Header.css";
// import logoAnimation from "../assets/logo2.json";

// import CareerForm from "../components/CareerForm";
// import RequestDemoForm from "../components/RequestDemoForm.jsx";

// const NAV_LINKS = [
//   { label: "Home", hash: "" },
//   { label: "Services", hash: "#services" },
//   { label: "Products", hash: "#products" },
//   { label: "Expertise", hash: "#expertise" },
//   { label: "About", hash: "#about" },
//   { label: "Career", hash: "#career" },
// ];

// export default function Header() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [activeHash, setActiveHash] = useState("");

//   const [showLogin, setShowLogin] = useState(false);
//   const [showCareer, setShowCareer] = useState(false);
//   const [showRequestDemo, setShowRequestDemo] = useState(false);

//   const [toast, setToast] = useState(null);
//   const [user, setUser] = useState(null);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);

//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   if (typeof window !== "undefined") {
//     window.openFreeTrialModal = () => setShowRequestDemo(true);
//   }

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const userData = localStorage.getItem("user");
//     if (token && userData) {
//       setUser(JSON.parse(userData));
//     }
//   }, []);
// useEffect(() => {
//   const sections = ["home", "services", "products", "expertise", "about", "contact"];

//   const handleScroll = () => {
//     const scrollPos = window.scrollY + 150; // offset for fixed navbar

//     sections.forEach((id) => {
//       const section = document.getElementById(id);

//       if (section) {
//         const top = section.offsetTop;
//         const height = section.offsetHeight;

//         if (scrollPos >= top && scrollPos < top + height) {
//           setActiveHash("#" + id);
//         }
//       }
//     });
//   };

//   window.addEventListener("scroll", handleScroll);

//   handleScroll(); // run once

//   return () => window.removeEventListener("scroll", handleScroll);
// }, []);

//   const showToastMessage = (type, message) => {
//     setToast({ type, message });
//     setTimeout(() => setToast(null), 3000);
//   };

//   /* ================= WEBSITE LOGIN ================= */
//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!loginEmail.trim() || !loginPassword) {
//       showToastMessage("error", "Email and password are required");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/auth/login",
//         {
//           email: loginEmail.trim(),
//           password: loginPassword,
//         },
//         { headers: { "Content-Type": "application/json" } }
//       );

//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));
//       setUser(res.data.user);
//       setShowLogin(false);

//       showToastMessage("success", "Login successful!");
//     } catch (err) {
//       showToastMessage(
//         "error",
//         err.response?.data?.message || "Login failed"
//       );
//     }
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     setUser(null);
//     showToastMessage("success", "Logged out successfully");
//   };

//   const handleNav = (e, hash) => {
//     e.preventDefault();
//     setMenuOpen(false);
//     setActiveHash(hash || "");

//     if (hash === "#career") {
//       if (!user) {
//         showToastMessage("error", "Please login first");
//         setShowLogin(true);
//         return;
//       }
//       setShowCareer(true);
//       return;
//     }

//     if (!hash) {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     const el = document.getElementById(hash.replace("#", ""));
//     if (el) el.scrollIntoView({ behavior: "smooth" });
//   };

//   const modalAnim = {
//     initial: { scale: 0.9, opacity: 0, y: 40 },
//     animate: { scale: 1, opacity: 1, y: 0 },
//     exit: { scale: 0.9, opacity: 0, y: 40 },
//     transition: { duration: 0.25 },
//   };

//   return (
//     <>
//       {/* ================= HEADER ================= */}
//       <header className="header">
//         <div className="header-container">
//           <a href="/" className="logo">
//             <Lottie animationData={logoAnimation} loop autoplay />
//           </a>

//           <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
//             {NAV_LINKS.map((item) => (
//               <a
//                 key={item.label}
//                 href={item.hash}
//                 onClick={(e) => handleNav(e, item.hash)}
//                 className={`nav-link ${
//                   activeHash === item.hash ? "active" : ""
//                 }`}
//               >
//                 {item.label}
//               </a>
//             ))}

//             <div className="mobile-buttons">
//               <button
//                 className="btn contact-btn"
//                 onClick={(e) => handleNav(e, "#contact")}
//               >
//                 Contact Us
//               </button>

//               {user ? (
//                 <button className="logout-btn" onClick={handleLogout}>
//                   Logout
//                 </button>
//               ) : (
//                 <button
//                   className="btn login-btn"
//                   onClick={() => {
//                     setShowLogin(true);
//                     setMenuOpen(false);
//                   }}
//                 >
//                   Login
//                 </button>
//               )}
//             </div>
//           </nav>

//           <div className="header-buttons">
//             <button
//               className="btn contact-btn"
//               onClick={(e) => handleNav(e, "#contact")}
//             >
//               Contact Us
//             </button>

//             {user ? (
//               <div className="user-box">
//                 <img
//                   src="https://avatar.iran.liara.run/public"
//                   className="navbar-user-avatar"
//                   alt="avatar"
//                   onClick={() => setShowProfileMenu(!showProfileMenu)}
//                 />
//                 {showProfileMenu && (
//                   <div className="profile-dropdown">
//                     <p className="user-name">{user.name}</p>
//                     <button className="logout-btn" onClick={handleLogout}>
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <button
//                 className="btn login-btn"
//                 onClick={() => setShowLogin(true)}
//               >
//                 Login
//               </button>
//             )}
//           </div>

//           <button
//             className="hamburger"
//             onClick={() => setMenuOpen(!menuOpen)}
//           >
//             <span></span>
//             <span></span>
//             <span></span>
//           </button>
//         </div>
//       </header>

//       {/* ================= LOGIN MODAL ================= */}
//       <AnimatePresence>
//         {showLogin && (
//           <motion.div
//             className="modal-overlay"
//             onClick={() => setShowLogin(false)}
//           >
//             <motion.div
//               className="modal login-card"
//               onClick={(e) => e.stopPropagation()}
//               {...modalAnim}
//             >
//               <h2 className="modal-title">Login</h2>

//               <form className="modal-form" onSubmit={handleLogin}>
//                 <label>Email</label>
//                 <input
//                   type="email"
//                   value={loginEmail}
//                   onChange={(e) => setLoginEmail(e.target.value)}
//                   required
//                 />

//                 <label>Password</label>
//                 <div className="password-field">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={loginPassword}
//                     onChange={(e) => setLoginPassword(e.target.value)}
//                     required
//                   />
//                   <button
//                     type="button"
//                     className="eye-btn"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>

//                 <button className="submit-btn" type="submit">
//                   Login
//                 </button>
//               </form>

//               <div className="google-auth-box">
//                 <GoogleLogin
//                   onSuccess={(res) =>
//                     axios.post("http://localhost:5000/api/auth/google", {
//                       credential: res.credential,
//                     })
//                   }
//                 />
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }




import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";

import "./Header.css";
import logoAnimation from "../assets/logo2.json";

import CareerForm from "../components/CareerForm";

const NAV_LINKS = [
  { label: "Home", hash: "" },
  { label: "Services", hash: "#services" },
  { label: "Products", hash: "#products" },
  { label: "Expertise", hash: "#expertise" },
  { label: "About", hash: "#about" },
  { label: "Career", hash: "#career" },
];

export default function Header() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const [showLogin, setShowLogin] = useState(false);
  const [showCareer, setShowCareer] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [registerName, setRegisterName] = useState("");
 const [registerEmail, setRegisterEmail] = useState("");
 const [registerPassword, setRegisterPassword] = useState("");
 const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  /* ================= CHECK LOGIN ================= */

  useEffect(() => {

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }

  }, []);


  /* ================= ACTIVE NAV SCROLL ================= */

  useEffect(() => {

    const sections = [
      "home",
      "services",
      "products",
      "expertise",
      "about",
      "contact",
    ];

    const handleScroll = () => {

      const scrollPos = window.scrollY + 150;

      sections.forEach((id) => {

        const section = document.getElementById(id);

        if (section) {

          const top = section.offsetTop;
          const height = section.offsetHeight;

          if (scrollPos >= top && scrollPos < top + height) {
            setActiveHash("#" + id);
          }

        }

      });

    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);


  /* ================= TOAST ================= */

  const showToastMessage = (type, message) => {

    setToast({ type, message });

    setTimeout(() => setToast(null), 3000);

  };


  /* ================= LOGIN ================= */

  const handleLogin = async (e) => {

    e.preventDefault();

    if (!loginEmail.trim() || !loginPassword) {

      showToastMessage("error", "Email and password are required");
      return;

    }

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: loginEmail.trim(),
          password: loginPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
      setShowLogin(false);

      showToastMessage("success", "Login successful!");

    } catch (err) {

      showToastMessage(
        "error",
        err.response?.data?.message || "Login failed"
      );

    }

  };

  /* ================= REGISTER ================= */

const handleRegister = async (e) => {
  e.preventDefault();

  if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
    showToastMessage("error", "All fields are required");
    return;
  }
  if (registerPassword !== registerConfirmPassword) {
  showToastMessage("error", "Passwords do not match");
  return;
}

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/register",
      {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      }
    );

    // ⭐ AUTO LOGIN
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // ⭐ update UI
    setUser(res.data.user);

    showToastMessage("success", "Account created & logged in!");

    // close register modal
    setShowRegister(false);

  } catch (err) {
    showToastMessage(
      "error",
      err.response?.data?.message || "Registration failed"
    );
  }
};


  /* ================= LOGOUT ================= */

  const handleLogout = () => {

    localStorage.clear();
    setUser(null);

    showToastMessage("success", "Logged out successfully");

  };


  /* ================= NAVIGATION ================= */

  const handleNav = (e, hash) => {

    e.preventDefault();
    setMenuOpen(false);
    setActiveHash(hash || "");

    if (hash === "#career") {
  setShowCareer(true);
  return;
}

    if (!hash) {

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;

    }

    const el = document.getElementById(hash.replace("#", ""));

    if (el) el.scrollIntoView({ behavior: "smooth" });

  };


  const modalAnim = {

    initial: { scale: 0.9, opacity: 0, y: 40 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.9, opacity: 0, y: 40 },
    transition: { duration: 0.25 },

  };


  return (
    <>

      {/* ================= HEADER ================= */}

      <header className="header">

        <div className="header-container">

          <a href="/" className="logo">
            <Lottie animationData={logoAnimation} loop autoplay />
          </a>


          <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>

            {NAV_LINKS.map((item) => (

              <a
                key={item.label}
                href={item.hash}
                onClick={(e) => handleNav(e, item.hash)}
                className={`nav-link ${
                  activeHash === item.hash ? "active" : ""
                }`}
              >
                {item.label}
              </a>

            ))}


            <div className="mobile-buttons">

              <button
                className="btn contact-btn"
                onClick={(e) => handleNav(e, "#contact")}
              >
                Contact Us
              </button>


              {user ? (

                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>

              ) : (

                <button
                  className="btn login-btn"
                  onClick={() => {
                    setShowLogin(true);
                    setMenuOpen(false);
                  }}
                >
                  Login
                </button>

              )}

            </div>

          </nav>


          <div className="header-buttons">

            <button
              className="btn contact-btn"
              onClick={(e) => handleNav(e, "#contact")}
            >
              Contact Us
            </button>


            {user ? (

              <div className="user-box">

                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name || "User"}`}
                  className="navbar-user-avatar"
                  alt="avatar"
                  onClick={() =>
                    setShowProfileMenu(!showProfileMenu)
                  }
                />

                {showProfileMenu && (

                  <div className="profile-dropdown">

                    <p className="user-name">{user.name}</p>

                    <button
                      className="logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>

                  </div>

                )}

              </div>

            ) : (

              <button
                className="btn login-btn"
                onClick={() => setShowLogin(true)}
              >
                Login
              </button>

            )}

          </div>


          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

      </header>


      {/* ================= LOGIN MODAL ================= */}

      <AnimatePresence>

        {showLogin && (

          <motion.div
            className="modal-overlay"
            onClick={() => setShowLogin(false)}
          >

            <motion.div
              className="modal login-card"
              onClick={(e) => e.stopPropagation()}
              {...modalAnim}
            >

              <button
                className="modal-close"
                onClick={() => setShowLogin(false)}
              >
                ✕
              </button>

              <h2 className="modal-title">Welcome Back</h2>

              <p className="modal-subtitle">
                Login to continue to your account
              </p>


              <form className="modal-form" onSubmit={handleLogin}>

                <label>Email Address</label>

<input
  type="email"
  autoComplete="email"
  placeholder="Enter your email"
  value={loginEmail}
  onChange={(e) => setLoginEmail(e.target.value)}
  required
/>


                <label>Password</label>

                <div className="password-field">

                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                </div>

                <button className="submit-btn" type="submit">
                  Login
                </button>

              </form>


              <div className="divider">
                <span>or</span>
              </div>


              <div className="google-auth-box">

                <GoogleLogin
                  onSuccess={(res) =>
                    axios.post("http://localhost:5000/api/auth/google", {
                      credential: res.credential,
                    })
                  }
                />

              </div>


<p className="login-footer">
  Don’t have an account? 
  <span
    onClick={() => {
      setShowLogin(false);
      setShowRegister(true);
    }}
  >
    Create account
  </span>
</p>

            </motion.div>

          </motion.div>

        )}

</AnimatePresence>


{/* ================= REGISTER MODAL ================= */}

<AnimatePresence>
  {showRegister && (
    <motion.div
      className="modal-overlay"
      onClick={() => setShowRegister(false)}
    >
      <motion.div
        className="modal login-card"
        onClick={(e) => e.stopPropagation()}
        {...modalAnim}
      >

        <button
          className="modal-close"
          onClick={() => setShowRegister(false)}
        >
          ✕
        </button>

        <h2 className="modal-title">Create Account</h2>

        <p className="modal-subtitle">
          Sign up to start using YarrowTech
        </p>

        <form className="modal-form" onSubmit={handleRegister}>

          <label>Name</label>
          <input
  type="text"
  placeholder="Your name"
  value={registerName}
  onChange={(e) => setRegisterName(e.target.value)}
  required
/>

<label>Email</label>
<input
  type="email"
  autoComplete="email"
  placeholder="Enter your email"
  value={registerEmail}
  onChange={(e) => setRegisterEmail(e.target.value)}
  required
/>

<label>Password</label>

<div className="password-field">

<input
  type={showRegisterPassword ? "text" : "password"}
  autoComplete="new-password"
  placeholder="Create password"
  value={registerPassword}
  onChange={(e) => setRegisterPassword(e.target.value)}
  required
/>

<button
  type="button"
  className="eye-btn"
  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
>
  {showRegisterPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
</button>

</div>


<label>Confirm Password</label>

<input
  type={showRegisterPassword ? "text" : "password"}
  placeholder="Confirm password"
  value={registerConfirmPassword}
  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
  required
/>

          <button className="submit-btn">
            Create Account
          </button>

        </form>

        <p className="login-footer">
          Already have an account?
          <span
            onClick={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          >
            Login
          </span>
        </p>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


{/* ================= CAREER FORM ================= */}

<CareerForm
  open={showCareer}
  onClose={() => setShowCareer(false)}
  showToast={showToastMessage}
/>

    </>
  );
}