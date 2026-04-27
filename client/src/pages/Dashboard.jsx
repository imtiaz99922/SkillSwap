import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import {
  FaUserCircle,
  FaTrophy,
  FaFire,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/auth/me")
      .then((res) => {
        if (mounted) setUser(res.data.user);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    api
      .get("/analytics")
      .then((res) => {
        if (mounted) setAnalytics(res.data);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [user]);

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  const summary = analytics?.summary || {};
  const sessionData = [
    { day: "Apr 14", val: 0 },
    { day: "Apr 15", val: 0 },
    { day: "Apr 16", val: 0 },
    { day: "Apr 17", val: 0 },
    { day: "Apr 18", val: 0 },
    { day: "Apr 19", val: 0 },
    { day: "Apr 20", val: 1 },
  ];

  const skills = [
    { name: "JavaScript", pct: 72, color: "var(--indigo)" },
    { name: "Python", pct: 58, color: "var(--sky)" },
    { name: "UI Design", pct: 85, color: "var(--emerald)" },
    { name: "Data Analysis", pct: 41, color: "var(--amber)" },
    { name: "React", pct: 65, color: "var(--coral)" },
  ];

  const maxSessionVal = Math.max(...sessionData.map((d) => d.val), 1);
  const colors = [
    "#4338CA",
    "#6366F1",
    "#8B5CF6",
    "#0284C7",
    "#059669",
    "#D97706",
    "#4338CA",
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.style.setProperty("--bg", "#0F0F11");
      document.documentElement.style.setProperty("--surface", "#1A1A1F");
      document.documentElement.style.setProperty("--surface2", "#222228");
      document.documentElement.style.setProperty(
        "--border",
        "rgba(255,255,255,0.07)",
      );
      document.documentElement.style.setProperty(
        "--border-md",
        "rgba(255,255,255,0.12)",
      );
      document.documentElement.style.setProperty("--text-primary", "#F5F4F0");
      document.documentElement.style.setProperty("--text-secondary", "#9B9A96");
      document.documentElement.style.setProperty("--text-muted", "#5E5D5A");
    } else {
      document.documentElement.style.setProperty("--bg", "#F3F1EE");
      document.documentElement.style.setProperty("--surface", "#FFFFFF");
      document.documentElement.style.setProperty("--surface2", "#F8F7F5");
      document.documentElement.style.setProperty(
        "--border",
        "rgba(0,0,0,0.07)",
      );
      document.documentElement.style.setProperty(
        "--border-md",
        "rgba(0,0,0,0.12)",
      );
      document.documentElement.style.setProperty("--text-primary", "#111110");
      document.documentElement.style.setProperty("--text-secondary", "#6B6A67");
      document.documentElement.style.setProperty("--text-muted", "#9E9D9A");
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="dashboard-main">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="header-top">
          <div className="logo">
            <svg
              className="logo-icon"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="36" height="36" rx="10" fill="#4338CA" />
              <rect
                x="6"
                y="8"
                width="11"
                height="11"
                rx="4"
                fill="white"
                fillOpacity="0.95"
              />
              <rect
                x="19"
                y="17"
                width="11"
                height="11"
                rx="4"
                fill="#A5B4FC"
              />
              <path
                d="M19.5 13 L27 8 M27 8 L27 13 M27 8 L22 8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.5 23 L9 28 M9 28 L9 23 M9 28 L14 28"
                stroke="#6366F1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="logo-wordmark">SkillSwap</span>
          </div>
        </div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">
          <span className="live-badge">
            <span className="live-dot"></span>LIVE
          </span>
          Welcome back, <strong>{user?.name || "User"}</strong> — you're on a
          streak 🔥
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <div className="stat-card s1">
          <div className="stat-top">
            <div className="stat-label">Total Attempts</div>
            <div className="stat-emoji-wrap">🎯</div>
          </div>
          <div className="stat-val">{summary.totalAttempts || 0}</div>
          <div className="stat-desc">Challenges completed</div>
          <div className="stat-bar">
            <div className="stat-bar-fill"></div>
          </div>
        </div>
        <div className="stat-card s2">
          <div className="stat-top">
            <div className="stat-label">Average Score</div>
            <div className="stat-emoji-wrap">📊</div>
          </div>
          <div className="stat-val">{(summary.avgScore || 0).toFixed(1)}%</div>
          <div className="stat-desc">Based on all attempts</div>
          <div className="stat-bar">
            <div className="stat-bar-fill"></div>
          </div>
        </div>
        <div className="stat-card s3">
          <div className="stat-top">
            <div className="stat-label">Pass Rate</div>
            <div className="stat-emoji-wrap">✅</div>
          </div>
          <div className="stat-val">{(summary.passRate || 0).toFixed(1)}%</div>
          <div className="stat-desc">Success ratio</div>
          <div className="stat-bar">
            <div className="stat-bar-fill"></div>
          </div>
        </div>
        <div className="stat-card s4">
          <div className="stat-top">
            <div className="stat-label">Credits Earned</div>
            <div className="stat-emoji-wrap">🏆</div>
          </div>
          <div className="stat-val">{summary.creditsEarned || 0}</div>
          <div className="stat-desc">Total credits</div>
          <div className="stat-bar">
            <div className="stat-bar-fill"></div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="charts-row">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Login Sessions</div>
            <span className="card-badge">Last 7 days</span>
          </div>
          <div className="session-grid">
            {sessionData.map((d, i) => {
              const pct = Math.max((d.val / maxSessionVal) * 100, 4);
              return (
                <div key={i} className="session-col">
                  <div className="session-bar-wrap">
                    <div
                      className="session-bar"
                      style={{
                        height: `${pct}%`,
                        background: colors[i],
                        borderRadius: "6px 6px 0 0",
                        animationDelay: `${0.7 + i * 0.07}s`,
                      }}
                    ></div>
                  </div>
                  <div className="session-label">{d.day.split(" ")[1]}</div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "18px",
              paddingTop: "14px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Peak:{" "}
              <strong style={{ color: "var(--text-primary)" }}>Apr 20</strong>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Total:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                1 session
              </strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Skill Levels</div>
            <span className="card-badge">Your profile</span>
          </div>
          <div className="skill-list">
            {skills.map((skill, i) => (
              <div key={i} className="skill-row">
                <div className="skill-meta">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-pct">{skill.pct}%</span>
                </div>
                <div className="skill-track">
                  <div
                    className="skill-fill"
                    style={{
                      width: `${skill.pct}%`,
                      background: skill.color,
                      animationDelay: `${0.8 + i * 0.1}s`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="bottom-row">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="profile-card">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{user?.name || "User"}</div>
            <div className="profile-handle">
              @{user?.email?.split("@")[0] || "user"}
            </div>
            <div className="profile-stats">
              <div>
                <div className="profile-stat-val">0</div>
                <div className="profile-stat-label">Swaps</div>
              </div>
              <div>
                <div className="profile-stat-val">0</div>
                <div className="profile-stat-label">Partners</div>
              </div>
              <div>
                <div className="profile-stat-val">
                  {summary.creditsEarned || 0}
                </div>
                <div className="profile-stat-label">Credits</div>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: "18px" }}>
            <div className="card-title" style={{ marginBottom: "14px" }}>
              Quick Actions
            </div>
            <div className="quick-actions">
              <div className="action-btn" onClick={() => navigate("/skills")}>
                <span className="action-icon">➕</span>
                Add Skill
              </div>
              <div className="action-btn" onClick={() => navigate("/search")}>
                <span className="action-icon">🤝</span>
                Find Match
              </div>
              <div className="action-btn" onClick={() => navigate("/quizzes")}>
                <span className="action-icon">🧠</span>
                Take Quiz
              </div>
              <div className="action-btn" onClick={() => navigate("/chat")}>
                <span className="action-icon">💬</span>
                Message
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
            <span className="card-badge">This week</span>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div
                className="activity-icon"
                style={{ background: "var(--indigo-light)" }}
              >
                🎯
              </div>
              <div className="activity-text">
                <div className="activity-title">Profile created</div>
                <div className="activity-sub">You joined SkillSwap</div>
              </div>
              <div className="activity-time">Today</div>
            </div>
            <div className="activity-item">
              <div
                className="activity-icon"
                style={{ background: "var(--sky-light)" }}
              >
                🔍
              </div>
              <div className="activity-text">
                <div className="activity-title">Explore partners</div>
                <div className="activity-sub">Browse the network</div>
              </div>
              <div className="activity-time">Now</div>
            </div>
            <div className="activity-item">
              <div
                className="activity-icon"
                style={{ background: "var(--emerald-light)" }}
              >
                🧠
              </div>
              <div className="activity-text">
                <div className="activity-title">Take your first quiz</div>
                <div className="activity-sub">Verify your skills</div>
              </div>
              <div className="activity-time">Pending</div>
            </div>
            <div className="activity-item">
              <div
                className="activity-icon"
                style={{ background: "var(--amber-light)" }}
              >
                💳
              </div>
              <div className="activity-text">
                <div className="activity-title">Earn credits</div>
                <div className="activity-sub">Complete your first swap</div>
              </div>
              <div className="activity-time">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
