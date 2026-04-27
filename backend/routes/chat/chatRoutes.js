const express = require("express");
const mongoose = require("mongoose");
const ChatMessage = require("../../models/ChatMessage");
const auth = require("../../middleware/auth");

const router = express.Router();

// GET /api/chat/messages/:userId - Get chat history with a specific user
router.get("/messages/:userId", auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.userId;

    const messages = await ChatMessage.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("senderId", "name")
      .populate("receiverId", "name")
      .limit(100); // Limit to last 100 messages

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/chat/conversations - Get list of users with recent conversations
router.get("/conversations", auth, async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Get distinct users who have chatted with current user
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
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
        $project: {
          userId: "$_id",
          userName: "$user.name",
          lastMessage: 1,
          unreadCount: 1,
          lastMessageTime: "$lastMessage.timestamp",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/chat/send - Send a message to another user
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
      timestamp: new Date(),
    });

    await chatMessage.save();

    // Get io instance from app
    const io = req.app.locals.io;

    // Create notifications for both sender and receiver
    try {
      const User = require("../../models/User");
      const Notification = require("../../models/Notification");

      const sender = await User.findById(req.userId).select("name");
      const receiver = await User.findById(receiverId).select("name");

      if (sender) {
        // Notification for receiver: "New message from [sender name]"
        const receiverNotification = new Notification({
          userId: receiverId,
          title: `New message from ${sender.name}`,
          body: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          type: "message",
          data: { senderId: req.userId, senderName: sender.name },
          sentAt: new Date(),
        });
        await receiverNotification.save();

        // Emit socket events
        if (io) {
          // Emit message to receiver
          io.to(receiverId.toString()).emit("receiveMessage", {
            _id: chatMessage._id,
            senderId: req.userId,
            senderName: sender.name,
            receiverId,
            message,
            timestamp: chatMessage.timestamp,
            isRead: false,
          });

          // Emit notification to receiver
          io.to(receiverId.toString()).emit("newNotification", {
            _id: receiverNotification._id,
            userId: receiverId,
            title: receiverNotification.title,
            body: receiverNotification.body,
            type: "message",
            data: receiverNotification.data,
            sentAt: receiverNotification.sentAt,
            readAt: null,
          });

          // Emit conversation updated to receiver (so they see this user in their chat list)
          io.to(receiverId.toString()).emit("conversationUpdated", {
            userId: req.userId,
            userName: sender.name,
            lastMessage: message,
          });
        }
      }

      if (receiver) {
        // Notification for sender: "Message sent to [receiver name]"
        const senderNotification = new Notification({
          userId: req.userId,
          title: `Message sent to ${receiver.name}`,
          body: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          type: "message_sent",
          data: { receiverId, receiverName: receiver.name },
          sentAt: new Date(),
        });
        await senderNotification.save();

        // Emit notification to sender
        if (io) {
          io.to(req.userId.toString()).emit("newNotification", {
            _id: senderNotification._id,
            userId: req.userId,
            title: senderNotification.title,
            body: senderNotification.body,
            type: "message_sent",
            data: senderNotification.data,
            sentAt: senderNotification.sentAt,
            readAt: null,
          });
        }
      }
    } catch (err) {
      console.error("Failed to create notification:", err.message || err);
      // Don't fail the message send if notification fails
    }

    res.json(chatMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/chat/mark-read/:userId - Mark messages from a user as read
router.post("/mark-read/:userId", auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.userId;

    await ChatMessage.updateMany(
      {
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
