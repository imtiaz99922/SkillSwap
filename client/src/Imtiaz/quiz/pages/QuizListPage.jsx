import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quizApi } from "../services/quizApi";
import { demoQuizApi } from "../services/demoQuizApi";
import "../../../styles/ModernDesign.css";

export default function QuizListPage() {
  const [challenges, setChallenges] = useState([]);
  const [demoQuizzes, setDemoQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all", "challenges", "demos"

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [challengesData, demoQuizzesData] = await Promise.all([
          quizApi.getChallenges(),
          demoQuizApi.getAllDemoQuizzes(),
        ]);

        if (mounted) {
          setChallenges(challengesData);
          setDemoQuizzes(demoQuizzesData);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load quizzes.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="feature-page">
      {/* PAGE HEADER */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1 className="page-title">Quizzes & Challenges</h1>
          <p className="page-subtitle">
            Test your skills, earn credits, and unlock progress with interactive
            quizzes
          </p>
        </div>
        <Link
          to="/quizzes/create"
          className="btn btn-primary"
          style={{ marginTop: "8px", whiteSpace: "nowrap" }}
        >
          ➕ Create Quiz
        </Link>
      </div>

      {/* TABS */}
      <div
        style={{
          marginBottom: "24px",
          borderBottom: "2px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", gap: "24px" }}>
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "12px 0",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: activeTab === "all" ? "600" : "400",
              color:
                activeTab === "all"
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              borderBottom:
                activeTab === "all" ? "3px solid var(--primary)" : "none",
              marginBottom: "-2px",
            }}
          >
            All ({challenges.length + demoQuizzes.length})
          </button>
          <button
            onClick={() => setActiveTab("challenges")}
            style={{
              padding: "12px 0",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: activeTab === "challenges" ? "600" : "400",
              color:
                activeTab === "challenges"
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              borderBottom:
                activeTab === "challenges"
                  ? "3px solid var(--primary)"
                  : "none",
              marginBottom: "-2px",
            }}
          >
            Challenges ({challenges.length})
          </button>
          <button
            onClick={() => setActiveTab("demos")}
            style={{
              padding: "12px 0",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: activeTab === "demos" ? "600" : "400",
              color:
                activeTab === "demos"
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              borderBottom:
                activeTab === "demos" ? "3px solid var(--primary)" : "none",
              marginBottom: "-2px",
            }}
          >
            Demo Quizzes ({demoQuizzes.length})
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div
          className="card"
          style={{
            background: "var(--coral-light)",
            borderColor: "var(--coral)",
            color: "var(--text-primary)",
            padding: "24px",
          }}
        >
          ⚠️ {error}
        </div>
      ) : (activeTab === "challenges" && challenges.length === 0) ||
        (activeTab === "demos" && demoQuizzes.length === 0) ||
        (activeTab === "all" &&
          challenges.length === 0 &&
          demoQuizzes.length === 0) ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧠</div>
          <p>
            No{" "}
            {activeTab === "challenges"
              ? "challenges"
              : activeTab === "demos"
                ? "demo quizzes"
                : "quizzes"}{" "}
            available yet
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {activeTab === "challenges" &&
              "Create a challenge or wait for others to share theirs"}
            {activeTab === "demos" && "Create a course with a demo quiz"}
            {activeTab === "all" &&
              "Create your first quiz or wait for others to share theirs"}
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {(activeTab === "all" || activeTab === "challenges") &&
            challenges.map((challenge, i) => (
              <Link
                to={`/quizzes/${challenge._id}`}
                key={`challenge-${challenge._id}`}
                className="card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  animationDelay: `${0.1 + i * 0.05}s`,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <h2 className="card-title" style={{ margin: 0, flex: 1 }}>
                    {challenge.title}
                  </h2>
                  <span
                    className="badge badge-indigo"
                    style={{ marginLeft: "8px", whiteSpace: "nowrap" }}
                  >
                    {challenge.difficulty}
                  </span>
                </div>

                {/* TAGS */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "14px",
                  }}
                >
                  {challenge.skillName && (
                    <span className="badge badge-sky">
                      📚 {challenge.skillName}
                    </span>
                  )}
                  {challenge.skillCategory && (
                    <span className="badge badge-emerald">
                      🏷️ {challenge.skillCategory}
                    </span>
                  )}
                </div>

                {/* DESCRIPTION */}
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    marginBottom: "16px",
                    lineHeight: "1.5",
                  }}
                >
                  {challenge.description}
                </p>

                {/* STATS */}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                  }}
                >
                  <div>🏆 {challenge.creditsReward} credits</div>
                  <div>✅ {challenge.passingScore}% to pass</div>
                </div>
              </Link>
            ))}

          {(activeTab === "all" || activeTab === "demos") &&
            demoQuizzes.map((quiz, i) => (
              <Link
                to={`/quizzes/${quiz._id}`}
                key={`demo-${quiz._id}`}
                className="card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  animationDelay: `${0.1 + i * 0.05}s`,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <h2 className="card-title" style={{ margin: 0, flex: 1 }}>
                    {quiz.title}
                  </h2>
                  <span
                    className="badge badge-purple"
                    style={{ marginLeft: "8px", whiteSpace: "nowrap" }}
                  >
                    📝 Demo Quiz
                  </span>
                </div>

                {/* TAGS */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "14px",
                  }}
                >
                  {quiz.courseId && (
                    <span className="badge badge-sky">🎓 Course Demo</span>
                  )}
                </div>

                {/* DESCRIPTION */}
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    marginBottom: "16px",
                    lineHeight: "1.5",
                  }}
                >
                  {quiz.description ||
                    "Test your knowledge with this demo quiz"}
                </p>

                {/* STATS */}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                  }}
                >
                  <div>📊 {quiz.questions?.length || 0} questions</div>
                  <div>✅ {quiz.passingScore}% to pass</div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
