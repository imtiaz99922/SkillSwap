import React from "react";
import {
  FaStar,
  FaComments,
  FaBook,
  FaExchangeAlt,
  FaPlayCircle,
} from "react-icons/fa";

export default function SearchSkillCard({
  skill,
  onMessage,
  onBookSlot,
  onViewReviews,
  onTakeQuiz,
  onViewCourse,
}) {
  const owner = skill.owner || {};
  const profile = skill.ownerProfile || {};
  const badgeTypeClass = skill.type === "teach" ? "badge-teach" : "badge-learn";
  const badgeLevelClass =
    skill.level === "beginner"
      ? "badge-beginner"
      : skill.level === "intermediate"
        ? "badge-intermediate"
        : "badge-advanced";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.95)",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
        position: "relative",
        minHeight: "320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.15rem" }}>
              {skill.title}
            </div>
            {skill.quizId ? (
              <div
                style={{
                  marginTop: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "#e0f2fe",
                    color: "#0369a1",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                >
                  Demo Quiz Available
                </span>
                {skill.quizDifficulty && (
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  >
                    {skill.quizDifficulty}
                  </span>
                )}
              </div>
            ) : null}
            <p style={{ margin: "8px 0", color: "#475569" }}>
              {skill.description || "No description provided."}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              minWidth: "120px",
            }}
          >
            <span
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                background: skill.type === "teach" ? "#e0f2fe" : "#ecfccb",
                color: skill.type === "teach" ? "#0369a1" : "#365314",
                fontWeight: 600,
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              {skill.type === "teach" ? "Offering" : "Seeking"}
            </span>
            <span
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                background:
                  skill.level === "beginner"
                    ? "#ede9fe"
                    : skill.level === "intermediate"
                      ? "#fef3c7"
                      : "#dcfce7",
                color:
                  skill.level === "beginner"
                    ? "#5b21b6"
                    : skill.level === "intermediate"
                      ? "#92400e"
                      : "#166534",
                fontWeight: 600,
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              {skill.level?.charAt(0).toUpperCase() + skill.level?.slice(1)}
            </span>
          </div>
        </div>

        {skill.category && (
          <div style={{ marginBottom: "16px", color: "#334155" }}>
            <strong>Category:</strong> {skill.category}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {skill.tags && skill.tags.length > 0
            ? skill.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    background: "#eef2ff",
                    color: "#4338ca",
                    borderRadius: "999px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  #{tag}
                </span>
              ))
            : null}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div style={{ color: "#475569" }}>
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>
              Instructor
            </div>
            <div>{owner.name || "Unknown"}</div>
            <div style={{ fontSize: "0.92rem", color: "#64748b" }}>
              {owner.email || "No email"}
            </div>
          </div>
          <div style={{ color: "#475569" }}>
            <div style={{ fontWeight: 600, marginBottom: "6px" }}>Profile</div>
            <div>{profile.bio || "No bio available."}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          onClick={onMessage}
          style={{
            flex: 1,
            minWidth: "140px",
            padding: "12px 16px",
            borderRadius: "14px",
            border: "1px solid #2563eb",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaComments size={14} /> Message
        </button>
        {onViewCourse && (
          <button
            onClick={onViewCourse}
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "12px 16px",
              borderRadius: "14px",
              border: "1px solid #6d28d9",
              background: "#6d28d9",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaBook size={14} /> View Course
          </button>
        )}
        {skill.type === "teach" && onBookSlot && (
          <button
            onClick={onBookSlot}
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "12px 16px",
              borderRadius: "14px",
              border: "1px solid #10b981",
              background: "#10b981",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaBook size={14} /> Book Slot
          </button>
        )}
        {skill.quizId && onTakeQuiz && (
          <button
            onClick={onTakeQuiz}
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "12px 16px",
              borderRadius: "14px",
              border: "1px solid #1d4ed8",
              background: "#1d4ed8",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaPlayCircle size={14} /> Take Quiz
          </button>
        )}
        <button
          onClick={onViewReviews}
          style={{
            flex: 1,
            minWidth: "140px",
            padding: "12px 16px",
            borderRadius: "14px",
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#0f172a",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaStar size={14} /> Reviews
        </button>
      </div>
    </div>
  );
}
