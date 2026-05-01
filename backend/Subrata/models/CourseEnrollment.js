const mongoose = require("mongoose");

const CourseEnrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true, // in credits
    },
    discountApplied: {
      type: Number,
      default: 0, // discount amount in credits
    },
    finalPrice: {
      type: Number,
      required: true, // in credits
    },
    couponCode: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: null,
    },
    enrollmentStatus: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
CourseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
CourseEnrollmentSchema.index({ userId: 1, enrollmentStatus: 1 });
CourseEnrollmentSchema.index({ courseId: 1, enrollmentStatus: 1 });
CourseEnrollmentSchema.index({ paymentStatus: 1 });
CourseEnrollmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CourseEnrollment", CourseEnrollmentSchema);
