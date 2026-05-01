import React from "react";
import { FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";

export default function SkillCard({ skill, onEdit, onDelete }) {
  const badgeTypeClass = skill.type === "teach" ? "badge-teach" : "badge-learn";
  const badgeLevelClass =
    skill.level === "beginner"
      ? "badge-beginner"
      : skill.level === "intermediate"
      ? "badge-intermediate"
      : "badge-advanced";

  return (
    <div className="skill-card">
      {skill.verified && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#16a34a",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          <FaCheckCircle /> Verified
        </div>
      )}

      <div className="skill-card-content">
        <div style={{ marginBottom: "18px" }}>
          <h3>{skill.title}</h3>
          <div className="skill-badges">
            <span className={`badge-pill ${badgeTypeClass}`}>
              {skill.type === "teach" ? "Teaching" : "Learning"}
            </span>
            <span className={`badge-pill ${badgeLevelClass}`}>
              {skill.level}
            </span>
          </div>
          {skill.category && <p style={{ marginBottom: "10px" }}>Category: {skill.category}</p>}
        </div>

        {skill.description && <p>{skill.description}</p>}

        {skill.tags && skill.tags.length > 0 && (
          <div style={{ marginTop: "18px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {skill.tags.map((tag, index) => (
                <span key={index} className="tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="skill-meta">
          <span>Added {new Date(skill.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="skill-actions">
          <button type="button" className="button-secondary" onClick={() => onEdit(skill)}>
            <FaEdit size={12} /> Edit
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => onDelete(skill._id)}
            style={{ background: "#ef4444", color: "#fff", border: "none" }}
          >
            <FaTrash size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
