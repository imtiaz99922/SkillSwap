const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// Payment packages/products
const PACKAGES = [
  { id: "starter", name: "Starter", credits: 100, amount: 9.99 },
  { id: "pro", name: "Pro", credits: 500, amount: 39.99 },
  { id: "business", name: "Business", credits: 1500, amount: 99.99 },
  { id: "enterprise", name: "Enterprise", credits: 5000, amount: 299.99 },
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

// POST /api/payment/process - Process payment (protected)
router.post("/process", auth, async (req, res) => {
  try {
    const { packageId, paymentMethod, paymentDetails } = req.body;

    if (!packageId || !paymentMethod) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Find package
    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return res.status(404).json({ msg: "Package not found" });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.userId,
      packageId,
      amount: pkg.amount,
      creditsGranted: pkg.credits,
      paymentMethod,
      status: "Completed",
      transactionId: `TXN-${Date.now()}`,
    });

    await payment.save();

    // Update wallet
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({
        userId: req.userId,
        credits: pkg.credits,
        totalEarned: pkg.credits,
      });
    } else {
      wallet.credits += pkg.credits;
      wallet.totalEarned += pkg.credits;
    }
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: req.userId,
      type: "EARN",
      amount: pkg.credits,
      reason: "Bonus",
      description: `Purchased ${pkg.name} package`,
      status: "Completed",
    });
    await transaction.save();

    res.status(201).json({
      payment,
      wallet,
      message: `Successfully purchased ${pkg.name} package! ${pkg.credits} credits added to your wallet.`,
    });
  } catch (err) {
    console.error("Error processing payment:", err);
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

module.exports = router;
