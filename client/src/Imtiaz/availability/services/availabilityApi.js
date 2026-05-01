import api from "../../../services/api";

export const availabilityApi = {
  // Get user's availability slots
  getMyAvailability: async () => {
    const res = await api.get(`/availability`);
    return res.data;
  },

  // Create a new availability slot
  createSlot: async (date, startTime, endTime) => {
    const res = await api.post(`/availability`, {
      date,
      startTime,
      endTime,
    });
    return res.data;
  },

  // Update an availability slot
  updateSlot: async (slotId, date, startTime, endTime) => {
    const res = await api.put(`/availability/${slotId}`, {
      date,
      startTime,
      endTime,
    });
    return res.data;
  },

  // Delete an availability slot
  deleteSlot: async (slotId) => {
    const res = await api.delete(`/availability/${slotId}`);
    return res.data;
  },

  // Book a time slot
  bookSlot: async (slotId) => {
    const res = await api.post(`/availability/${slotId}/book`);
    return res.data;
  },

  // Get another user's availability
  getUserAvailability: async (userId) => {
    const res = await api.get(`/availability/user/${userId}`);
    return res.data;
  },
};
