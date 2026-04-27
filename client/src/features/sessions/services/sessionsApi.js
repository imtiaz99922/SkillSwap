import axios from "axios";

const API_BASE = "http://localhost:5000/api/sessions";

export const sessionsApi = {
  createSession: async (data) => {
    const res = await axios.post(API_BASE, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  getSessions: async () => {
    const res = await axios.get(API_BASE, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  startSession: async (id) => {
    const res = await axios.put(
      `${API_BASE}/${id}/start`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  endSession: async (id, endTime) => {
    const res = await axios.put(
      `${API_BASE}/${id}/end`,
      { endTime },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  confirmSession: async (id) => {
    const res = await axios.put(
      `${API_BASE}/${id}/confirm`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  cancelSession: async (id) => {
    const res = await axios.put(
      `${API_BASE}/${id}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },
};
