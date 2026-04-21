const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TimeSession", // Will be created later
    required: false, // For now, make it optional
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate reviews for the same session
reviewSchema.index(
  { reviewerId: 1, sessionId: 1 },
  { unique: true, sparse: true },
);

// Index for efficient queries
reviewSchema.index({ targetUserId: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
