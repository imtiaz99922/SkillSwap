const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "COMPLETED"],
      default: "PENDING",
    },
    courseTaken: {
      type: Boolean,
      default: false,
    },
    bonusCreditsReferrer: {
      type: Number,
      default: 100,
    },
    bonusCreditsReferree: {
      type: Number,
      default: 100,
    },
    bonusRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Referral", ReferralSchema);
