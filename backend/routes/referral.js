const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Referral = require("../models/Referral");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Coupon = require("../models/Coupon");
const Notification = require("../models/Notification");
const crypto = require("crypto");

// Generate referral code
const generateReferralCode = () => {
  return crypto.randomBytes(6).toString("hex").toUpperCase().substring(0, 8);
};

// Get user's referral code and coupon
router.get("/my-code", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Generate referral code if not exists
    if (!user.referralCode) {
      const newCode = generateReferralCode();
      user.referralCode = newCode;
      await user.save();

      // Create coupon for referral code
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // Valid for 1 year

      const coupon = new Coupon({
        code: newCode,
        type: "referral",
        value: 20, // 20% discount
        createdBy: req.user.id,
        validFrom: new Date(),
        validUntil: endDate,
        applicableCourses: [], // applicable to all courses
        isActive: true,
        description: `Referral code from ${user.name}`,
        maxUses: null, // unlimited uses
      });

      await coupon.save();

      // Create notification
      await Notification.create({
        userId: req.user.id,
        type: "referral_code_generated",
        message: `Your referral code ${newCode} has been generated. Share it to earn credits!`,
        relatedId: user._id,
        relatedModel: "User",
      });
    }

    const coupon = await Coupon.findOne({ code: user.referralCode });

    res.json({
      referralCode: user.referralCode,
      shareUrl: `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/courses?referral=${user.referralCode}`,
      coupon: {
        code: coupon?.code,
        discount: "20% off any course",
        validUntil: coupon?.validUntil,
        usageCount: coupon?.usageCount || 0,
      },
      stats: {
        totalReferrals: user.referralStats.totalReferrals,
        successfulReferrals: user.referralStats.successfulReferrals,
        totalEarnings: user.referralStats.totalReferralEarnings,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send referral code to someone
router.post("/send/:targetUserId", auth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(targetUserId);

    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!sender.referralCode) {
      return res
        .status(400)
        .json({ message: "You don't have a referral code yet" });
    }

    // Create notification for recipient with referral code
    await Notification.create({
      userId: targetUserId,
      type: "referral_received",
      message: `${sender.name} sent you a referral code: ${sender.referralCode} - Get 20% off any course!`,
      relatedId: req.user.id,
      relatedModel: "User",
    });

    // Update sender's referral stats
    sender.referralStats.totalReferrals += 1;
    await sender.save();

    res.json({
      message: "Referral code sent successfully",
      recipientName: recipient.name,
      referralCode: sender.referralCode,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get referral stats
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const coupon = await Coupon.findOne({ code: user.referralCode });

    const stats = {
      referralCode: user.referralCode,
      totalReferrals: user.referralStats.totalReferrals,
      successfulReferrals: user.referralStats.successfulReferrals,
      totalEarnings: user.referralStats.totalReferralEarnings,
      couponUsages: coupon?.usageCount || 0,
      couponUsers: coupon?.usedBy?.length || 0,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all referrals for user
router.get("/", auth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user.id })
      .populate("referredUserId", "name email createdAt")
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Use referral code when registering
router.post("/register/:referralCode", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const referrerUser = await User.findOne({
      referralCode: req.params.referralCode,
    });

    if (!referrerUser) {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    // Set referrer
    user.referredBy = referrerUser._id;
    await user.save();

    // Update referrer's stats
    referrerUser.referralStats.totalReferrals += 1;
    referrerUser.referralStats.successfulReferrals += 1;
    await referrerUser.save();

    // Update coupon usage for this referral conversion
    const coupon = await Coupon.findOne({ code: req.params.referralCode });
    if (coupon) {
      coupon.usageCount += 1;
      coupon.usedBy.push({
        userId: userId,
        courseId: null, // not used yet for a specific course
        usedAt: new Date(),
      });
      await coupon.save();
    }

    // Create referral record
    const referral = new Referral({
      referrerId: referrerUser._id,
      referralCode: req.params.referralCode,
      referredUserId: userId,
      email: user.email,
      status: "ACCEPTED",
    });

    await referral.save();

    // Create notifications
    await Notification.create({
      userId: referrerUser._id,
      type: "referral_accepted",
      message: `${user.name} accepted your referral code!`,
      relatedId: userId,
      relatedModel: "User",
    });

    await Notification.create({
      userId: userId,
      type: "registered_via_referral",
      message: `Welcome! You can use referral code "${req.params.referralCode}" for 20% discount on courses`,
      relatedId: referrerUser._id,
      relatedModel: "User",
    });

    res.json({
      message: "Referral applied successfully",
      referralCode: req.params.referralCode,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark referral as completed (when referred user takes a course)
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);

    if (!referral)
      return res.status(404).json({ message: "Referral not found" });

    if (referral.referrerId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    referral.status = "COMPLETED";
    await referral.save();

    // Reward referrer with credits
    const referrerWallet = await Wallet.findOne({
      userId: referral.referrerId,
    });
    if (referrerWallet) {
      const bonusAmount = 50; // 50 credits bonus for successful referral
      referrerWallet.balance += bonusAmount;
      await referrerWallet.save();

      // Update user stats
      const referrerUser = await User.findById(referral.referrerId);
      referrerUser.referralStats.totalReferralEarnings += bonusAmount;
      await referrerUser.save();

      await Transaction.create({
        userId: referral.referrerId,
        type: "EARN",
        amount: bonusAmount,
        reason: `Referral completion bonus - ${referral.referralCode}`,
        status: "COMPLETED",
      });

      // Create notification
      await Notification.create({
        userId: referral.referrerId,
        type: "referral_completed",
        message: `Referral completed! You earned ${bonusAmount} credits`,
        relatedId: referral.referredUserId,
        relatedModel: "User",
      });
    }

    res.json({
      message: "Referral marked as completed",
      bonusAwarded: 50,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all referral coupons for a user (their generated codes)
router.get("/coupons/my-referrals", auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({
      createdBy: req.user.id,
      type: "referral",
    }).select("code value usageCount usedBy validUntil");

    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
