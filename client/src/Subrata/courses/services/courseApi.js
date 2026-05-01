import api from "../../../services/api";

export const courseApi = {
  // Create a course
  createCourse: async (courseData) => {
    const res = await api.post("/courses/create", courseData);
    return res.data.course;
  },

  // Get all published courses
  getAllCourses: async (params = {}) => {
    const res = await api.get("/courses", { params });
    return res.data.courses;
  },

  // Get single course
  getCourse: async (courseId) => {
    const res = await api.get(`/courses/${courseId}`);
    return res.data.course;
  },

  // Get my published courses
  getMyPublishedCourses: async () => {
    const res = await api.get("/courses/user/published");
    return res.data.courses;
  },

  // Get my enrolled courses
  getMyEnrolledCourses: async () => {
    const res = await api.get("/courses/user/enrolled");
    return res.data;
  },

  // Get course content
  getCourseContent: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/content`);
    return res.data.content;
  },
};
