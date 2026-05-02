import axios from "axios";
import { API_BASE } from "../../../services/api";

export const recommendationsApi = {
  getRecommendations: async () => {
    const res = await axios.get(API_BASE, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  generateRecommendations: async () => {
    const res = await axios.post(
      `${API_BASE}/generate`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  markAsViewed: async (id) => {
    const res = await axios.put(
      `${API_BASE}/${id}/view`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  acceptRecommendation: async (id) => {
    const res = await axios.put(
      `${API_BASE}/${id}/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  deleteRecommendation: async (id) => {
    const res = await axios.delete(`${API_BASE}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },
};
