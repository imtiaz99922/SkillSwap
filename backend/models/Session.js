const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
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
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    mentorshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentorship",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in minutes
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
    completionVerified: {
      type: Boolean,
      default: false,
    },
    mentorConfirmed: {
      type: Boolean,
      default: false,
    },
    menteeConfirmed: {
      type: Boolean,
      default: false,
    },
    mentorConfirmedAt: {
      type: Date,
    },
    menteeConfirmedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    creditsAwarded: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Session", SessionSchema);
