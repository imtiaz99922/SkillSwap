const express = require("express");
const mongoose = require("mongoose");
const ChatMessage = require("../../models/ChatMessage");
const auth = require("../../middleware/auth");
const { createNotification } = require("../../services/notificationService");

const router = express.Router();

// ============= GLOBAL MESSAGES (PUBLIC) =============

// GET /api/chat/global - Get all global messages
router.get("/global", auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ messageType: "global" })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("senderId", "name email")
      .populate("likes", "name");

    const total = await ChatMessage.countDocuments({ messageType: "global" });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching global messages:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/chat/global - Post a global message (no notifications)
router.post("/global", auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ msg: "Message cannot be empty" });
    }

    const chatMessage = new ChatMessage({
      senderId: req.userId,
      message: message.trim(),
      messageType: "global",
      receiverId: null,
      timestamp: new Date(),
    });

    await chatMessage.save();
    await chatMessage.populate("senderId", "name email");

    // Emit via Socket.io for real-time updates (no notifications)
    const io = req.app.locals.io;
    if (io) {
      io.emit("newGlobalMessage", {
        _id: chatMessage._id,
        senderId: req.userId,
        senderName: chatMessage.senderId.name,
        message: chatMessage.message,
        timestamp: chatMessage.timestamp,
        likes: [],
        messageType: "global",
      });
    }

    res.status(201).json(chatMessage);
  } catch (error) {
    console.error("Error posting global message:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/chat/global/:messageId - Delete global message (sender only)
router.delete("/global/:messageId", auth, async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    if (message.senderId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ msg: "Not authorized to delete this message" });
    }

    await ChatMessage.findByIdAndDelete(req.params.messageId);

    // Emit via Socket.io
    const io = req.app.locals.io;
    if (io) {
      io.emit("messageDeleted", { messageId: req.params.messageId });
    }

    res.json({ msg: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/chat/global/:messageId/like - Like a message
router.post("/global/:messageId/like", auth, async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    const userIndex = message.likes.indexOf(req.userId);

    if (userIndex > -1) {
      // Unlike
      message.likes.splice(userIndex, 1);
    } else {
      // Like
      message.likes.push(req.userId);
    }

    await message.save();

    // Emit via Socket.io
    const io = req.app.locals.io;
    if (io) {
      io.emit("messageLikeUpdated", {
        messageId: req.params.messageId,
        likes: message.likes.length,
      });
    }

    res.json({ msg: "Like toggled", likes: message.likes.length });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ============= PRIVATE MESSAGES (NO NOTIFICATIONS) =============

// GET /api/chat/messages/:userId - Get private chat history with a specific user
router.get("/messages/:userId", auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.userId;

    const messages = await ChatMessage.find({
      messageType: "private",
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("senderId", "name")
      .populate("receiverId", "name")
      .limit(100);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/chat/conversations - Get list of users with recent conversations (private only)
router.get("/conversations", auth, async (req, res) => {
  try {
    const currentUserId = req.userId;

    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          messageType: "private",
          $or: [
            { senderId: new mongoose.Types.ObjectId(currentUserId) },
            { receiverId: new mongoose.Types.ObjectId(currentUserId) },
          ],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: {
                $eq: ["$senderId", new mongoose.Types.ObjectId(currentUserId)],
              },
              then: "$receiverId",
              else: "$senderId",
            },
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        "$receiverId",
                        new mongoose.Types.ObjectId(currentUserId),
                      ],
                    },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile",
        },
      },
      {
        $project: {
          userId: "$_id",
          userName: "$user.name",
          lastMessage: "$lastMessage.message",
          unreadCount: 1,
          lastMessageTime: "$lastMessage.timestamp",
          profileImage: { $arrayElemAt: ["$profile.profileImage", 0] },
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/chat/send - Send a PRIVATE message (NO NOTIFICATIONS)
router.post("/send", auth, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ msg: "Receiver and message are required" });
    }

    const chatMessage = new ChatMessage({
      senderId: req.userId,
      receiverId,
      message,
      messageType: "private",
      timestamp: new Date(),
    });

    await chatMessage.save();

    // Get io instance from app
    const io = req.app.locals.io;

    if (io) {
      const User = require("../../models/User");
      const sender = await User.findById(req.userId).select("name");
      const receiver = await User.findById(receiverId).select("name");
      const senderName = sender?.name || "Unknown";
      const receiverName = receiver?.name || "Unknown";
      const messagePayload = {
        _id: chatMessage._id,
        senderId: req.userId,
        senderName,
        receiverId,
        receiverName,
        message,
        timestamp: chatMessage.timestamp,
        isRead: false,
      };
      const updatedConversationForReceiver = {
        userId: req.userId,
        userName: senderName,
        lastMessage: message,
        lastMessageTime: chatMessage.timestamp,
        unreadCount: 1,
      };
      const updatedConversationForSender = {
        userId: receiverId,
        userName: receiverName,
        lastMessage: message,
        lastMessageTime: chatMessage.timestamp,
        unreadCount: 0,
      };

      // Emit message to receiver
      io.to(receiverId.toString()).emit("receiveMessage", messagePayload);
      io.to(receiverId.toString()).emit(
        "conversationUpdated",
        updatedConversationForReceiver,
      );

      // Emit conversation update to sender so their chat list shows the new thread immediately
      io.to(req.userId.toString()).emit(
        "conversationUpdated",
        updatedConversationForSender,
      );

      // Create a notification for the receiver
      await createNotification(req, {
        userId: receiverId,
        title: `New message from ${senderName}`,
        body: message,
        type: "message",
        data: {
          senderId: req.userId,
          chatMessageId: chatMessage._id,
        },
      });
    }

    res.json(chatMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/chat/mark-read/:userId - Mark private messages from a user as read
router.post("/mark-read/:userId", auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.userId;

    await ChatMessage.updateMany(
      {
        messageType: "private",
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false,
      },
      { isRead: true },
    );

    res.json({ msg: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
