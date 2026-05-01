const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed", "referral"],
      required: true,
    },
    value: {
      type: Number,
      required: true, // percentage (0-100) or fixed credits
    },
    maxUses: {
      type: Number,
      default: null, // null = unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for system coupons, referrer ID for referral codes
    },
    referredToUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // For course referral coupons - only this user can use it
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0, // minimum purchase price in credits
    },
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ], // empty = applicable to all
    applicableToNewUsersOnly: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: null,
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, validUntil: 1 });
CouponSchema.index({ createdBy: 1 });

module.exports = mongoose.model("Coupon", CouponSchema);
