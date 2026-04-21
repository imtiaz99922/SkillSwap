import api from "../../services/api";

export const reviewApi = {
  // Create a new review
  createReview: async (targetUserId, rating, comment) => {
    const res = await api.post(`/reviews`, { targetUserId, rating, comment });
    return res.data;
  },

  // Get reviews for a specific user
  getReviewsForUser: async (userId) => {
    const res = await api.get(`/reviews/user/${userId}`);
    return res.data;
  },

  // Get reviews written by current user
  getMyReviews: async () => {
    const res = await api.get(`/reviews/my-reviews`);
    return res.data;
  },
};
