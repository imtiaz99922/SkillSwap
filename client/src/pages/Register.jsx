import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) return setError("Please fill all fields");
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login", {
        state: {
          successMessage: "Account created successfully. Please sign in.",
        },
      });
    } catch (err) {
      setError(err?.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page-new">
      <div className="login-container-new">
        {/* Left Section */}
        <div className="login-left">
          <div className="logo-brand">SkillSwap</div>
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">
            Join thousands learning and sharing skills today
          </p>
        </div>

        {/* Right Section - Form */}
        <div className="login-form-container">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="signup-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
