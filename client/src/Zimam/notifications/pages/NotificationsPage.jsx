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
      // Reduce unread count in UI if needed
      window.dispatchEvent(new CustomEvent("notificationRead"));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
      // Reset unread count
      window.dispatchEvent(new CustomEvent("allNotificationsRead"));
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
    <div className="feature-page">
      <div className="section-header">
        <div>
          <h1 className="section-title">🔔 Notifications</h1>
          <p className="section-copy">
            Stay updated with your message alerts and announcements.
          </p>
        </div>
        <button className="button-secondary" onClick={handleMarkAllAsRead}>
          Mark All as Read
        </button>
      </div>

      <NotificationList
        notifications={notifications}
        loading={loading}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />

      {notifications.length > 0 && (
        <div className="section-header" style={{ justifyContent: "center" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="button-secondary"
            style={{
              opacity: page === 1 ? 0.6 : 1,
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <span
            className="status-chip"
            style={{
              background: "transparent",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              color: "#cbd5e1",
            }}
          >
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="button-primary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
