import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { saveToken, isAuthenticated } from "../utils/auth";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import AuthActions from "../components/AuthActions";
import "../components/FuturisticStyles.css";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (values) => {
    setLoading(true);
    setServerMessage("Signing in...");
    setMessageType("info");

    try {
      const res = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      saveToken(res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.name);
      setServerMessage("Welcome back! Redirecting...");
      setMessageType("success");
      window.setTimeout(() => navigate("/dashboard"), 900);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.msg || "Login failed. Please try again.";
      setServerMessage(errorMsg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      pageTitle="Welcome back."
      pageSubtitle="Sign in to access your futuristic skill marketplace, connect with experts, and manage your courses inside a sleek control hub."
      featureBlocks={[
        { label: "Live sync", value: "Instant updates" },
        { label: "Secure access", value: "Encrypted credentials" },
      ]}
      panelLabel="Sign in"
      panelHeading="Access your account"
      panelBadge="MERN auth"
    >
      {serverMessage ? (
        <div
          className={`rounded-3xl border px-4 py-3 text-sm ${
            messageType === "error"
              ? "border-red-500/20 bg-red-500/10 text-rose-200 shake"
              : "border-cyan-500/20 bg-cyan-500/10 text-cyan-100"
          }`}
        >
          {serverMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthInput
          id="email"
          label="Email address"
          type="email"
          register={register}
          registerOptions={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          }}
          error={errors.email}
        />

        <AuthInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          register={register}
          registerOptions={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          error={errors.password}
          className="pr-12"
        >
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </AuthInput>

        <AuthActions
          primaryLabel={loading ? "Signing in..." : "Login"}
          disabled={loading}
          extraActions={[
            {
              label: "Demo credentials",
              onClick: () =>
                setServerMessage(
                  "Demo credentials: test@skillswap.com / 123456",
                ),
              className: "auth-secondary-action",
            },
          ]}
          footerText="New user?"
          footerLinkText="Create an account"
          footerLinkTo="/register"
        />
      </form>
    </AuthLayout>
  );
}
