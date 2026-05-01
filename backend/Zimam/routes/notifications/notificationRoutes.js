const express = require("express");
const Notification = require("../../models/Notification");
const auth = require("../../middleware/auth");
const { createNotification } = require("../../services/notificationService");

const router = express.Router();

// GET /api/notifications - Get user's notifications
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;

    const filter = { userId: req.userId };
    if (unreadOnly === "true") {
      filter.readAt = null;
    }
    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      readAt: null,
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    if (notification.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await notification.save();
    }

    res.json({ msg: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put("/mark-all-read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, readAt: null },
      { readAt: new Date() },
    );

    res.json({ msg: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    if (notification.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ msg: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/notifications/send - Send notification (internal use)
router.post("/send", auth, async (req, res) => {
  const { userId, title, body, type, data } = req.body;

  if (!userId || !title || !body || !type) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  try {
    const notification = await createNotification(req, {
      userId,
      title,
      body,
      type,
      data: data || {},
    });

    // Send push notification via Firebase (optional)
    await sendPushNotification(userId, title, body, data);

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Helper function to send push notification
async function sendPushNotification(userId, title, body, data = {}) {
  try {
    // This would integrate with Firebase Cloud Messaging
    // For now, we'll just log it
    console.log(`Push notification to user ${userId}: ${title} - ${body}`);

    // TODO: Implement Firebase FCM integration
    // const admin = require('firebase-admin');
    // const userTokens = await getUserFCMTokens(userId);
    // if (userTokens.length > 0) {
    //   await admin.messaging().sendMulticast({
    //     tokens: userTokens,
    //     notification: { title, body },
    //     data: data
    //   });
    // }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

module.exports = router;
