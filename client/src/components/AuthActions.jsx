import React from "react";
import { Link } from "react-router-dom";

export default function AuthActions({
  primaryLabel = "Continue",
  disabled = false,
  extraActions = [],
  footerText,
  footerLinkText,
  footerLinkTo,
  footerNote,
}) {
  return (
    <div className="auth-actions">
      <div className="auth-buttons space-y-4">
        <button
          type="submit"
          disabled={disabled}
          className="login-button futuristic-button"
        >
          {primaryLabel}
        </button>

        {extraActions.length > 0 && (
          <div className="auth-secondary-buttons grid gap-3">
            {extraActions.map((action, index) => (
              <button
                key={index}
                type={action.type || "button"}
                className={`futuristic-button auth-secondary-button ${
                  action.className || ""
                }`}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {(footerText || footerLinkText) && (
        <div className="login-footer auth-footer">
          <p>
            {footerText}{" "}
            {footerLinkText && (
              <Link to={footerLinkTo} className="signup-link">
                {footerLinkText}
              </Link>
            )}
          </p>
          {footerNote && <p className="auth-note">{footerNote}</p>}
        </div>
      )}
    </div>
  );
}
