import React, { useEffect, useState, useRef } from "react";
import "./ScrollProgress.css";

export default function ScrollProgress() {
  const [scroll, setScroll] = useState(0);
  const [visible, setVisible] = useState(false);
  const [completed, setCompleted] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight + 200;

      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
      setScroll(scrollPercent);

      setVisible(scrollTop > 200);

      // Trigger completion effect
      if (scrollPercent >= 100 && !completed) {
        setCompleted(true);

        const btn = btnRef.current;
        btn.classList.add("complete-effect");

        setTimeout(() => {
          btn.classList.remove("complete-effect");
        }, 1500);
      }

      // Reset if user scrolls up
      if (scrollPercent < 100) {
        setCompleted(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [completed]);

  // Magnetic hover
  const handleMouseMove = (e) => {
    const btn = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    const btn = btnRef.current;
    btn.style.transform = "translate(0px, 0px) scale(1)";
  };

  // Ripple + scroll
  const handleClick = () => {
    const btn = btnRef.current;
    btn.classList.add("ripple");

    setTimeout(() => btn.classList.remove("ripple"), 600);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`scroll-progress ${visible ? "show" : ""}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={btnRef}
    >
      {/* SPARK PARTICLES (shown only during completion) */}
      <div className="spark-container">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="spark"></span>
        ))}
      </div>

      <svg viewBox="0 0 120 120" className="scroll-svg">
        <polygon
          points="60,5 115,35 115,85 60,115 5,85 5,35"
          className="progress-bg"
        />

        <polygon
          points="60,5 115,35 115,85 60,115 5,85 5,35"
          className={`progress-fill ${completed ? "flash-border" : ""}`}
          style={{
            strokeDasharray: 360,
            strokeDashoffset: 360 - (scroll / 100) * 360,
          }}
        />
      </svg>

      <div className={`arrow ${completed ? "arrow-pop" : ""}`}>↑</div>
    </div>
  );
}
