const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    price: {
      type: Number,
      required: true,
      min: 0, // in credits
    },
    thumbnail: {
      type: String,
      default: null,
    },
    duration: {
      type: Number, // in hours
      default: null,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
CourseSchema.index({ instructorId: 1, isPublished: 1 });
CourseSchema.index({ category: 1, isPublished: 1 });
CourseSchema.index({ level: 1, isPublished: 1 });
CourseSchema.index({ tags: 1, isPublished: 1 });
CourseSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Course", CourseSchema);
