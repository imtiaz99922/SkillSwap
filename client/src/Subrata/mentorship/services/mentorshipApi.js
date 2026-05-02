import axios from "axios";
import { API_BASE } from "../../../services/api";

export const mentorshipApi = {
  getMentorships: async () => {
    const res = await axios.get(API_BASE, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  getPendingRequests: async () => {
    const res = await axios.get(`${API_BASE}/requests/pending`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  getActiveMentorships: async () => {
    const res = await axios.get(`${API_BASE}/active/all`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  applyForMentorship: async (courseId, data) => {
    const res = await axios.post(`${API_BASE}/apply/${courseId}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  acceptMentorship: async (id) => {
    const res = await axios.put(
      `${API_BASE}/${id}/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  rejectMentorship: async (id) => {
    const res = await axios.put(
      `${API_BASE}/${id}/reject`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  sendMessage: async (mentorshipId, message) => {
    const res = await axios.post(
      `${API_BASE}/${mentorshipId}/send-message`,
      { message },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  getMessages: async (mentorshipId) => {
    const res = await axios.get(`${API_BASE}/${mentorshipId}/messages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  updateProgress: async (id, data) => {
    const res = await axios.put(`${API_BASE}/${id}/progress`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  completeMentorship: async (id, data) => {
    const res = await axios.put(`${API_BASE}/${id}/complete`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  rateMentorship: async (id, data) => {
    const res = await axios.post(`${API_BASE}/${id}/rate`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },
};
