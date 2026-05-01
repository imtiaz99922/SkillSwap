const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const auth = require("../middleware/auth");

// ⚠️ IMPORTANT: Stripe has been removed. Only SSLCommerz is now supported.
// For new payment processing, use: POST /api/sslcommerz/initiate-payment
console.log("✅ SSLCommerz payment gateway (ONLY) - Stripe has been removed");

// SSLCommerz Credit Packages (BDT) - Updated from Stripe (USD)
const PACKAGES = [
  { id: "starter", name: "Starter", credits: 100, amount: 500 },
  { id: "pro", name: "Pro", credits: 500, amount: 2000 },
  { id: "business", name: "Business", credits: 1500, amount: 5000 },
  { id: "enterprise", name: "Enterprise", credits: 5000, amount: 15000 },
];

// GET /api/payment/packages - Get all payment packages
router.get("/packages", async (req, res) => {
  try {
    res.json(PACKAGES);
  } catch (err) {
    console.error("Error fetching packages:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ⚠️ STRIPE ENDPOINTS REMOVED - Use /api/sslcommerz/initiate-payment instead
// POST /api/payment/create-payment-intent - DEPRECATED (use SSLCommerz)
// POST /api/payment/confirm-payment - DEPRECATED (use SSLCommerz)

// GET /api/payment/history - Get user's payment history (protected)
router.get("/history", auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(payments);
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/payment/:id - Get specific payment details (protected)
router.get("/:id", auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    if (payment.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(payment);
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/payment/:id/receipt - Get payment receipt (protected)
router.get("/:id/receipt", auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    if (payment.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const pkg = PACKAGES.find((p) => p.id === payment.packageId);

    res.json({
      id: payment._id,
      date: payment.createdAt,
      transactionId: payment.transactionId,
      package: pkg?.name,
      amount: payment.amount,
      credits: payment.creditsGranted,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
    });
  } catch (err) {
    console.error("Error fetching receipt:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/payment/webhook - STRIPE WEBHOOK REMOVED (use /api/sslcommerz/ipn instead)

// POST /api/payment/apply-coupon - DEPRECATED (Stripe removed, use SSLCommerz)
// POST /api/payment/confirm-payment-with-coupon - DEPRECATED (Stripe removed, use SSLCommerz)

module.exports = router;
