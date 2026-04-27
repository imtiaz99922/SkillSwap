import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { removeToken, isAuthenticated } from "../utils/auth";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaComments,
  FaSearch,
  FaCalendarAlt,
  FaBell,
} from "react-icons/fa";
import "./Navbar.css";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          SkillSwap
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-menu">
          {isAuthenticated() ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/skills" className="nav-link">
                🎯 My Skills
              </Link>
              <Link to="/search" className="nav-link">
                🔍 Find Partners
              </Link>
              <Link to="/courses" className="nav-link">
                📚 Browse Courses
              </Link>
              <Link to="/payment" className="nav-link">
                💳 Wallet
              </Link>
              <Link to="/quizzes" className="nav-link">
                🧠 Quizzes
              </Link>
              <Link to="/chat" className="nav-link">
                💬 Messages
              </Link>
              <Link to="/availability" className="nav-link">
                📅 Availability
              </Link>
              <Link to="/notifications" className="nav-link">
                🔔 Notifications
              </Link>
              <Link to="/recommendations" className="nav-link">
                ⭐ Recommendations
              </Link>
              <Link to="/mentorship" className="nav-link">
                👨‍🏫 Mentorship
              </Link>
              <Link to="/referral" className="nav-link">
                🤝 Referral
              </Link>
              <Link to="/leaderboard" className="nav-link">
                🏆 Leaderboard
              </Link>
              <Link to="/sessions" className="nav-link">
                📝 Sessions
              </Link>
              <Link to="/reports" className="nav-link">
                ⚠️ Reports
              </Link>
              <Link to="/pdf-reports" className="nav-link">
                📄 Downloads
              </Link>
              <button type="button" onClick={toggleTheme} className="nav-link">
                {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="nav-link-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {isAuthenticated() ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                Dashboard
              </Link>
              <Link
                to="/skills"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                🎯 My Skills
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                🔍 Find Partners
              </Link>
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                📚 Browse Courses
              </Link>
              <Link
                to="/payment"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                💳 Wallet
              </Link>
              <Link
                to="/quizzes"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                🧠 Quizzes
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                💬 Messages
              </Link>
              <Link
                to="/availability"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                📅 Availability
              </Link>
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                🔔 Notifications
              </Link>
              <Link
                to="/recommendations"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                ⭐ Recommendations
              </Link>
              <Link
                to="/mentorship"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                👨‍🏫 Mentorship
              </Link>
              <Link
                to="/referral"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                🤝 Referral
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                🏆 Leaderboard
              </Link>
              <Link
                to="/sessions"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                📝 Sessions
              </Link>
              <Link
                to="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                ⚠️ Reports
              </Link>
              <Link
                to="/pdf-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                📄 Downloads
              </Link>
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="mobile-nav-link"
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="mobile-nav-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link-primary"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
