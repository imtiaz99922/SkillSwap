import api from "../../../services/api";

export const chatApi = {
  // Get messages with a specific user
  getMessages: async (userId) => {
    const res = await api.get(`/chat/messages/${userId}`);
    return res.data;
  },

  // Get all conversations
  getConversations: async () => {
    const res = await api.get(`/chat/conversations`);
    return res.data;
  },

  // Send a message via HTTP (Socket.io handles real-time)
  sendMessage: async (receiverId, message) => {
    const res = await api.post(`/chat/send`, { receiverId, message });
    return res.data;
  },

  // Mark messages as read
  markAsRead: async (userId) => {
    const res = await api.post(`/chat/mark-read/${userId}`);
    return res.data;
  },
};
