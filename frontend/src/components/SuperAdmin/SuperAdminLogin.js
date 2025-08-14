import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SuperAdminLogin.css";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/superadmin/login", {
        email,
        password,
      });

      if (response.data.success) {
        // Store token in localStorage or cookies
        localStorage.setItem("superAdminToken", response.data.token);
        localStorage.setItem("superAdminRole", "SuperAdmin");

        // Redirect to super admin dashboard
        navigate("/superadmin/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="super-admin-login-container">
      <div className="super-admin-login-card">
        <div className="super-admin-login-header">
          <h1>Super Admin Login</h1>
          <p>Access the administrative panel</p>
        </div>

        <form onSubmit={handleSubmit} className="super-admin-login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="super-admin-login-footer">
          <p>Restricted access only</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
