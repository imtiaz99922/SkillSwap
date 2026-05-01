const Payment = require("../models/Payment");
const UserSkill = require("../models/UserSkill");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const {
  createPaymentGateway,
  verifyPaymentGateway,
  verifyWebhookSignature,
} = require("../services/paymentService");

/**
 * 🟢 Create Payment
 * POST /api/payment/create
 */
const createPayment = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const {
      amount,
      creditsGranted,
      paymentMethod = "bKash",
      metadata = {},
    } = req.body;

    if (!userId || !amount || !creditsGranted) {
      return res.status(400).json({
        error: "Missing required fields: userId, amount, creditsGranted",
      });
    }

    // Get user email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate unique invoice ID
    const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 1. Save payment as pending
    const payment = await Payment.create({
      userId,
      amount,
      creditsGranted,
      paymentMethod,
      invoiceId,
      status: "pending",
      accountEmail: user.email,
      metadata,
    });

    console.log(`📝 Payment created (pending): ${payment._id}`);

    // 2. Call gateway to create payment
    let gatewayResponse;
    try {
      gatewayResponse = await createPaymentGateway({
        amount,
        invoiceId,
        description: `${creditsGranted} Credits - SkillSwap`,
        customerEmail: user.email,
      });
    } catch (gatewayError) {
      // If gateway fails, still return pending payment with error
      console.error("Gateway error:", gatewayError.message);
      payment.rawResponse = { error: gatewayError.message };
      await payment.save();

      return res.status(500).json({
        error: "Payment gateway error",
        details: gatewayError.message,
      });
    }

    // 3. Store gateway payment ID
    payment.paymentId = gatewayResponse.paymentID || gatewayResponse.paymentId;
    payment.rawResponse = gatewayResponse;
    await payment.save();

    console.log(`✅ Gateway payment created: ${payment.paymentId}`);

    // Return payment URL for redirect
    res.json({
      success: true,
      paymentId: payment._id,
      gatewayPaymentId: payment.paymentId,
      paymentUrl: gatewayResponse.payment_url || gatewayResponse.paymentUrl,
      invoiceId: payment.invoiceId,
    });
  } catch (error) {
    console.error("❌ Create payment error:", error);
    res.status(500).json({
      error: "Failed to create payment",
      details: error.message,
    });
  }
};

/**
 * 🔁 Finalize Payment (Used by callback + webhook)
 * Internal function
 */
const finalizePayment = async (paymentId, skipVerification = false) => {
  try {
    // Find payment by gateway paymentId
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      console.error(`❌ Payment not found: ${paymentId}`);
      return { success: false, error: "Payment not found" };
    }

    // Already processed
    if (payment.status === "success") {
      console.log(`⚠️ Payment already processed: ${paymentId}`);
      return { success: true, message: "Payment already processed" };
    }

    // Verify with gateway (unless skipped)
    let verification;
    if (!skipVerification) {
      try {
        verification = await verifyPaymentGateway(paymentId);
        if (
          verification.status !== "success" &&
          verification.status !== "completed"
        ) {
          console.error(
            `❌ Payment verification failed: ${verification.status}`,
          );
          payment.status = "failed";
          await payment.save();
          return { success: false, error: "Payment verification failed" };
        }
      } catch (verifyError) {
        console.error("Verification error:", verifyError.message);
        return { success: false, error: "Verification error" };
      }
    }

    // ✅ Mark payment as success
    payment.status = "success";
    payment.completedAt = new Date();
    if (verification) {
      payment.rawResponse = verification;
      payment.transactionId =
        verification.transactionId || verification.transactionID;
    }
    await payment.save();

    console.log(`✅ Payment marked successful: ${payment._id}`);

    // ✅ Grant credits to user
    let wallet = await Wallet.findOne({ userId: payment.userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: payment.userId,
        credits: payment.creditsGranted,
        totalEarned: payment.creditsGranted,
      });
    } else {
      wallet.credits += payment.creditsGranted;
      wallet.totalEarned += payment.creditsGranted;
      await wallet.save();
    }

    console.log(
      `✅ Credits granted: +${payment.creditsGranted} to user ${payment.userId}`,
    );

    return {
      success: true,
      payment,
      wallet,
    };
  } catch (error) {
    console.error("❌ Finalize payment error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * 🔁 Callback (User redirect after payment)
 * GET /api/payment/callback?paymentID=xxx&status=success
 */
const paymentCallback = async (req, res) => {
  try {
    const { paymentID, status } = req.query;

    if (!paymentID) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=failed&error=NoPaymentID`,
      );
    }

    if (status !== "success") {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=failed`,
      );
    }

    // Finalize payment
    const result = await finalizePayment(paymentID, false);

    if (result.success) {
      console.log(
        "✅ Callback: Payment successful, redirecting to success page",
      );
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=success&paymentId=${paymentID}`,
      );
    }

    console.log("❌ Callback: Payment finalization failed");
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=failed&error=FinalizationFailed`,
    );
  } catch (error) {
    console.error("❌ Callback error:", error);
    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment?status=failed&error=ServerError`,
    );
  }
};

/**
 * 🔥 Webhook (Gateway server → Our server) - MOST IMPORTANT
 * POST /api/payment/webhook
 */
const paymentWebhook = async (req, res) => {
  try {
    console.log("📨 Webhook received:", req.body);

    // Verify signature
    const signature =
      req.headers["x-signature"] || req.headers["x-payment-signature"];
    if (!verifyWebhookSignature(req.body, signature)) {
      console.error("❌ Invalid webhook signature");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { paymentID, status } = req.body;

    if (!paymentID) {
      console.error("❌ Webhook: Missing paymentID");
      return res.status(400).json({ error: "Missing paymentID" });
    }

    if (status !== "success" && status !== "completed") {
      console.log(`⚠️ Webhook: Payment status not success: ${status}`);
      return res.status(200).json({ message: "Webhook received" });
    }

    // Finalize payment
    const result = await finalizePayment(paymentID, false);

    if (result.success) {
      console.log("✅ Webhook: Payment finalized successfully");
      return res
        .status(200)
        .json({ success: true, message: "Payment processed" });
    }

    console.error("❌ Webhook: Payment finalization failed");
    res.status(500).json({ error: "Finalization failed" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

/**
 * Get Payment Status
 * GET /api/payment/:paymentId
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate(
      "userId",
      "name email",
    );

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({
      _id: payment._id,
      status: payment.status,
      amount: payment.amount,
      creditsGranted: payment.creditsGranted,
      paymentMethod: payment.paymentMethod,
      invoiceId: payment.invoiceId,
      user: payment.userId,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
    });
  } catch (error) {
    console.error("❌ Get payment status error:", error);
    res.status(500).json({ error: "Failed to get payment status" });
  }
};

/**
 * Get User Payment History
 * GET /api/payment/user/:userId
 */
const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments({ userId });

    res.json({
      payments,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error("❌ Get user payments error:", error);
    res.status(500).json({ error: "Failed to get payment history" });
  }
};

module.exports = {
  createPayment,
  finalizePayment,
  paymentCallback,
  paymentWebhook,
  getPaymentStatus,
  getUserPayments,
};
