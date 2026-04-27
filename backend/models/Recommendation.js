const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recommendedSkillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    recommendedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "SKILL_MATCH",
        "LEARNING_GOAL",
        "POPULAR_IN_CATEGORY",
        "MENTOR_MATCH",
      ],
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Recommendation", RecommendationSchema);
