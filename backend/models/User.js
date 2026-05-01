const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: { type: String, required: true },

  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationTokenExpiry: Date,

  // Referral System
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    default: null,
    index: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  referralStats: {
    totalReferrals: { type: Number, default: 0 },
    successfulReferrals: { type: Number, default: 0 },
    totalReferralEarnings: { type: Number, default: 0 }, // in credits
  },

  // Course Enrollments
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  publishedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],

  // Mentorship
  mentorProfile: {
    isActiveMentor: { type: Boolean, default: false },
    mentorRating: { type: Number, default: 0 },
    mentorReviews: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: null },
    bio: { type: String, default: null },
    specialization: [String],
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
  },

  // User Stats
  totalCreditsEarned: { type: Number, default: 0 },
  totalCreditSpent: { type: Number, default: 0 },
  completedCourses: { type: Number, default: 0 },
  totalRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
