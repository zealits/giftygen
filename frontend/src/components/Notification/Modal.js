import React, { useEffect } from "react";
/* import "./Modal.css"; */

const Modal = ({ title = "Notification", message, onClose, variant = "success", showClose = true }) => {
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className={`notification-modal ${variant}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="notification-modal-header">
          <h4 className="notification-modal-title">{title}</h4>
          {showClose && (
            <button className="notification-modal-close" aria-label="Close" onClick={onClose}>
              ×
            </button>
          )}
        </div>
        <div className="notification-modal-body">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>
        <div className="notification-modal-footer">
          <button className="notification-modal-ok" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

