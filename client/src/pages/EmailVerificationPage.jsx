import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../services/api";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import AuthActions from "../components/AuthActions";
import "../components/FuturisticStyles.css";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("No verification token found");
        return;
      }

      try {
        const response = await axios.post(`${API_BASE}/auth/verify-email`, {
          token,
        });
        setStatus("success");
        setMessage(response.data.msg);
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.msg || "Verification failed");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email address");
      setStatus("error");
      return;
    }

    setResendLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/resend-verification`, {
        email,
      });
      setMessage("Verification email resent! Check your inbox.");
      setStatus("success");
      setEmail("");
    } catch (error) {
      setMessage(error.response?.data?.msg || "Failed to resend email");
      setStatus("error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      pageTitle="Verify your email"
      pageSubtitle="Confirm your inbox and finish the secure onboarding process with a sleek SkillSwap experience."
      featureBlocks={[
        { label: "Verified access", value: "Secure login" },
        { label: "Instant setup", value: "Fast onboarding" },
      ]}
      panelLabel="Email confirmation"
      panelHeading="Confirm your account"
      panelBadge="Secure access"
    >
      {status === "verifying" && (
        <div className="auth-status-panel">
          <div className="auth-status-icon">⏳</div>
          <h2 className="text-2xl font-semibold text-cyan-100 mt-4">
            Verifying Email
          </h2>
          <p className="text-slate-300 mt-3">
            Please wait while we verify your email address...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="auth-status-panel">
          <div className="auth-status-icon success-icon">
            <FaCheckCircle />
          </div>
          <h2 className="text-2xl font-semibold text-cyan-100 mt-4">
            Email Verified!
          </h2>
          <p className="text-slate-300 mt-3">{message}</p>
          <div className="mt-6">
            <Link to="/login" className="login-button futuristic-button">
              Go to Login
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="auth-status-panel">
          <div className="auth-status-icon error-icon">
            <FaExclamationCircle />
          </div>
          <h2 className="text-2xl font-semibold text-cyan-100 mt-4">
            Verification Error
          </h2>
          <p className="text-slate-300 mt-3">{message}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResendEmail();
            }}
            className="mt-6 space-y-5"
          >
            <AuthInput
              id="verification-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <AuthActions
              primaryLabel={
                resendLoading ? "Sending..." : "Resend Verification Email"
              }
              disabled={resendLoading}
            />
          </form>

          <p className="text-sm text-slate-400 mt-5">
            Already have a verified account?{" "}
            <Link to="/login" className="signup-link">
              Go to Login
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
