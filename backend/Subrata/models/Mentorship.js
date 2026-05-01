const mongoose = require("mongoose");

const MentorshipSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED", "REJECTED"],
      default: "PENDING",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completedSessions: {
      type: Number,
      default: 0,
    },
    sessionCount: {
      type: Number,
      default: 5,
    },
    preferredTimeSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    menteeNotes: [
      {
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
    menteeRating: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },
    menteeReview: {
      type: String,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    blockUntil: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Mentorship", MentorshipSchema);
