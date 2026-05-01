const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    type: {
      type: String,
      required: true,
      enum: ["teach", "learn"],
    },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // For "teach" type skills
    coursePrice: {
      type: Number,
      default: null, // in credits, only for teach type
    },
    courseDuration: {
      type: Number,
      default: null, // in hours, only for teach type
    },
    courseCapacity: {
      type: Number,
      default: null, // max students
    },
    hasDemoQuiz: {
      type: Boolean,
      default: false, // only for teach type
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null, // links to actual Course document
    },
    // For "learn" type skills
    interestedInstructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
SkillSchema.index({ userId: 1, isActive: 1 });
SkillSchema.index({ category: 1, isActive: 1 });
SkillSchema.index({ tags: 1, isActive: 1 });

module.exports = mongoose.model("Skill", SkillSchema);

module.exports = mongoose.model("Skill", SkillSchema);
