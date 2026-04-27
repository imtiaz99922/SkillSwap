import axios from "axios";

const API_BASE = "http://localhost:5000/api/referral";

export const referralApi = {
  getReferralCode: async () => {
    const res = await axios.get(`${API_BASE}/code`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  getReferralStats: async () => {
    const res = await axios.get(`${API_BASE}/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  getReferrals: async () => {
    const res = await axios.get(API_BASE, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return res.data;
  },

  useReferralCode: async (referralCode, userId) => {
    const res = await axios.post(`${API_BASE}/use/${referralCode}`, { userId });
    return res.data;
  },

  completeReferral: async (id) => {
    const res = await axios.put(
      `${API_BASE}/${id}/complete`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },
};
