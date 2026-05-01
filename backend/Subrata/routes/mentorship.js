const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../middleware/auth");
const Mentorship = require("../models/Mentorship");
const Course = require("../models/Course");
const CourseEnrollment = require("../models/CourseEnrollment");
const Skill = require("../models/Skill");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");

// Get all mentorships for current user (as mentor or mentee)
router.get("/", auth, async (req, res) => {
  try {
    const mentorships = await Mentorship.find({
      $or: [{ mentorId: req.user.id }, { menteeId: req.user.id }],
    })
      .populate("mentorId", "name email mentorProfile")
      .populate("menteeId", "name email")
      .populate("courseId", "title price")
      .sort({ createdAt: -1 });

    res.json(mentorships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get mentors for a specific course
router.get("/course/:courseId/mentors", auth, async (req, res) => {
  try {
    let { courseId } = req.params;
    let course = null;

    if (mongoose.Types.ObjectId.isValid(courseId)) {
      course = await Course.findById(courseId);
    }
    if (!course) {
      course = await Course.findOne({ courseCode: courseId });
      if (course) {
        courseId = course._id;
      }
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get course instructor
    const courseInstruction = await CourseEnrollment.findOne({
      courseId,
      paymentStatus: "completed",
    }).populate("instructorId", "name email mentorProfile");

    if (!courseInstruction) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get instructor profile
    const instructor = await User.findById(courseInstruction.instructorId);

    res.json({
      primaryMentor: {
        _id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        mentorProfile: instructor.mentorProfile,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Apply for mentorship on a course (requires enrollment)
router.post("/apply/:courseId", auth, async (req, res) => {
  try {
    let { courseId } = req.params;
    const { sessionCount, preferredTimeSlots } = req.body;

    // Resolve course by internal ID or custom course code
    let course = null;
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      course = await Course.findById(courseId);
    }
    if (!course) {
      course = await Course.findOne({ courseCode: courseId });
      if (course) {
        courseId = course._id;
      }
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is enrolled in course
    const enrollment = await CourseEnrollment.findOne({
      userId: req.user.id,
      courseId,
      paymentStatus: "completed",
      enrollmentStatus: "active",
    }).populate("instructorId");

    if (!enrollment) {
      return res.status(403).json({
        message: "You must be enrolled in the course to apply for mentorship",
      });
    }

    // Check for existing active mentorship
    const existingMentorship = await Mentorship.findOne({
      menteeId: req.user.id,
      courseId,
      status: { $in: ["PENDING", "ACTIVE"] },
    });

    if (existingMentorship) {
      return res.status(400).json({
        message: "You already have an active mentorship for this course",
      });
    }

    // Create mentorship
    const mentorship = new Mentorship({
      mentorId: enrollment.instructorId._id,
      menteeId: req.user.id,
      courseId,
      sessionCount: sessionCount || 5,
      preferredTimeSlots,
      status: "PENDING",
    });

    await mentorship.save();

    // Create notification for mentor
    const mentee = await User.findById(req.user.id);
    await Notification.create({
      userId: enrollment.instructorId._id,
      type: "mentorship_requested",
      message: `${mentee.name} requested mentorship for your course`,
      relatedId: mentorship._id,
      relatedModel: "Mentorship",
    });

    // Create notification for mentee
    await Notification.create({
      userId: req.user.id,
      type: "mentorship_applied",
      message: `Your mentorship request has been submitted`,
      relatedId: mentorship._id,
      relatedModel: "Mentorship",
    });

    res.status(201).json({
      message: "Mentorship application created",
      mentorship: await mentorship.populate([
        { path: "mentorId", select: "name email mentorProfile" },
        { path: "menteeId", select: "name email" },
        { path: "courseId", select: "title price" },
      ]),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept mentorship application (mentor only)
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    if (mentorship.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    mentorship.status = "ACTIVE";
    mentorship.acceptedAt = new Date();
    await mentorship.save();

    // Create notification for mentee
    const mentee = await User.findById(mentorship.menteeId);
    await Notification.create({
      userId: mentorship.menteeId,
      type: "mentorship_accepted",
      message: `Your mentorship request has been accepted`,
      relatedId: mentorship._id,
      relatedModel: "Mentorship",
    });

    res.json({
      message: "Mentorship accepted",
      mentorship: await mentorship.populate([
        { path: "mentorId", select: "name email" },
        { path: "menteeId", select: "name email" },
        { path: "courseId", select: "title" },
      ]),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject mentorship application (mentor only)
router.put("/:id/reject", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    if (mentorship.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    mentorship.status = "REJECTED";
    mentorship.rejectedAt = new Date();
    // Set 24-hour block for messaging
    const blockUntil = new Date();
    blockUntil.setHours(blockUntil.getHours() + 24);
    mentorship.blockUntil = blockUntil;
    await mentorship.save();

    // Create notification for mentee
    await Notification.create({
      userId: mentorship.menteeId,
      type: "mentorship_rejected",
      message: `Your mentorship request has been declined. You cannot message this mentor for 24 hours.`,
      relatedId: mentorship._id,
      relatedModel: "Mentorship",
    });

    res.json({
      message: "Mentorship rejected. 24-hour message block activated.",
      mentorship,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complete a mentorship session
router.post("/:id/session-complete", auth, async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    if (mentorship.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    mentorship.completedSessions = (mentorship.completedSessions || 0) + 1;

    // Check if all sessions completed
    if (mentorship.completedSessions >= mentorship.sessionCount) {
      mentorship.status = "COMPLETED";
      mentorship.completedAt = new Date();
    }

    await mentorship.save();

    // Create notification
    const mentee = await User.findById(mentorship.menteeId);
    await Notification.create({
      userId: mentorship.menteeId,
      type: "session_completed",
      message: `Mentorship session completed (${mentorship.completedSessions}/${mentorship.sessionCount})`,
      relatedId: mentorship._id,
      relatedModel: "Mentorship",
    });

    res.json({
      message: "Session marked as completed",
      mentorship,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rate mentorship (mentee only)
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const { rating, review } = req.body;

    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    if (mentorship.menteeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    mentorship.menteeRating = rating;
    mentorship.menteeReview = review || null;
    await mentorship.save();

    // Update mentor profile rating
    const mentor = await User.findById(mentorship.mentorId);
    const totalRatings = mentor.ratingCount + 1;
    mentor.totalRating =
      (mentor.totalRating * mentor.ratingCount + rating) / totalRatings;
    mentor.ratingCount = totalRatings;
    await mentor.save();

    // Create notification for mentor
    await Notification.create({
      userId: mentorship.mentorId,
      type: "mentorship_rated",
      message: `You received a ${rating}-star review from a mentee`,
      relatedId: mentorship._id,
      relatedModel: "Mentorship",
    });

    res.json({
      message: "Mentorship rated successfully",
      mentorship,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message in mentorship (only if ACTIVE or not blocked)
router.post("/:id/send-message", auth, async (req, res) => {
  try {
    const { message } = req.body;
    const mentorshipId = req.params.id;

    const mentorship = await Mentorship.findById(mentorshipId);
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    // Check if user is part of this mentorship
    const isMentor = mentorship.mentorId.toString() === req.user.id;
    const isMentee = mentorship.menteeId.toString() === req.user.id;

    if (!isMentor && !isMentee) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if mentee is trying to message and is blocked
    if (isMentee && mentorship.status === "REJECTED" && mentorship.blockUntil) {
      if (new Date() < mentorship.blockUntil) {
        const minutesLeft = Math.ceil(
          (mentorship.blockUntil - new Date()) / (1000 * 60),
        );
        return res.status(403).json({
          message: `You cannot message this mentor for another ${minutesLeft} minutes after rejection.`,
        });
      } else {
        // Block period expired, update blockUntil
        mentorship.blockUntil = null;
        await mentorship.save();
      }
    }

    // Only allow messaging if mentorship is ACTIVE
    if (mentorship.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Mentorship must be active to send messages",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    // Create chat message
    const ChatMessage = require("../models/ChatMessage");
    const receiverId = isMentor ? mentorship.menteeId : mentorship.mentorId;

    const chatMessage = new ChatMessage({
      senderId: req.user.id,
      receiverId: receiverId,
      message: message.trim(),
      messageType: "private",
    });

    await chatMessage.save();

    // Create notification for receiver
    await Notification.create({
      userId: receiverId,
      type: "mentorship_message",
      message: `New message from your ${isMentor ? "mentee" : "mentor"}`,
      relatedId: mentorshipId,
      relatedModel: "Mentorship",
    });

    res.json({
      message: "Message sent successfully",
      chatMessage: await chatMessage.populate("senderId", "name email"),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages for a mentorship
router.get("/:id/messages", auth, async (req, res) => {
  try {
    const mentorshipId = req.params.id;
    const mentorship = await Mentorship.findById(mentorshipId);

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    // Check if user is part of this mentorship
    const isMentor = mentorship.mentorId.toString() === req.user.id;
    const isMentee = mentorship.menteeId.toString() === req.user.id;

    if (!isMentor && !isMentee) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const ChatMessage = require("../models/ChatMessage");
    const otherUserId = isMentor ? mentorship.menteeId : mentorship.mentorId;

    // Get all messages between these two users (mentorship related)
    const messages = await ChatMessage.find({
      messageType: "private",
      $or: [
        { senderId: req.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user.id },
      ],
    })
      .populate("senderId", "name email")
      .sort({ timestamp: 1 });

    // Mark messages as read
    await ChatMessage.updateMany(
      {
        receiverId: req.user.id,
        senderId: otherUserId,
        isRead: false,
      },
      { isRead: true },
    );

    res.json({
      mentorship,
      messages,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all pending mentorship requests for mentor
router.get("/requests/pending", auth, async (req, res) => {
  try {
    const requests = await Mentorship.find({
      mentorId: req.user.id,
      status: "PENDING",
    })
      .populate("menteeId", "name email")
      .populate("courseId", "title")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all active mentorships for current user
router.get("/active/all", auth, async (req, res) => {
  try {
    const activeMentorships = await Mentorship.find({
      $or: [{ mentorId: req.user.id }, { menteeId: req.user.id }],
      status: "ACTIVE",
    })
      .populate("mentorId", "name email")
      .populate("menteeId", "name email")
      .populate("courseId", "title")
      .sort({ acceptedAt: -1 });

    res.json(activeMentorships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
