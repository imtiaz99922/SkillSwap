import axios from "axios";
import { API_BASE } from "../../../services/api";

export const reportsApi = {
  submitReport: async (data) => {
    const res = await axios.post(API_BASE, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  getMyReports: async () => {
    const res = await axios.get(`${API_BASE}/my-reports`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  getReportsAboutUser: async (userId) => {
    const res = await axios.get(`${API_BASE}/about/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  getAllReports: async () => {
    const res = await axios.get(API_BASE, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  updateReport: async (id, data) => {
    const res = await axios.put(`${API_BASE}/${id}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  deleteReport: async (id) => {
    const res = await axios.delete(`${API_BASE}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },
};
