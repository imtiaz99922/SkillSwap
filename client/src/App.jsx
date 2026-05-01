import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import FuturisticNavbar from "./components/FuturisticNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeSocket, getSocket } from "./services/socketService";
import "./components/FuturisticStyles.css";

// Feature Pages
import ChatPage from "./features/chat/pages/ChatPage";
import SearchPage from "./features/search/pages/SearchPage";
import ReviewsPage from "./features/reviews/pages/ReviewsPage";
import AvailabilityPage from "./features/availability/pages/AvailabilityPage";
import NotificationsPage from "./features/notifications/pages/NotificationsPage";
import SkillsPage from "./features/skills/pages/SkillsPage";
import CourseCreatePage from "./features/courses/pages/CourseCreatePage";
import QuizListPage from "./features/quiz/pages/QuizListPage";
import QuizDetailPage from "./features/quiz/pages/QuizDetailPage";
import QuizCreatePage from "./features/quiz/pages/QuizCreatePage";
import CourseDetailPage from "./features/search/pages/CourseDetailPage";
import WalletPage from "./pages/WalletPage";
import SSLCommerzPaymentPage from "./pages/SSLCommerzPaymentPage";

// Course Marketplace Pages
import CoursesPage from "./pages/CoursesPage";
import CoursePage from "./pages/CoursePage";
import DemoQuizPage from "./pages/DemoQuizPage";
import CourseMaterialsPage from "./pages/CourseMaterialsPage";

// New Feature Pages
import RecommendationsPage from "./features/recommendations/pages/RecommendationsPage";
import MentorshipPage from "./features/mentorship/pages/MentorshipPage";
import ReferralPage from "./features/referral/pages/ReferralPage";
import ReportsPage from "./features/reports/pages/ReportsPage";
import PDFReportsPage from "./features/reports/pages/PDFReportsPage";
import LeaderboardPage from "./features/leaderboard/pages/LeaderboardPage";
import SessionsPage from "./features/sessions/pages/SessionsPage";

import "./styles/ModernDesign.css";

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState("light");
  const hideLayoutRoutes = ["/login", "/register", "/verify-email"];
  const showSidebar = !hideLayoutRoutes.includes(location.pathname);
  const showNavbar = !hideLayoutRoutes.includes(location.pathname);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  React.useEffect(() => {
    const stored = localStorage.getItem("theme") || "light";
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);

  // Initialize socket connection on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      const socket = initializeSocket(token);

      if (socket) {
        socket.on("connect", () => {
          console.log("App: Socket connected");
        });

        socket.on("receiveMessage", (message) => {
          console.log("App: New message received", message);
        });

        socket.on("newNotification", (notification) => {
          console.log("App: New notification received", notification);
        });
      }
    }

    return () => {
      // Keep socket connection alive for entire app session
    };
  }, []);

  return (
    <div className="app-container">
      {showNavbar && <FuturisticNavbar />}
      {showSidebar && <Sidebar theme={theme} toggleTheme={toggleTheme} />}
      <main
        className={`app-main ${showSidebar ? "with-sidebar" : ""}`}
        style={{ paddingTop: showNavbar ? "96px" : "0" }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Feature Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews/:userId"
            element={
              <ProtectedRoute>
                <ReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/availability"
            element={
              <ProtectedRoute>
                <AvailabilityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buy-credits"
            element={
              <ProtectedRoute>
                <SSLCommerzPaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <QuizListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/create"
            element={
              <ProtectedRoute>
                <QuizCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:id"
            element={
              <ProtectedRoute>
                <QuizDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skills"
            element={
              <ProtectedRoute>
                <SkillsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/create"
            element={
              <ProtectedRoute>
                <CourseCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />
          {/* New Feature Routes */}
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <RecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentorship"
            element={
              <ProtectedRoute>
                <MentorshipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referral"
            element={
              <ProtectedRoute>
                <ReferralPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdf-reports"
            element={
              <ProtectedRoute>
                <PDFReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionsPage />
              </ProtectedRoute>
            }
          />
          {/* Course Marketplace Routes */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute>
                <CoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/demo-quiz/:courseId"
            element={
              <ProtectedRoute>
                <DemoQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/materials"
            element={
              <ProtectedRoute>
                <CourseMaterialsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
