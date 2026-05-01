const Notification = require("../models/Notification");

async function createNotification(
  req,
  { userId, title, body, type, data = {} },
) {
  if (!userId || !title || !body || !type) {
    throw new Error("Missing notification fields");
  }

  const notification = new Notification({
    userId,
    title,
    body,
    type,
    data,
  });

  await notification.save();

  const io = req?.app?.locals?.io;
  if (io) {
    io.to(userId.toString()).emit("newNotification", {
      _id: notification._id,
      userId: notification.userId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      data: notification.data,
      sentAt: notification.sentAt,
      readAt: notification.readAt,
    });
  }

  return notification;
}

module.exports = {
  createNotification,
};
