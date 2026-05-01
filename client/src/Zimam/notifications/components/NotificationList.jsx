import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheckCircle, FaTrash } from "react-icons/fa";

export default function NotificationList({
  notifications,
  loading,
  onMarkAsRead,
  onDelete,
}) {
  const navigate = useNavigate();
  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return "💬";
      case "review":
        return "⭐";
      case "session_update":
        return "📅";
      case "credit_change":
        return "💰";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "message":
        return "#3b82f6";
      case "review":
        return "#f59e0b";
      case "session_update":
        return "#8b5cf6";
      case "credit_change":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getCourseLink = (notif) => {
    const courseUrl = notif.data?.courseUrl;
    const courseId = notif.data?.courseId;

    if (courseUrl) {
      if (courseUrl.startsWith("/courses/")) {
        return courseUrl.replace(/^\/courses\//, "/course/");
      }
      return courseUrl;
    }
    if (courseId) {
      return `/course/${courseId}`;
    }
    return null;
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaBell /> Notifications
        </div>

        {loading ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#9ca3af",
            }}
          >
            Loading notifications...
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div>
            {notifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  padding: "16px",
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  backgroundColor: notif.readAt ? "#fff" : "#f0f9ff",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    fontSize: "24px",
                    minWidth: "32px",
                    textAlign: "center",
                  }}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: notif.readAt ? "500" : "600",
                      color: notif.readAt ? "#6b7280" : "#000",
                    }}
                  >
                    {notif.title}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginTop: "4px",
                      lineHeight: "1.5",
                    }}
                  >
                    {notif.body}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginTop: "6px",
                    }}
                  >
                    {notif.sentAt
                      ? new Date(notif.sentAt).toLocaleString()
                      : "Just now"}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  {notif.type === "recommendation" && getCourseLink(notif) && (
                    <button
                      onClick={() => navigate(getCourseLink(notif))}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      View Course
                    </button>
                  )}
                  {!notif.readAt && (
                    <button
                      onClick={() => onMarkAsRead(notif._id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FaCheckCircle size={12} /> Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(notif._id)}
                    style={{
                      padding: "6px 10px",
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#9ca3af",
            }}
          >
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}
