const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // null for global messages
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  messageType: {
    type: String,
    enum: ["global", "private"],
    default: "global", // Changed default to global
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Index for efficient querying - global messages first, then by time
chatMessageSchema.index({ messageType: 1, timestamp: -1 });
chatMessageSchema.index({ senderId: 1, timestamp: -1 });
chatMessageSchema.index({ receiverId: 1, timestamp: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
