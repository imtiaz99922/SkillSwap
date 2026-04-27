const mongoose = require("mongoose");

const UserSkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    accessLevel: {
      type: String,
      enum: ["basic", "intermediate", "advanced"],
      default: "basic",
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Compound index to prevent duplicates
UserSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model("UserSkill", UserSkillSchema);
