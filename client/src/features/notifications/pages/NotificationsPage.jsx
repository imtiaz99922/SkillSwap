import React, { useState, useEffect } from "react";
import NotificationList from "../components/NotificationList";
import { notificationApi } from "../services/notificationApi";
import { initializeSocket, getSocket } from "../../../services/socketService";
import "../../../styles/ModernDesign.css";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem("token");
    if (token) {
      initializeSocket(token);
    }
    const socket = getSocket();

    if (socket) {
      // Listen for new notifications
      socket.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      return () => {
        socket.off("newNotification");
      };
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications(page, 10);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "700", margin: 0 }}>
          🔔 Notifications
        </h1>
        <button
          onClick={handleMarkAllAsRead}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Mark All as Read
        </button>
      </div>

      <NotificationList
        notifications={notifications}
        loading={loading}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {notifications.length > 0 && (
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "8px 16px",
              backgroundColor: page === 1 ? "#d1d5db" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <span
            style={{
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
