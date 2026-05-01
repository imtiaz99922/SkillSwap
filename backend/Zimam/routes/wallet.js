const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// GET /api/wallet - Get user's wallet
router.get("/", auth, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.userId });

    if (!wallet) {
      wallet = new Wallet({
        userId: req.userId,
        credits: 0,
        totalEarned: 0,
        totalSpent: 0,
      });
      await wallet.save();
    }

    res.json(wallet);
  } catch (err) {
    console.error("Error fetching wallet:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/wallet/transactions - Get wallet transactions
router.get("/transactions", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/wallet/add-credits - Add credits to wallet (admin/system only)
router.post("/add-credits", auth, async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({
        userId: req.userId,
        credits: amount,
        totalEarned: amount,
      });
    } else {
      wallet.credits += amount;
      wallet.totalEarned += amount;
    }

    await wallet.save();

    // Log transaction
    const transaction = new Transaction({
      userId: req.userId,
      type: "EARN",
      amount,
      reason: reason || "Credit purchase",
      status: "COMPLETED",
    });
    await transaction.save();

    res.json({ wallet, transaction });
  } catch (err) {
    console.error("Error adding credits:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/wallet/spend-credits - Deduct credits from wallet
router.post("/spend-credits", auth, async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(400).json({ msg: "Wallet not found" });
    }

    if (wallet.credits < amount) {
      return res.status(400).json({ msg: "Insufficient credits" });
    }

    wallet.credits -= amount;
    wallet.totalSpent += amount;
    await wallet.save();

    // Log transaction
    const transaction = new Transaction({
      userId: req.userId,
      type: "SPEND",
      amount,
      reason: reason || "Credit spent",
      status: "COMPLETED",
    });
    await transaction.save();

    res.json({ wallet, transaction });
  } catch (err) {
    console.error("Error spending credits:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
