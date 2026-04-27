const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
    },
    category: {
      type: String,
      enum: ["SKILL", "PARTICIPATION", "ACHIEVEMENT", "MILESTONE"],
      required: true,
    },
    criteria: {
      type: {
        type: String,
        enum: [
          "SKILL_COUNT",
          "MENTORSHIP",
          "REFERRAL",
          "COURSES_COMPLETED",
          "RATING",
          "CUSTOM",
        ],
        required: true,
      },
      value: {
        type: Number,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const UserBadgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = {
  Badge: mongoose.model("Badge", BadgeSchema),
  UserBadge: mongoose.model("UserBadge", UserBadgeSchema),
};
