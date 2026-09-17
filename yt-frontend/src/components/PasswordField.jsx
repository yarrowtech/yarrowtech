import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({ className = "", ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`efnbmms-password-field ${className}`.trim()}>
      <input {...inputProps} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="efnbmms-password-toggle"
        onClick={() => setVisible((prev) => !prev)}
        disabled={inputProps.disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
