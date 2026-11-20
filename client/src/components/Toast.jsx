import React from "react";
import { CheckCircle2, AlertCircle, Heart, X } from "lucide-react";

export function Toast({ toast }) {
  if (!toast) return null;

  const { type = "info", message } = typeof toast === "string" ? { message: toast, type: "info" } : toast;

  const getIcon = () => {
    switch (type) {
      case "like":
        return <Heart size={16} fill="currentColor" className="toast-icon like" />;
      case "pass":
        return <X size={16} className="toast-icon pass" />;
      case "error":
        return <AlertCircle size={16} className="toast-icon error" />;
      case "success":
        return <CheckCircle2 size={16} className="toast-icon success" />;
      default:
        return null;
    }
  };

  return (
    <div className={`toast-container ${type}`} role="status" aria-live="polite">
      <div className="toast-body">
        {getIcon()}
        <span>{message}</span>
      </div>
    </div>
  );
}
