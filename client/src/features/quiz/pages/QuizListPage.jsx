import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { quizApi } from "../services/quizApi";
import "../../../styles/ModernDesign.css";

export default function QuizListPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    quizApi
      .getChallenges()
      .then((data) => {
        if (mounted) setChallenges(data);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError("Failed to load quizzes.");
      })
      .finally(() => mounted && setLoading(false));
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
      ) : challenges.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧠</div>
          <p>No quizzes available yet</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Create your first quiz or wait for others to share theirs
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {challenges.map((challenge, i) => (
            <Link
              to={`/quizzes/${challenge._id}`}
              key={challenge._id}
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
        </div>
      )}
    </div>
  );
}
