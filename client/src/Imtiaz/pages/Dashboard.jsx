import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChartLine, FaShieldAlt, FaTrophy, FaRocket } from "react-icons/fa";
import api from "../../services/api";
import HeroSection from "../../components/HeroSection";
import DataCard from "../../components/DataCard";
import FuturisticTable from "../../components/FuturisticTable";
import FuturisticModal from "../../components/FuturisticModal";
import LiveStatsWidget from "../../components/LiveStatsWidget";
import "../../components/FuturisticStyles.css";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .get("/auth/me")
      .then((res) => {
        if (mounted) setUser(res.data.user);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
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
    return () => {
      mounted = false;
    };
  }, [user]);

  const summary = analytics?.summary || {
    totalAttempts: 0,
    avgScore: 0,
    passRate: 0,
    creditsEarned: 0,
  };

  const sessionData = [
    { day: "Apr 14", val: 14 },
    { day: "Apr 15", val: 18 },
    { day: "Apr 16", val: 22 },
    { day: "Apr 17", val: 28 },
    { day: "Apr 18", val: 24 },
    { day: "Apr 19", val: 30 },
    { day: "Apr 20", val: 26 },
  ];

  const tableColumns = [
    { header: "Day", accessor: "day" },
    { header: "Value", accessor: "val" },
  ];

  if (loading) {
    return (
      <div className="dashboard-main min-h-[calc(100vh-96px)] flex items-center justify-center px-6 pt-28 text-slate-300">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-main feature-page px-4 pb-12 pt-28 text-slate-100 sm:px-6 lg:px-8">
      <HeroSection onCta={() => navigate("/courses")} />

      <div className="mt-8 grid gap-6 xl:grid-cols-4">
        <DataCard
          title="Total Attempts"
          value={summary.totalAttempts || 0}
          trend="Challenges completed"
          icon={FaChartLine}
          isLoading={loading}
        />
        <DataCard
          title="Average Score"
          value={`${Number(summary.avgScore || 0).toFixed(1)}%`}
          trend="Based on recent activity"
          icon={FaShieldAlt}
          isLoading={loading}
        />
        <DataCard
          title="Pass Rate"
          value={`${Number(summary.passRate || 0).toFixed(1)}%`}
          trend="Current success ratio"
          icon={FaTrophy}
          isLoading={loading}
        />
        <DataCard
          title="Credits Earned"
          value={summary.creditsEarned || 0}
          trend="Total learning credits"
          icon={FaRocket}
          isLoading={loading}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <LiveStatsWidget />
        <div className="space-y-6">
          <FuturisticTable
            data={sessionData}
            columns={tableColumns}
            isLoading={loading}
          />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full rounded-3xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4 text-left text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Open control briefing
          </button>
        </div>
      </div>

      <FuturisticModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="System Control Briefing"
      >
        <div className="space-y-5 text-slate-300">
          <p>
            You are viewing a live futuristic interface designed to blend
            analytics with actionable status insights.
          </p>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              • Realtime pipeline status:{" "}
              <span className="text-cyan-200">Nominal</span>
            </li>
            <li>
              • Data refresh interval:{" "}
              <span className="text-cyan-200">5 seconds</span>
            </li>
            <li>
              • Alerts channel:{" "}
              <span className="text-cyan-200">Operational</span>
            </li>
          </ul>
          <p className="text-sm text-slate-500">
            Close this briefing to continue exploring courses, quizzes, and
            collaboration features with your upgraded dashboard experience.
          </p>
        </div>
      </FuturisticModal>
    </div>
  );
}
