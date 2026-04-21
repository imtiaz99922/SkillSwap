import React from "react";
import { FaCircle } from "react-icons/fa";

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
        conversations.map((conv) => (
          <div
            key={conv.userId}
            onClick={() => onSelectUser(conv.userId)}
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f3f4f6",
              cursor: "pointer",
              backgroundColor:
                selectedUserId === conv.userId ? "#f0f9ff" : "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor =
                selectedUserId === conv.userId ? "#f0f9ff" : "#fff")
            }
          >
            <div>
              <div style={{ fontWeight: "500" }}>{conv.userName}</div>
              <div
                style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}
              >
                {conv.lastMessage}
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
        ))
      ) : (
        <div style={{ padding: "16px", textAlign: "center", color: "#9ca3af" }}>
          No conversations yet
        </div>
      )}
    </div>
  );
}
