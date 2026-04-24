import api from "../../../services/api";

export const paymentApi = {
  getPackages: async () => {
    const res = await api.get("/payment/packages");
    return Array.isArray(res.data) ? res.data : res.data.packages || [];
  },

  // Stripe: Create payment intent
  createPaymentIntent: async (packageId) => {
    const res = await api.post("/payment/create-payment-intent", { packageId });
    return res.data;
  },

  // Stripe: Confirm payment
  confirmPayment: async (paymentIntentId, packageId) => {
    const res = await api.post("/payment/confirm-payment", {
      paymentIntentId,
      packageId,
    });
    return res.data;
  },

  // Legacy: Process payment (without Stripe)
  processPayment: async ({
    packageId,
    amount,
    creditsGranted,
    paymentMethod,
    paymentDetails,
  }) => {
    const res = await api.post("/payment/process", {
      packageId,
      amount,
      creditsGranted,
      paymentMethod,
      paymentDetails,
    });
    return res.data;
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
