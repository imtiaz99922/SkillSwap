const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Session = require("../models/Session");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Mentorship = require("../models/Mentorship");

// Create a session
router.post("/", auth, async (req, res) => {
  try {
    const { mentorId, menteeId, skillId, mentorshipId, startTime } = req.body;

    if (!mentorId || !menteeId || !skillId || !startTime) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const session = new Session({
      mentorId,
      menteeId,
      skillId,
      mentorshipId,
      startTime: new Date(startTime),
      status: "SCHEDULED",
    });

    await session.save();

    res.status(201).json({
      msg: "Session created",
      session: await session.populate([
        { path: "mentorId", select: "name email" },
        { path: "menteeId", select: "name email" },
        { path: "skillId", select: "title" },
      ]),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get sessions for user
router.get("/", auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ mentorId: req.userId }, { menteeId: req.userId }],
    })
      .populate("mentorId", "name email")
      .populate("menteeId", "name email")
      .populate("skillId", "title category")
      .sort({ startTime: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Start session
router.put("/:id/start", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: "Session not found" });

    if (
      session.mentorId.toString() !== req.userId &&
      session.menteeId.toString() !== req.userId
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    session.status = "IN_PROGRESS";
    await session.save();

    res.json({ msg: "Session started", session });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// End session
router.put("/:id/end", auth, async (req, res) => {
  try {
    const { endTime } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: "Session not found" });

    if (
      session.mentorId.toString() !== req.userId &&
      session.menteeId.toString() !== req.userId
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    session.endTime = new Date(endTime);
    session.duration = Math.round(
      (session.endTime - session.startTime) / (1000 * 60),
    );
    session.status = "COMPLETED";
    await session.save();

    res.json({ msg: "Session ended", session });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Confirm session completion (mentor or mentee)
router.put("/:id/confirm", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: "Session not found" });

    if (session.mentorId.toString() === req.userId) {
      session.mentorConfirmed = true;
      session.mentorConfirmedAt = new Date();
    } else if (session.menteeId.toString() === req.userId) {
      session.menteeConfirmed = true;
      session.menteeConfirmedAt = new Date();
    } else {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // If both confirmed, mark as verified
    if (session.mentorConfirmed && session.menteeConfirmed) {
      session.completionVerified = true;

      // Award credits to mentor
      const wallet = await Wallet.findOne({ userId: session.mentorId });
      if (wallet) {
        session.creditsAwarded = 50; // 50 credits per session
        wallet.credits += session.creditsAwarded;
        wallet.totalEarned += session.creditsAwarded;
        await wallet.save();

        await Transaction.create({
          userId: session.mentorId,
          type: "EARN",
          amount: session.creditsAwarded,
          reason: `Session completion verified`,
          status: "COMPLETED",
        });
      }

      // Update mentorship progress
      if (session.mentorshipId) {
        const mentorship = await Mentorship.findById(session.mentorshipId);
        if (mentorship) {
          mentorship.sessionsCompleted += 1;
          mentorship.progress = Math.round(
            (mentorship.sessionsCompleted / mentorship.totalSessions) * 100,
          );
          await mentorship.save();
        }
      }
    }

    await session.save();

    res.json({
      msg: "Session confirmed",
      completionVerified: session.completionVerified,
      session: await session.populate([
        { path: "mentorId", select: "name email" },
        { path: "menteeId", select: "name email" },
      ]),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Cancel session
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) return res.status(404).json({ msg: "Session not found" });

    if (
      session.mentorId.toString() !== req.userId &&
      session.menteeId.toString() !== req.userId
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    session.status = "CANCELLED";
    await session.save();

    res.json({ msg: "Session cancelled", session });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
