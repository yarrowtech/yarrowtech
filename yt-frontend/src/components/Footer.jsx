// import React from "react";
// import "./footer.css";
// import { Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

// export default function Footer() {
//   return (
//     <>
//       {/* Wave Divider */}
//       <div className="footer-wave"></div>

//       <footer className="footer-section">
//         <div className="footer-container">

//           {/* Company Info */}
//           <div className="footer-col fade-up">
//             <h3 className="footer-logo">YarrowTech</h3>
//             <p className="footer-text">
//               Empowering businesses with modern, scalable and intelligent digital solutions.
//             </p>
//           </div>

//           {/* Contact Section */}
//           <div className="footer-col fade-up delay-2">
//             <h4>Contact Us</h4>

//             <div className="footer-info">
//               <Mail size={18} /> career@yarrowtech.co.in
//             </div>
//             <div className="footer-info">
//               <Phone size={18} /> +91 9830590929
//             </div>
//             <div className="footer-info">
//               <MapPin size={18} /> Esplanade, Kolkata, India
//             </div>

//             {/* Social Icons */}
//             <div className="footer-socials">
//               <a href="https://www.linkedin.com" target="_blank" className="glow-hover">
//                 <Linkedin size={22} />
//               </a>
//               <a href="https://www.facebook.com" target="_blank" className="glow-hover">
//                 <Facebook size={22} />
//               </a>
//               <a href="https://www.instagram.com" target="_blank" className="glow-hover">
//                 <Instagram size={22} />
//               </a>
//             </div>
//           </div>

//         </div>

//         <div className="footer-bottom fade-up delay-4">
//           © {new Date().getFullYear()} YarrowTech. All Rights Reserved.
//         </div>
//       </footer>
//     </>
//   );
// }


import React from "react";
import "./footer.css";
import { Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <>
      {/* Wave Divider */}
      <div className="footer-wave"></div>

      <footer id="contact" className="footer-section">
        <div className="footer-container">

          {/* Company Info */}
          <div className="footer-col fade-up">
            <h3 className="footer-logo">YarrowTech</h3>
            <p className="footer-text">
              Empowering businesses with modern, scalable and intelligent digital solutions.
            </p>
          </div>

          {/* Contact Section */}
          <div className="footer-col fade-up delay-2">
            <h4>Contact Us</h4>

            <div className="contact-row">

              {/* Contact Text */}
              <div className="contact-text">
                <div className="footer-info">
                  <Mail size={18} /> career@yarrowtech.co.in
                </div>

                <div className="footer-info">
                  <Phone size={18} /> +91 9830590929
                </div>

                <div className="footer-info">
                  <MapPin size={18} /> 3A, Bertram St, Esplanade, Kolkata
                </div>

                {/* Social Icons */}
                <div className="footer-socials">
                  <a href="https://www.linkedin.com" target="_blank" className="glow-hover">
                    <Linkedin size={22} />
                  </a>
                  <a href="https://www.facebook.com" target="_blank" className="glow-hover">
                    <Facebook size={22} />
                  </a>
                  <a href="https://www.instagram.com" target="_blank" className="glow-hover">
                    <Instagram size={22} />
                  </a>
                </div>
              </div>

              {/* Google Map */}
              <div className="footer-map">
                <iframe
                  src="https://www.google.com/maps?q=3A,+Bertram+St,+Esplanade,+Dharmatala,+Taltala,+Kolkata,+West+Bengal+700087&output=embed"
                  loading="lazy"
                ></iframe>
              </div>

            </div>
          </div>

        </div>

        <div className="footer-bottom fade-up delay-4">
          © {new Date().getFullYear()} YarrowTech. All Rights Reserved.
        </div>
      </footer>
    </>
  );
}