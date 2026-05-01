import axios from "axios";

const API_BASE = "http://localhost:5000/api/leaderboard";

export const leaderboardApi = {
  getLeaderboard: async () => {
    const res = await axios.get(`${API_BASE}/leaderboard`);
    return res.data;
  },

  getUserRank: async (userId) => {
    const res = await axios.get(`${API_BASE}/user-rank/${userId}`);
    return res.data;
  },

  getAllBadges: async () => {
    const res = await axios.get(`${API_BASE}/badges`);
    return res.data;
  },

  getUserBadges: async (userId) => {
    const res = await axios.get(`${API_BASE}/badges/${userId}`);
    return res.data;
  },

  getBadgeWinners: async () => {
    const res = await axios.get(`${API_BASE}/badge-winners`);
    return res.data;
  },

  awardBadge: async (userId, badgeId) => {
    const res = await axios.post(
      `${API_BASE}/award-badge`,
      { userId, badgeId },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },

  autoAwardBadges: async () => {
    const res = await axios.post(
      `${API_BASE}/auto-award`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
    return res.data;
  },
};
