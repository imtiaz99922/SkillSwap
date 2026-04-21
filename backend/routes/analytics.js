const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const ChallengeAttempt = require("../models/ChallengeAttempt");
const Session = require("../models/Session");

// GET /api/analytics   requires auth
router.get("/", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    // summary statistics
    const stats = await ChallengeAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
          passCount: { $sum: { $cond: ["$passed", 1, 0] } },
          totalCredits: { $sum: "$creditsEarned" },
        },
      },
    ]);

    const summaryRaw = stats[0] || {
      totalAttempts: 0,
      avgScore: 0,
      passCount: 0,
      totalCredits: 0,
    };
    const totalAttempts = summaryRaw.totalAttempts;
    const avgScore = summaryRaw.avgScore || 0;
    const passRate = totalAttempts
      ? (summaryRaw.passCount / totalAttempts) * 100
      : 0;
    const totalCredits = summaryRaw.totalCredits;

    // data over the last 30 days
    const now = new Date();
    const since = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

    const attemptsOverTime = await ChallengeAttempt.aggregate([
      { $match: { userId, completedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const sessionsOverTime = await Session.aggregate([
      { $match: { userId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      summary: {
        totalAttempts,
        avgScore,
        passRate,
        totalCredits,
      },
      attemptsOverTime,
      sessionsOverTime,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
