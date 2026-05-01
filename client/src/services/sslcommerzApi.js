import api from "./api";

/**
 * SSLCommerz Payment Gateway API Service
 * Frontend service for interacting with SSLCommerz payment endpoints
 */

const sslcommerzApi = {
  /**
   * Get available credit packages
   * GET /api/sslcommerz/packages
   */
  getPackages: async () => {
    try {
      const response = await api.get("/sslcommerz/packages");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      throw error;
    }
  },

  /**
   * Initiate payment and get redirect URL
   * POST /api/sslcommerz/initiate-payment
   * @param {string} packageId - Package ID to purchase
   * @param {string} paymentMethod - Payment method (card, bkash, nagad, rocket)
   * @param {string} mobileNumber - Mobile number for mobile payment methods
   * @returns {Object} - { paymentId, invoiceId, redirectUrl, package }
   */
  initiatePayment: async (
    packageId,
    paymentMethod = "card",
    mobileNumber = "",
    courseId = null,
    requiredCredits = null,
  ) => {
    try {
      const response = await api.post("/sslcommerz/initiate-payment", {
        packageId,
        paymentMethod,
        mobileNumber,
        courseId,
        requiredCredits,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      throw error;
    }
  },

  /**
   * Get user's payment history
   * GET /api/sslcommerz/payment-history
   */
  getPaymentHistory: async () => {
    try {
      const response = await api.get("/sslcommerz/payment-history");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      throw error;
    }
  },

  /**
   * Check payment status
   * GET /api/sslcommerz/status/:transactionId
   * @param {string} transactionId - Transaction ID to check
   */
  checkPaymentStatus: async (transactionId) => {
    try {
      const response = await api.get(`/sslcommerz/status/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to check payment status:", error);
      throw error;
    }
  },
};

export default sslcommerzApi;
