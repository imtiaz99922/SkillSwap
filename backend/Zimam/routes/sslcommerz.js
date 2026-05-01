const express = require("express");
const router = express.Router();
const SSLCommerzService = require("../services/sslcommerzService");
const Payment = require("../models/Payment");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Credit packages
const PACKAGES = [
  { id: "starter", name: "Starter", credits: 100, amount: 500 }, // BDT
  { id: "pro", name: "Pro", credits: 500, amount: 2000 },
  { id: "business", name: "Business", credits: 1500, amount: 5000 },
  { id: "enterprise", name: "Enterprise", credits: 5000, amount: 15000 },
];

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * GET /api/sslcommerz/packages
 * Get available credit packages
 */
router.get("/packages", async (req, res) => {
  try {
    res.json({
      success: true,
      packages: PACKAGES,
      currency: "BDT",
    });
  } catch (error) {
    console.error("❌ Error fetching packages:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

/**
 * POST /api/sslcommerz/initiate-payment
 * Initiate SSLCommerz payment session (Protected)
 */
router.post("/initiate-payment", auth, async (req, res) => {
  try {
    const {
      packageId,
      paymentMethod = "card",
      mobileNumber = "",
      courseId,
      requiredCredits,
    } = req.body;
    const userId = req.userId;

    if (!packageId) {
      return res
        .status(400)
        .json({ success: false, msg: "Package ID is required" });
    }

    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, msg: "Package not found" });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Generate unique invoice ID
    const invoiceNumber = `SKILLSWAP-${userId}-${Date.now()}`;

    // Create pending payment record
    const payment = await Payment.create({
      userId,
      packageId,
      amount: pkg.amount,
      creditsGranted: pkg.credits,
      paymentMethod: "sslcommerz",
      invoiceId: invoiceNumber,
      transactionId: invoiceNumber, // ✅ Add transactionId for callback matching
      status: "pending",
      accountEmail: user.email,
      metadata: {
        userId: userId.toString(),
        packageId: packageId,
        creditsGranted: pkg.credits,
        gateway: "sslcommerz",
        paymentMethod: paymentMethod,
        mobileNumber: mobileNumber,
        courseId: courseId || null,
        requiredCredits: requiredCredits || null,
        purchaseMode: courseId ? "course_topup" : "credit_purchase",
      },
    });

    console.log(`📝 Payment record created (pending): ${payment._id}`);
    console.log(
      `💳 Payment Method: ${paymentMethod}, Mobile: ${mobileNumber || "N/A"}`,
    );

    try {
      // Initiate SSLCommerz payment
      const gatewayResponse = await SSLCommerzService.initiate({
        amount: pkg.amount,
        currency: "BDT",
        invoiceNumber: invoiceNumber,
        productName: `${pkg.name} Package - ${pkg.credits} Credits`,
        productCategory: "Digital",
        customerEmail: user.email,
        customerPhone: user.phone || "",
        customerName: user.name || "Customer",
        successUrl: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/sslcommerz/success`,
        failUrl: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/sslcommerz/fail`,
        cancelUrl: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/sslcommerz/cancel`,
        metadata: {
          userId: userId.toString(),
          packageId: packageId,
          creditsGranted: pkg.credits.toString(),
          paymentMethod: paymentMethod,
          mobileNumber: mobileNumber,
        },
      });

      // Save gateway response
      payment.rawResponse = gatewayResponse.rawResponse;
      payment.transactionId = invoiceNumber;
      await payment.save();

      console.log(`✅ SSLCommerz payment session created: ${invoiceNumber}`);

      return res.json({
        success: true,
        paymentId: payment._id,
        invoiceId: invoiceNumber,
        redirectUrl: gatewayResponse.gatewayPageUrl,
        gatewayPageUrl: gatewayResponse.gatewayPageUrl,
        package: pkg,
      });
    } catch (gatewayError) {
      console.error("❌ SSLCommerz gateway error:", gatewayError.message);
      payment.status = "failed";
      payment.rawResponse = { error: gatewayError.message };
      await payment.save();

      return res.status(500).json({
        success: false,
        msg: "Payment gateway error",
        details: gatewayError.message,
      });
    }
  } catch (error) {
    console.error("❌ Initiate payment error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to initiate payment",
      details: error.message,
    });
  }
});

/**
 * POST /api/sslcommerz/success
 * SSLCommerz success callback (Redirect from payment gateway)
 */
router.post("/success", async (req, res) => {
  try {
    console.log("✅ SSLCommerz success callback received:", req.body);

    const {
      tran_id,
      status,
      amount,
      currency,
      bank_tran_id,
      card_type,
      value_a: userId,
      value_c: creditsGranted,
    } = req.body;

    // Log received data for debugging
    console.log(`📨 Callback Data - tran_id: ${tran_id}, status: ${status}`);

    if (!tran_id) {
      console.error("❌ Missing transaction ID in success callback");
      console.error("Request body:", JSON.stringify(req.body, null, 2));
      return res.redirect(
        `${FRONTEND_URL}/buy-credits?status=failed&error=MissingTransactionId`,
      );
    }

    // Validate callback
    const validation = await SSLCommerzService.validateCallback(req.body);

    if (!validation.success) {
      console.error(`❌ Payment validation failed: ${validation.status}`);
      return res.redirect(
        `${FRONTEND_URL}/buy-credits?status=failed&error=ValidationFailed`,
      );
    }

    // Find and update payment record
    const payment = await Payment.findOne({ transactionId: tran_id });

    if (!payment) {
      console.error(`❌ Payment record not found: ${tran_id}`);
      return res.redirect(
        `${FRONTEND_URL}/buy-credits?status=failed&error=PaymentNotFound`,
      );
    }

    // Already processed
    if (payment.status === "success") {
      console.log(`⚠️ Payment already processed: ${tran_id}`);
      const queryParams = new URLSearchParams({
        status: "success",
        paymentId: payment._id,
        credits: payment.creditsGranted,
      });
      if (payment.metadata?.courseId) {
        queryParams.set("courseId", payment.metadata.courseId);
      }
      if (payment.metadata?.requiredCredits) {
        queryParams.set("requiredCredits", payment.metadata.requiredCredits);
      }
      return res.redirect(
        `${FRONTEND_URL}/buy-credits?${queryParams.toString()}`,
      );
    }

    // Mark payment as success
    payment.status = "success";
    payment.completedAt = new Date();
    payment.rawResponse = {
      ...payment.rawResponse,
      callbackData: req.body,
    };
    await payment.save();

    console.log(`✅ Payment marked successful: ${payment._id}`);

    // Grant credits to user
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

    // Redirect to success page
    const queryParams = new URLSearchParams({
      status: "success",
      paymentId: payment._id,
      credits: payment.creditsGranted,
    });

    if (payment.metadata?.courseId) {
      queryParams.set("courseId", payment.metadata.courseId);
    }
    if (payment.metadata?.requiredCredits) {
      queryParams.set("requiredCredits", payment.metadata.requiredCredits);
    }

    res.redirect(`${FRONTEND_URL}/buy-credits?${queryParams.toString()}`);
  } catch (error) {
    console.error("❌ Success callback error:", error);
    res.redirect(`${FRONTEND_URL}/buy-credits?status=failed&error=ServerError`);
  }
});

/**
 * POST /api/sslcommerz/fail
 * SSLCommerz failure callback
 */
router.post("/fail", async (req, res) => {
  try {
    console.log("❌ SSLCommerz failure callback received:", req.body);

    const { tran_id } = req.body;
    let payment = null;

    if (tran_id) {
      payment = await Payment.findOne({ transactionId: tran_id });
      if (payment && payment.status === "pending") {
        payment.status = "failed";
        payment.rawResponse = req.body;
        await payment.save();
      }
    }

    const failParams = new URLSearchParams({
      status: "failed",
      reason: "gateway",
    });
    if (payment?.metadata?.courseId) {
      failParams.set("courseId", payment.metadata.courseId);
    }
    if (payment?.metadata?.requiredCredits) {
      failParams.set("requiredCredits", payment.metadata.requiredCredits);
    }
    res.redirect(`${FRONTEND_URL}/buy-credits?${failParams.toString()}`);
  } catch (error) {
    console.error("❌ Fail callback error:", error);
    res.redirect(`${FRONTEND_URL}/buy-credits?status=failed&error=ServerError`);
  }
});

/**
 * POST /api/sslcommerz/cancel
 * SSLCommerz cancellation callback
 */
router.post("/cancel", async (req, res) => {
  try {
    console.log("⚠️ SSLCommerz cancellation callback received:", req.body);

    const { tran_id } = req.body;
    let payment = null;

    if (tran_id) {
      payment = await Payment.findOne({ transactionId: tran_id });
      if (payment && payment.status === "pending") {
        payment.status = "cancelled";
        payment.rawResponse = req.body;
        await payment.save();
      }
    }

    const cancelParams = new URLSearchParams({
      status: "cancelled",
    });
    if (payment?.metadata?.courseId) {
      cancelParams.set("courseId", payment.metadata.courseId);
    }
    if (payment?.metadata?.requiredCredits) {
      cancelParams.set("requiredCredits", payment.metadata.requiredCredits);
    }
    res.redirect(`${FRONTEND_URL}/buy-credits?${cancelParams.toString()}`);
  } catch (error) {
    console.error("❌ Cancel callback error:", error);
    res.redirect(
      `${FRONTEND_URL}/buy-credits?status=cancelled&error=ServerError`,
    );
  }
});

/**
 * POST /api/sslcommerz/ipn
 * SSLCommerz Instant Payment Notification (Server-to-Server)
 */
router.post("/ipn", async (req, res) => {
  try {
    console.log("📨 SSLCommerz IPN received:", req.body);

    const {
      tran_id,
      status,
      amount,
      currency,
      bank_tran_id,
      value_a: userId,
      value_b: packageId,
      value_c: creditsGranted,
    } = req.body;

    if (!tran_id) {
      console.error("❌ Missing transaction ID in IPN");
      return res.status(400).json({ success: false, msg: "Missing tran_id" });
    }

    // Verify IPN signature
    if (!SSLCommerzService.verifyIPNSignature(req.body, req.body.verify_sign)) {
      console.error("❌ Invalid IPN signature");
      return res.status(401).json({ success: false, msg: "Invalid signature" });
    }

    // Find payment
    const payment = await Payment.findOne({ transactionId: tran_id });

    if (!payment) {
      console.error(`❌ Payment not found for IPN: ${tran_id}`);
      return res.status(404).json({ success: false, msg: "Payment not found" });
    }

    // If already processed, return success
    if (payment.status === "success") {
      console.log(`⚠️ IPN: Payment already processed: ${tran_id}`);
      return res.json({ success: true, msg: "Already processed" });
    }

    // Validate payment
    const validation = await SSLCommerzService.validateCallback(req.body);

    if (!validation.success) {
      console.log(`⚠️ IPN: Payment validation failed: ${validation.status}`);
      payment.status = "failed";
      payment.rawResponse = req.body;
      await payment.save();
      return res.json({ success: true, msg: "Payment failed" });
    }

    // Mark payment as success
    payment.status = "success";
    payment.completedAt = new Date();
    payment.rawResponse = req.body;
    await payment.save();

    console.log(`✅ IPN: Payment marked successful: ${payment._id}`);

    // Grant credits
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
      `✅ IPN: Credits granted: +${payment.creditsGranted} to user ${payment.userId}`,
    );

    // Respond to SSLCommerz
    res.json({ success: true, msg: "IPN processed successfully" });
  } catch (error) {
    console.error("❌ IPN processing error:", error);
    res.status(500).json({
      success: false,
      msg: "IPN processing failed",
      details: error.message,
    });
  }
});

/**
 * GET /api/sslcommerz/payment-history
 * Get user's payment history (Protected)
 */
router.get("/payment-history", auth, async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.userId,
      paymentMethod: "sslcommerz",
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      payments: payments,
      count: payments.length,
    });
  } catch (error) {
    console.error("❌ Error fetching payment history:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

/**
 * GET /api/sslcommerz/status/:transactionId
 * Check payment status (Public - for verification)
 */
router.get("/status/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({
      transactionId: transactionId,
      paymentMethod: "sslcommerz",
    });

    if (!payment) {
      return res.status(404).json({ success: false, msg: "Payment not found" });
    }

    res.json({
      success: true,
      status: payment.status,
      amount: payment.amount,
      creditsGranted: payment.creditsGranted,
      completedAt: payment.completedAt,
    });
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

/**
 * GET /api/sslcommerz/debug/payments
 * Debug endpoint - List all recent payments (for testing only)
 */
router.get("/debug/payments", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).limit(20);

    res.json({
      success: true,
      count: payments.length,
      payments: payments.map((p) => ({
        _id: p._id,
        invoiceId: p.invoiceId,
        transactionId: p.transactionId,
        status: p.status,
        amount: p.amount,
        creditsGranted: p.creditsGranted,
        createdAt: p.createdAt,
        completedAt: p.completedAt,
      })),
    });
  } catch (error) {
    console.error("❌ Debug error:", error);
    res.status(500).json({ success: false, msg: "Error" });
  }
});

module.exports = router;
