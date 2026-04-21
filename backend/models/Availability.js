const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // Format: "HH:MM"
    required: true,
    validate: {
      validator: function (v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "Start time must be in HH:MM format",
    },
  },
  endTime: {
    type: String, // Format: "HH:MM"
    required: true,
    validate: {
      validator: function (v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "End time must be in HH:MM format",
    },
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure end time is after start time
availabilitySchema.pre("save", function (next) {
  const start = this.startTime.split(":").map(Number);
  const end = this.endTime.split(":").map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];

  if (endMinutes <= startMinutes) {
    return next(new Error("End time must be after start time"));
  }
  next();
});

// Index for efficient queries
availabilitySchema.index({ userId: 1, date: 1 });
availabilitySchema.index({ userId: 1, date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("Availability", availabilitySchema);
