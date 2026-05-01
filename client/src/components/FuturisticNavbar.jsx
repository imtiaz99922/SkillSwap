import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaMoon, FaSun } from "react-icons/fa";
import { isAuthenticated, removeToken } from "../utils/auth";
import "./FuturisticStyles.css";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/courses", label: "Courses" },
  { to: "/skills", label: "Skills" },
  { to: "/chat", label: "Chat" },
  { to: "/notifications", label: "Notifications" },
  { to: "/recommendations", label: "Recommendations" },
];

export default function FuturisticNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const activeLink = (path) => location.pathname === path;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-cyan-500/20 bg-black/30 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 text-slate-100">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="group flex items-center gap-3 text-lg font-semibold tracking-tight text-cyan-100"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/60 bg-cyan-600/10 text-cyan-200 shadow-[0_0_28px_rgba(0,212,255,0.28)] animate-pulse">
              <span className="text-xl">S</span>
            </span>
            <span className="leading-none">SkillSwap</span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <div className="rounded-full border border-cyan-400/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200 shadow-[0_0_15px_rgba(0,212,255,0.12)]">
              {time}
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {isAuthenticated() ? (
            navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`group relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  activeLink(link.to)
                    ? "text-cyan-300 shadow-[0_0_28px_rgba(34,211,255,0.2)]"
                    : "text-slate-300 hover:text-cyan-100"
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <span className="pointer-events-none absolute left-0 bottom-1 h-0.5 w-full origin-left scale-x-0 rounded-full bg-cyan-400 transition-transform duration-300 group-hover:scale-x-100"></span>
              </Link>
            ))
          ) : (
            <>
              <Link
                className="px-4 py-2 text-sm text-slate-200 hover:text-cyan-100"
                to="/login"
              >
                Sign In
              </Link>
              <Link
                className="rounded-full bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/40"
                to="/register"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-slate-950/40 text-cyan-100 transition hover:bg-cyan-500/15"
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
          {isAuthenticated() ? (
            <button
              onClick={handleLogout}
              className="hidden rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-500/20 md:inline-flex"
            >
              Logout
            </button>
          ) : null}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-slate-950/40 text-cyan-100 transition hover:bg-cyan-500/15 md:hidden"
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <div
        className={`mx-auto max-w-[1440px] overflow-hidden transition-[max-height] duration-500 md:hidden ${mobileOpen ? "max-h-96" : "max-h-0"}`}
      >
        <div className="space-y-2 border-t border-cyan-500/10 bg-slate-950/95 px-4 py-4">
          {isAuthenticated() ? (
            navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm transition ${
                  activeLink(link.to)
                    ? "bg-cyan-400/10 text-cyan-200"
                    : "text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-100"
                }`}
              >
                {link.label}
              </Link>
            ))
          ) : (
            <>
              <Link
                to="/login"
                className="block rounded-2xl px-4 py-3 text-sm text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block rounded-2xl bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
              >
                Sign Up
              </Link>
            </>
          )}
          {isAuthenticated() ? (
            <button
              type="button"
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="w-full rounded-2xl border border-cyan-500/20 bg-slate-950/60 px-4 py-3 text-left text-sm text-cyan-100 transition hover:bg-cyan-500/10"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
