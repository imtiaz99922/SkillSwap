import api from "../../../services/api";

export const paymentApi = {
  getPackages: async () => {
    const res = await api.get("/payment/packages");
    return Array.isArray(res.data) ? res.data : res.data.packages || [];
  },

  // ⚠️ STRIPE REMOVED - Use SSLCommerz instead (see sslcommerzApi.js)
  createPaymentIntent: async (packageId) => {
    throw new Error(
      "Stripe payment is no longer supported. Use SSLCommerz (/buy-credits) instead.",
    );
  },

  // ⚠️ STRIPE REMOVED - Use SSLCommerz instead (see sslcommerzApi.js)
  confirmPayment: async (paymentIntentId, packageId) => {
    throw new Error(
      "Stripe payment is no longer supported. Use SSLCommerz (/buy-credits) instead.",
    );
  },

  // DEPRECATED: Legacy payment processing (without Stripe)
  processPayment: async ({
    packageId,
    amount,
    creditsGranted,
    paymentMethod,
    paymentDetails,
  }) => {
    throw new Error(
      "Direct payment processing is no longer supported. Use SSLCommerz (/buy-credits) instead.",
    );
  },

  getHistory: async () => {
    const res = await api.get("/payment/history");
    return Array.isArray(res.data) ? res.data : res.data.payments || [];
  },

  getWallet: async () => {
    const res = await api.get("/wallet");
    return res.data.wallet || res.data;
  },

  getWalletTransactions: async () => {
    const res = await api.get("/wallet/transactions");
    return Array.isArray(res.data) ? res.data : res.data.transactions || [];
  },

  getPaymentDetails: async (paymentId) => {
    const res = await api.get(`/payment/${paymentId}`);
    return res.data.payment || res.data;
  },

  getReceipt: async (paymentId) => {
    const res = await api.get(`/payment/${paymentId}/receipt`);
    return res.data.receipt || res.data;
  },
};
