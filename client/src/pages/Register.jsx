import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import AuthActions from "../components/AuthActions";
import "../components/FuturisticStyles.css";

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
    <AuthLayout
      pageTitle="Create Account"
      pageSubtitle="Join thousands learning and sharing skills today. Build your profile and start connecting with learners, mentors, and collaborators."
      featureBlocks={[
        { label: "Trusted platform", value: "SkillSwap community" },
        { label: "Fast onboarding", value: "Secure signup" },
      ]}
      panelLabel="Register"
      panelHeading="Create your account"
      panelBadge="SkillSwap sign-up"
    >
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
        <AuthInput
          id="name"
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />

        <AuthInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <AuthActions
          primaryLabel={loading ? "Creating Account..." : "Create Account"}
          disabled={loading}
          footerText="Already have an account?"
          footerLinkText="Sign in here"
          footerLinkTo="/login"
        />
      </form>
    </AuthLayout>
  );
}
