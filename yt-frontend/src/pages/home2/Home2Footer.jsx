import React from "react";
import "./Home2Footer.css";
import { Linkedin, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Home2Footer() {
  return (
    <>
      <div className="v2-footer-wave"></div>

      <footer id="contact" className="v2-footer-section">
        <div className="footer-container">

          <div className="footer-col fade-up">
            <h3 className="footer-logo">YarrowTech</h3>
            <p className="footer-text">
              Empowering businesses with modern, scalable and intelligent digital solutions.
            </p>
          </div>

          <div className="footer-col footer-links-col fade-up delay-1">
            <h4>Quick Links</h4>
            <nav className="footer-links">
              <a href="/#home">Home</a>
              <a href="/#services">Services</a>
              <a href="/#products">Products</a>
              <a href="/#expertise">Expertise</a>
              <a href="/#about">About</a>
            </nav>
          </div>

          <div className="footer-col fade-up delay-2">
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
          </div>

        </div>

        <div className="footer-bottom fade-up delay-4">
          <span>© {new Date().getFullYear()} YarrowTech. All Rights Reserved.</span>
          <div className="footer-legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  );
}
