import api from "../../../services/api";

export const demoQuizApi = {
  // Create a demo quiz for a course
  createDemoQuiz: async (demoQuizData) => {
    const res = await api.post("/demo-quizzes", demoQuizData);
    return res.data.demoQuiz;
  },

  // Get all demo quizzes
  getAllDemoQuizzes: async () => {
    const res = await api.get("/demo-quizzes");
    return res.data.demoQuizzes;
  },

  // Get demo quiz for a specific course
  getDemoQuizByCourse: async (courseId) => {
    const res = await api.get(`/demo-quizzes/course/${courseId}`);
    return res.data.demoQuiz;
  },

  // Get single demo quiz
  getDemoQuiz: async (demoQuizId) => {
    const res = await api.get(`/demo-quizzes/${demoQuizId}`);
    return res.data.demoQuiz;
  },

  // Update demo quiz
  updateDemoQuiz: async (demoQuizId, demoQuizData) => {
    const res = await api.put(`/demo-quizzes/${demoQuizId}`, demoQuizData);
    return res.data.demoQuiz;
  },

  // Delete demo quiz
  deleteDemoQuiz: async (demoQuizId) => {
    await api.delete(`/demo-quizzes/${demoQuizId}`);
  },
};
