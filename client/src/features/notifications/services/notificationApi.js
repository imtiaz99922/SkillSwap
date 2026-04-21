import api from "../../../services/api";

export const notificationApi = {
  // Get user's notifications
  getNotifications: async (page = 1, limit = 10) => {
    const res = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return res.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const res = await api.get(`/notifications/unread-count`);
    return res.data;
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    const res = await api.put(`/notifications/${notificationId}/read`);
    return res.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const res = await api.put(`/notifications/mark-all-read`);
    return res.data;
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    const res = await api.delete(`/notifications/${notificationId}`);
    return res.data;
  },
};
