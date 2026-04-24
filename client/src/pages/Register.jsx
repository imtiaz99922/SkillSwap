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
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !email || !password) return setError("Please fill all fields");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess(response.data?.msg || "Account created successfully!");

      // Reset form
      setName("");
      setEmail("");
      setPassword("");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            successMessage: "Account created! You can now log in.",
          },
        });
      }, 3000);
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
          {success && (
            <div className="success-message" style={{ marginBottom: "1rem" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontSize: "1.2rem" }}>✓</span>
                <div>
                  <strong>Registration Successful!</strong>
                  <p style={{ fontSize: "0.9rem", marginTop: "4px" }}>
                    Your account has been created. Redirecting to login...
                  </p>
                </div>
              </div>
            </div>
          )}

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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
