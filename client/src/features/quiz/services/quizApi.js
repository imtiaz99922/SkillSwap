import api from "../../../services/api";

export const quizApi = {
  getChallenges: async () => {
    const res = await api.get("/challenges");
    return res.data.challenges || res.data || [];
  },

  getChallenge: async (challengeId) => {
    const res = await api.get(`/challenges/${challengeId}`);
    return res.data.challenge || res.data;
  },

  submitChallenge: async (challengeId, answers) => {
    const res = await api.post(`/challenges/${challengeId}/submit`, {
      answers,
    });
    return res.data;
  },

  createChallenge: async (challengeData) => {
    const res = await api.post("/challenges", challengeData);
    return res.data.challenge || res.data;
  },

  getAttempts: async (challengeId) => {
    const res = await api.get(`/challenges/${challengeId}/attempts`);
    return res.data.attempts || [];
  },
};
