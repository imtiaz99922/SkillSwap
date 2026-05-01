import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUser,
  FaSearch,
  FaWallet,
  FaBrain,
  FaComments,
  FaCalendarAlt,
  FaBell,
  FaStar,
  FaUsers,
  FaHandshake,
  FaFlag,
  FaTrophy,
  FaFileAlt,
  FaFileDownload,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaBook,
} from "react-icons/fa";
import { removeToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ theme, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: FaHome, label: "Dashboard", path: "/dashboard" },
    { icon: FaUser, label: "My Skills", path: "/skills" },
    { icon: FaSearch, label: "Find Partners", path: "/search" },
    { icon: FaBook, label: "My Courses", path: "/courses" },
    { icon: FaWallet, label: "Wallet", path: "/wallet" },
    { icon: FaBrain, label: "Quizzes", path: "/quizzes" },
    { icon: FaComments, label: "Messages", path: "/chat" },
    { icon: FaCalendarAlt, label: "Availability", path: "/availability" },
    { icon: FaBell, label: "Notifications", path: "/notifications" },
    { icon: FaStar, label: "Recommendations", path: "/recommendations" },
    { icon: FaUsers, label: "Mentorship", path: "/mentorship" },
    { icon: FaHandshake, label: "Referral", path: "/referral" },
    { icon: FaTrophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: FaFileAlt, label: "Sessions", path: "/sessions" },
    { icon: FaFlag, label: "Reports", path: "/reports" },
    { icon: FaFileDownload, label: "Downloads", path: "/pdf-reports" },
  ];

  const isActive = (path) => location.pathname === path;

  function handleLogout() {
    removeToken();
    navigate("/login");
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            {isOpen && <span>SkillSwap</span>}
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
              title={!isOpen ? item.label : ""}
            >
              <item.icon className="sidebar-icon" />
              {isOpen && <span className="sidebar-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-footer-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? (
              <FaSun className="sidebar-icon" />
            ) : (
              <FaMoon className="sidebar-icon" />
            )}
            {isOpen && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
          </button>
          <button
            className="sidebar-footer-btn logout"
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt className="sidebar-icon" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="sidebar-mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sidebar-mobile-header">
              <Link to="/" className="sidebar-logo">
                SkillSwap
              </Link>
              <button onClick={() => setIsMobileOpen(false)}>
                <FaTimes size={24} />
              </button>
            </div>

            <nav className="sidebar-mobile-nav">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-mobile-item ${
                    isActive(item.path) ? "active" : ""
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="sidebar-icon" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="sidebar-mobile-footer">
              <button
                className="sidebar-mobile-btn"
                onClick={() => {
                  toggleTheme();
                  setIsMobileOpen(false);
                }}
              >
                {theme === "dark" ? <FaSun /> : <FaMoon />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                className="sidebar-mobile-btn logout"
                onClick={() => {
                  handleLogout();
                  setIsMobileOpen(false);
                }}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
