import React from "react";

/**
 * Catches React render errors (e.g. Minified React error #130 - invalid element type)
 * and shows a fallback UI instead of a blank page in production.
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const is130 =
        this.state.error?.message?.includes("130") || this.state.error?.message?.includes("Element type is invalid");
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#0f172a",
            color: "#e2e8f0",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Something went wrong</h1>
          {is130 && (
            <p style={{ maxWidth: 420, marginBottom: 16, color: "#94a3b8" }}>
              A component could not be loaded (invalid or missing export). This often happens when an import is
              undefined—check that every lazy-loaded or imported component uses a default export and that the path is
              correct.
            </p>
          )}
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: 24 }}>
            {process.env.NODE_ENV === "development" && this.state.error?.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              cursor: "pointer",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
