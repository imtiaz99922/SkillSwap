import React from "react";
import { FaCircle } from "react-icons/fa";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatList({
  conversations,
  selectedUserId,
  onSelectUser,
}) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "#fff",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          padding: "16px",
          fontWeight: "600",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        Conversations
      </div>
      {conversations && conversations.length > 0 ? (
        conversations.map((conv) => {
          const convId = String(conv.userId);
          const selectedId = String(selectedUserId);
          return (
            <div
              key={convId}
              role="button"
              tabIndex={0}
              onClick={() => onSelectUser(convId)}
              onKeyPress={(e) => {
                if (e.key === "Enter") onSelectUser(convId);
              }}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #f3f4f6",
                cursor: "pointer",
                backgroundColor: selectedId === convId ? "#f0f9ff" : "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f9fafb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  selectedId === convId ? "#f0f9ff" : "#fff")
              }
            >
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: conv.profileImage
                      ? "transparent"
                      : "#eef2ff",
                    color: "#4338ca",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "14px",
                    overflow: "hidden",
                  }}
                >
                  {conv.profileImage ? (
                    <img
                      src={conv.profileImage}
                      alt={conv.userName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    getInitials(conv.userName)
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: "500" }}>{conv.userName}</div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "160px",
                      }}
                    >
                      {conv.lastMessage}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatTime(conv.lastMessageTime)}
                    </div>
                  </div>
                </div>
              </div>
              {conv.unreadCount > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <FaCircle size={8} color="#ef4444" />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#ef4444",
                    }}
                  >
                    {conv.unreadCount}
                  </span>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div style={{ padding: "16px", textAlign: "center", color: "#9ca3af" }}>
          No conversations yet
        </div>
      )}
    </div>
  );
}
