import api from "../../../services/api";

export const skillsApi = {
  // Get my skills
  getMySkills: async () => {
    const res = await api.get("/skills/me");
    return res.data.skills;
  },

  // Create a skill
  createSkill: async (skillData) => {
    const res = await api.post("/skills", skillData);
    return res.data.skill;
  },

  // Get single skill
  getSkill: async (skillId) => {
    const res = await api.get(`/skills/${skillId}`);
    return res.data.skill;
  },

  // Update skill
  updateSkill: async (skillId, skillData) => {
    const res = await api.put(`/skills/${skillId}`, skillData);
    return res.data.skill;
  },

  // Delete skill
  deleteSkill: async (skillId) => {
    await api.delete(`/skills/${skillId}`);
  },
};
