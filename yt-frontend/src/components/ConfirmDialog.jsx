import React from "react";
import { AlertTriangle, X } from "lucide-react";
import "../styles/ConfirmDialog.css";

/* Reusable in-app confirmation modal — replaces the browser's native
   window.confirm(), which shows as an ugly, unbranded "localhost:5173
   says..." prompt that can't be styled. */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="confirm-dialog-close" onClick={onCancel} title="Close">
          <X size={16} />
        </button>

        <div className={`confirm-dialog-icon ${danger ? "danger" : ""}`}>
          <AlertTriangle size={22} />
        </div>

        <h3 id="confirm-dialog-title">{title}</h3>
        {message && <p>{message}</p>}

        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-cancel" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-dialog-confirm ${danger ? "danger" : ""}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
