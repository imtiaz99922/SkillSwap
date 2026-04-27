const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Mentorship = require("../models/Mentorship");
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
    const { courseId } = req.params;

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
    const { courseId } = req.params;
    const { sessionCount, preferredTimeSlots } = req.body;

    // Check if user is enrolled in course
    const enrollment = await CourseEnrollment.findOne({
      userId: req.user.id,
      courseId,
      paymentStatus: "completed",
      enrollmentStatus: "active",
    }).populate("instructorId");

    if (!enrollment) {
      return res
        .status(403)
        .json({
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
      return res
        .status(400)
        .json({
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
    await mentorship.save();

    // Create notification for mentee
    await Notification.create({
      userId: mentorship.menteeId,
      type: "mentorship_rejected",
      message: `Your mentorship request has been declined`,
      relatedId: mentorship._id,
      relatedModel: "Mentorship",
    });

    res.json({
      message: "Mentorship rejected",
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

module.exports = router;
