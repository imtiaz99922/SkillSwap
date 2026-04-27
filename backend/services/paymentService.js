const axios = require("axios");

const BASE_URL = process.env.PAYMENT_BASE_URL;
const API_KEY = process.env.PAYMENT_API_KEY;

/**
 * Create a payment request with the payment gateway
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} - Gateway response with payment URL
 */
const createPaymentGateway = async ({
  amount,
  invoiceId,
  description,
  customerEmail,
}) => {
  try {
    // Check if gateway is configured
    if (!BASE_URL || !API_KEY) {
      console.warn("⚠️ Payment gateway not configured - using mock response");
      // Return mock response for testing when gateway is not configured
      return {
        success: true,
        paymentID: `MOCK-${invoiceId}`,
        payment_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/wallet?status=success&paymentID=MOCK-${invoiceId}`,
        invoiceNumber: invoiceId,
        amount: amount,
        currency: "BDT",
      };
    }

    const res = await axios.post(
      `${BASE_URL}/payment/create`,
      {
        amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invoiceId,
        description: description || "SkillSwap Credit Purchase",
        customerEmail,
        callbackURL: `${process.env.BASE_URL}/api/payment-gateway/callback`,
        webhookURL: `${process.env.BASE_URL}/api/payment-gateway/webhook`,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    console.log("✅ Payment gateway request successful:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Payment gateway error:",
      error.response?.data || error.message,
    );

    // In development allow a graceful fallback to a mock response so local
    // development is not blocked by external gateway issues (404, sandbox differences)
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠️ Gateway request failed — returning mock response for dev",
      );
      return {
        success: true,
        paymentID: `MOCK-${invoiceId}`,
        payment_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/wallet?status=success&paymentID=MOCK-${invoiceId}`,
        invoiceNumber: invoiceId,
        amount: amount,
        currency: "BDT",
      };
    }

    throw new Error(`Payment gateway error: ${error.message}`);
  }
};

/**
 * Verify payment with the payment gateway
 * @param {String} paymentId - Payment ID from gateway
 * @returns {Promise<Object>} - Verification response
 */
const verifyPaymentGateway = async (paymentId) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/payment/verify`,
      { paymentId },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ Payment verification successful:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Payment verification error:",
      error.response?.data || error.message,
    );

    // If verification fails in development (e.g., gateway endpoint mismatch),
    // assume success so local testing can continue. Production should not use this.
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ Verification failed — returning mock success for dev");
      return { status: "success", transactionId: paymentId };
    }

    throw new Error(`Payment verification error: ${error.message}`);
  }
};

/**
 * Verify webhook signature (if gateway provides one)
 * @param {Object} body - Webhook body
 * @param {String} signature - Signature header
 * @returns {Boolean} - Is valid
 */
const verifyWebhookSignature = (body, signature) => {
  // If gateway provides X-Signature or similar header
  // Compare with HMAC of body using PAYMENT_WEBHOOK_SECRET
  if (!process.env.PAYMENT_WEBHOOK_SECRET) {
    console.warn(
      "⚠️ PAYMENT_WEBHOOK_SECRET not set - skipping webhook signature verification",
    );
    return true;
  }

  const crypto = require("crypto");
  const bodyString = JSON.stringify(body);
  const hash = crypto
    .createHmac("sha256", process.env.PAYMENT_WEBHOOK_SECRET)
    .update(bodyString)
    .digest("hex");

  return hash === signature;
};

module.exports = {
  createPaymentGateway,
  verifyPaymentGateway,
  verifyWebhookSignature,
};
