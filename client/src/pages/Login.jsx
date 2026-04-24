import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { saveToken, isAuthenticated } from "../utils/auth";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const typeIn = (value, callback) => {
    const input = document.getElementById("emailIn");
    let i = 0;
    input.value = "";
    const interval = setInterval(() => {
      if (i < value.length) {
        input.value += value[i];
        i++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 38);
  };

  const fillDemo = () => {
    const emailEl = document.getElementById("emailIn");
    const passEl = document.getElementById("passIn");
    emailEl.value = "";
    passEl.value = "";
    typeIn("test@skillswap.com", () => {
      typeIn(
        "123456",
        () => {
          showMsg("Demo credentials filled!", "#5DCAA5");
        },
        passEl,
      );
    });
  };

  const typeInPassword = (value, callback) => {
    const input = document.getElementById("passIn");
    let i = 0;
    input.value = "";
    const interval = setInterval(() => {
      if (i < value.length) {
        input.value += value[i];
        i++;
      } else {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 38);
  };

  const showMsg = (txt, color) => {
    setMessage(txt);
    setMessageColor(color);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignIn = async (e) => {
    e?.preventDefault();
    const emailVal =
      email.trim() || document.getElementById("emailIn")?.value.trim();
    const passVal = password || document.getElementById("passIn")?.value;

    if (!emailVal) {
      showMsg("Please enter your email", "#F09595");
      return;
    }
    if (!passVal) {
      showMsg("Please enter your password", "#F09595");
      return;
    }

    setLoading(true);
    showMsg("Signing you in...", "rgba(255,255,255,0.4)");

    try {
      const res = await api.post("/auth/login", {
        email: emailVal,
        password: passVal,
      });

      saveToken(res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.name);
      setTimeout(() => {
        showMsg("Welcome back! Redirecting...", "#5DCAA5");
        setTimeout(() => navigate("/dashboard"), 800);
      }, 1400);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.msg || "Login failed. Please try again.";
      showMsg(errorMsg, "#F09595");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0b1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        margin: "0",
      }}
    >
      <div
        className="scene"
        style={{ borderRadius: "0", maxWidth: "100%", width: "100%" }}
      >
        {/* Animated Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "420px",
              height: "420px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(83,74,183,0.35) 0%,transparent 70%)",
              top: "-100px",
              left: "-80px",
              animation: "float1 9s ease-in-out infinite",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              width: "350px",
              height: "350px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(29,158,117,0.28) 0%,transparent 70%)",
              bottom: "-80px",
              right: "-60px",
              animation: "float2 11s ease-in-out infinite",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(127,119,221,0.2) 0%,transparent 70%)",
              top: "40%",
              left: "35%",
              animation: "float3 7s ease-in-out infinite",
            }}
          ></div>

          <svg
            style={{
              position: "absolute",
              top: "50%",
              left: "28%",
              transform: "translate(-50%,-50%)",
              opacity: 0.12,
            }}
            width="320"
            height="320"
            viewBox="0 0 320 320"
          >
            <circle
              cx="160"
              cy="160"
              r="100"
              fill="none"
              stroke="#7F77DD"
              strokeWidth="0.8"
              strokeDasharray="5 10"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              fill="none"
              stroke="#1D9E75"
              strokeWidth="0.5"
              strokeDasharray="3 14"
            />
            <g
              style={{
                transformOrigin: "160px 160px",
                animation: "rotateSlow 18s linear infinite",
              }}
            >
              <circle cx="260" cy="160" r="5" fill="#7F77DD" opacity="0.7" />
            </g>
            <g
              style={{
                transformOrigin: "160px 160px",
                animation: "rotateSlow 26s linear infinite",
                animationDirection: "reverse",
              }}
            >
              <circle cx="300" cy="160" r="4" fill="#1D9E75" opacity="0.6" />
            </g>
            <g
              style={{
                transformOrigin: "160px 160px",
                animation: "rotateSlow 12s linear infinite",
              }}
            >
              <circle cx="220" cy="160" r="3.5" fill="#AFA9EC" opacity="0.5" />
            </g>
          </svg>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.015) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.015) 40px)",
            }}
          ></div>
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          {/* Main Content */}
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              padding: "0",
              gap: "20px",
              height: "100%",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                paddingLeft: "60px",
                paddingRight: "40px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  animation: "slideRight 0.5s 0.1s ease both",
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    background: "rgba(127,119,221,0.18)",
                    border: "1px solid rgba(127,119,221,0.3)",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#7F77DD",
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#AFA9EC",
                      fontWeight: 500,
                    }}
                  >
                    Learn. Teach. Grow.
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: "34px",
                    fontWeight: 500,
                    color: "#fff",
                    margin: "0 0 12px",
                    lineHeight: 1.15,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Welcome
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(90deg,#7F77DD,#1D9E75)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    back
                  </span>
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.45)",
                    margin: "0 0 28px",
                    lineHeight: 1.6,
                  }}
                >
                  Sign in to continue your learning journey
                  <br />
                  and share your skills with others.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div className="stat-pill" style={{ animationDelay: "0.3s" }}>
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#7F77DD",
                      flexShrink: 0,
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    500+ skills to explore
                  </span>
                </div>
                <div className="stat-pill" style={{ animationDelay: "0.4s" }}>
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#1D9E75",
                      flexShrink: 0,
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    12k+ active learners
                  </span>
                </div>
                <div className="stat-pill" style={{ animationDelay: "0.5s" }}>
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#5DCAA5",
                      flexShrink: 0,
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    Earn credits by teaching
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "28px",
                  display: "flex",
                  alignItems: "center",
                  gap: "-6px",
                  animation: "fadeUp 0.4s 0.6s ease both",
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                <div
                  className="avatar"
                  style={{ background: "#534AB7", color: "#AFA9EC", zIndex: 3 }}
                >
                  AK
                </div>
                <div
                  className="avatar"
                  style={{
                    background: "#0F6E56",
                    color: "#9FE1CB",
                    marginLeft: "-8px",
                    zIndex: 2,
                  }}
                >
                  SR
                </div>
                <div
                  className="avatar"
                  style={{
                    background: "#3C3489",
                    color: "#CECBF6",
                    marginLeft: "-8px",
                    zIndex: 1,
                  }}
                >
                  MJ
                </div>
                <div
                  className="avatar"
                  style={{
                    background: "#1a1a30",
                    color: "rgba(255,255,255,0.4)",
                    marginLeft: "-8px",
                    borderStyle: "dashed",
                  }}
                >
                  +9k
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.35)",
                    marginLeft: "12px",
                  }}
                >
                  joined this month
                </span>
              </div>
            </div>

            {/* Right Section - Form */}
            <div
              style={{ width: "340px", flexShrink: 0, paddingRight: "60px" }}
            >
              <div
                className="glass"
                style={{
                  padding: "30px",
                  animation: "slideLeft 0.5s 0.2s ease both",
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#fff",
                    margin: "0 0 4px",
                  }}
                >
                  Sign in
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.35)",
                    margin: "0 0 22px",
                  }}
                >
                  Enter your credentials to continue
                </p>

                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "rgba(174,169,236,0.7)",
                      letterSpacing: "0.08em",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    EMAIL
                  </label>
                  <input
                    className="field"
                    type="email"
                    placeholder="you@example.com"
                    id="emailIn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "rgba(174,169,236,0.7)",
                      letterSpacing: "0.08em",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    PASSWORD
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="field"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      id="passIn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: "44px" }}
                    />
                    <span
                      id="eyeBtn"
                      onClick={togglePassword}
                      style={{
                        position: "absolute",
                        right: "13px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "rgba(255,255,255,0.3)",
                        userSelect: "none",
                      }}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right", marginBottom: "20px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#7F77DD",
                      cursor: "pointer",
                    }}
                  >
                    Forgot password?
                  </span>
                </div>

                <button
                  className="signin-btn"
                  onClick={handleSignIn}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <button
                  className="demo-btn"
                  style={{ marginTop: "10px" }}
                  onClick={fillDemo}
                >
                  Use demo credentials
                </button>

                <div
                  id="msg"
                  style={{
                    minHeight: "18px",
                    marginTop: "12px",
                    textAlign: "center",
                    fontSize: "13px",
                    transition: "all 0.3s",
                    color: messageColor,
                  }}
                >
                  {message}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: "14px 0",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "0.5px",
                      background: "rgba(255,255,255,0.1)",
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    or
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "0.5px",
                      background: "rgba(255,255,255,0.1)",
                    }}
                  ></div>
                </div>

                <p
                  style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.3)",
                    margin: 0,
                  }}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "#7F77DD",
                      cursor: "pointer",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
