import React from "react";
import { FaStar, FaComments } from "react-icons/fa";

export default function UserCard({
  user,
  onMessage,
  onViewReviews,
  currentUserId,
}) {
  if (!user || user._id === currentUserId) return null;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        ":hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <div
          style={{
            fontWeight: "600",
            fontSize: "16px",
            marginBottom: "8px",
          }}
        >
          {user.name}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          {user.email}
        </div>
      </div>

      {/* Profile Info */}
      {user.profile && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          {user.profile.bio && (
            <p
              style={{
                fontSize: "14px",
                color: "#4b5563",
                margin: "0 0 8px 0",
                lineHeight: "1.5",
              }}
            >
              {user.profile.bio}
            </p>
          )}
          {user.profile.rating && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <div style={{ display: "flex", gap: "2px" }}>
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    size={14}
                    color={
                      i < Math.round(user.profile.rating)
                        ? "#fbbf24"
                        : "#d1d5db"
                    }
                  />
                ))}
              </div>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                {user.profile.rating.toFixed(1)} (
                {user.profile.totalReviews || 0} reviews)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div
            style={{ fontWeight: "500", marginBottom: "8px", fontSize: "14px" }}
          >
            Skills
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {user.skills.map((skill, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                  borderRadius: "8px",
                  backgroundColor: "#eef2ff",
                  color: "#1d4ed8",
                  minWidth: "120px",
                  maxWidth: "100%",
                }}
              >
                <span style={{ fontWeight: "600" }}>{skill.skillName}</span>
                <span style={{ fontSize: "12px", color: "#4b5563" }}>
                  {skill.type === "teach" ? "Teaches" : "Learns"}
                  {skill.category ? ` · ${skill.category}` : ""}
                </span>
                {skill.level && (
                  <span
                    style={{
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#2563eb",
                    }}
                  >
                    Level: {skill.level}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          padding: "16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}
      >
        <button
          onClick={() => onMessage(user._id)}
          style={{
            padding: "10px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <FaComments size={14} /> Message
        </button>
        <button
          onClick={() => onViewReviews(user._id)}
          style={{
            padding: "10px",
            backgroundColor: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <FaStar size={14} /> Reviews
        </button>
      </div>
    </div>
  );
}
