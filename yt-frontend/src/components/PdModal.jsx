import React, { useEffect } from "react";
import { X } from "lucide-react";

/* Simple accessible popup: Esc / backdrop click closes, page scroll is locked while open. */
export default function PdModal({ title, subtitle, onClose, children, footer, size = "md" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="pd-modal-backdrop" onMouseDown={onClose}>
      <div
        className={`pd-modal pd-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pd-modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="pd-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="pd-modal-body">{children}</div>
        {footer && <div className="pd-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
