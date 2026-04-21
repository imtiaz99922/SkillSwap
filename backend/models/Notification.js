const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: [
      "session_update",
      "credit_change",
      "message",
      "review",
      "general",
      "message_sent",
    ],
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Additional data for the notification
    default: {},
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
    default: null,
  },
});

// Index for efficient queries
notificationSchema.index({ userId: 1, sentAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
