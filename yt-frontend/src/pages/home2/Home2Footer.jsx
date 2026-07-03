import React from "react";
import { motion } from "framer-motion";
import "./Home2Footer.css";
import { Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

const footerContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const footerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Home2Footer() {
  return (
    <>
      <div className="v2-footer-wave"></div>

      <footer id="contact" className="v2-footer-section">
        <motion.div
          className="footer-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={footerContainerVariants}
        >

          <motion.div className="footer-col" variants={footerItemVariants}>
            <h3 className="footer-logo">YarrowTech</h3>
            <p className="footer-text">
              Empowering businesses with modern, scalable and intelligent digital solutions.
            </p>
          </motion.div>

          <motion.div className="footer-col footer-links-col" variants={footerItemVariants}>
            <h4>Quick Links</h4>
            <nav className="footer-links">
              <a href="/#home">Home</a>
              <a href="/#services">Services</a>
              <a href="/#products">Products</a>
              <a href="/#expertise">Expertise</a>
              <a href="/#about">About</a>
            </nav>
          </motion.div>

          <motion.div className="footer-col" variants={footerItemVariants}>
            <h4>Contact Us</h4>

            <div className="contact-row">

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

              <div className="footer-map">
                <iframe
                  src="https://www.google.com/maps?q=3A,+Bertram+St,+Esplanade,+Dharmatala,+Taltala,+Kolkata,+West+Bengal+700087&output=embed"
                  loading="lazy"
                ></iframe>
              </div>

            </div>
          </motion.div>

        </motion.div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>© {new Date().getFullYear()} YarrowTech. All Rights Reserved.</span>
          <div className="footer-legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </motion.div>
      </footer>
    </>
  );
}
