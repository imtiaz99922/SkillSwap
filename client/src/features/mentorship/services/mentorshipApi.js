import axios from "axios";

const API_BASE = "http://localhost:5000/api/mentorship";

export const mentorshipApi = {
  getMentorships: async () => {
    const res = await axios.get(API_BASE, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  applyForMentorship: async (data) => {
    const res = await axios.post(`${API_BASE}/apply`, data, {
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
};
