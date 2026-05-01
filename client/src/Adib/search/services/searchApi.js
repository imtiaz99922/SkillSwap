import api from "../../../services/api";

export const searchApi = {
  // Get all courses / skill listings
  getAllSkills: async () => {
    const res = await api.get(`/search/skills`);
    return Array.isArray(res.data) ? res.data : res.data.skills || [];
  },

  // Search courses by title, category, description, or tags
  searchSkills: async (query) => {
    const res = await api.get(`/search/skills?q=${encodeURIComponent(query)}`);
    return Array.isArray(res.data) ? res.data : res.data.skills || [];
  },

  // Get a single course detail
  getSkillDetail: async (skillId) => {
    const res = await api.get(`/search/skills/${skillId}`);
    return res.data.skill || res.data;
  },
};
