const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Badge, UserBadge } = require("../models/Badge");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const Review = require("../models/Review");
const Mentorship = require("../models/Mentorship");
const Skill = require("../models/Skill");
const Wallet = require("../models/Wallet");

// Get leaderboard (top users by rating/skills)
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().select("name email createdAt");

    // Get stats for each user
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const profile = await UserProfile.findOne({ userId: user._id });
        const skills = await Skill.countDocuments({
          userId: user._id,
          isActive: true,
        });
        const reviews = await Review.find({ revieweeId: user._id });
        const mentorships = await Mentorship.countDocuments({
          mentorId: user._id,
          status: "COMPLETED",
        });
        const wallet = await Wallet.findOne({ userId: user._id });

        const avgRating =
          reviews.length > 0
            ? (
                reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              ).toFixed(2)
            : 0;

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          avatar: profile?.avatar,
          rating: parseFloat(avgRating),
          skills,
          mentorships,
          credits: wallet?.credits || 0,
          reviewCount: reviews.length,
        };
      }),
    );

    // Sort by rating then by skills count
    leaderboard.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.skills - a.skills;
    });

    res.json(leaderboard.slice(0, 50)); // Top 50
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get user's rank
router.get("/user-rank/:userId", async (req, res) => {
  try {
    const users = await User.find().select("_id");

    const ranks = await Promise.all(
      users.map(async (user) => {
        const reviews = await Review.find({ revieweeId: user._id });
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        const skills = await Skill.countDocuments({
          userId: user._id,
          isActive: true,
        });

        return { userId: user._id, rating: avgRating, skills };
      }),
    );

    ranks.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.skills - a.skills;
    });

    const userRank = ranks.findIndex(
      (r) => r.userId.toString() === req.params.userId,
    );

    res.json({ rank: userRank + 1, totalUsers: ranks.length });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all badges
router.get("/badges", async (req, res) => {
  try {
    const badges = await Badge.find().sort({ category: 1 });
    res.json(badges);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get user's badges
router.get("/badges/:userId", async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ userId: req.params.userId })
      .populate("badgeId")
      .sort({ earnedAt: -1 });

    res.json(userBadges);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Award badge to user (internal - called by other routes)
router.post("/award-badge", auth, async (req, res) => {
  try {
    const { userId, badgeId } = req.body;

    const badge = await Badge.findById(badgeId);
    if (!badge) return res.status(404).json({ msg: "Badge not found" });

    // Check if user already has this badge
    const exists = await UserBadge.findOne({ userId, badgeId });
    if (exists) {
      return res.status(400).json({ msg: "User already has this badge" });
    }

    const userBadge = new UserBadge({ userId, badgeId });
    await userBadge.save();

    res.json({ msg: "Badge awarded", userBadge });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Auto-award badges based on criteria (can be called periodically)
router.post("/auto-award", auth, async (req, res) => {
  try {
    const badges = await Badge.find();
    const users = await User.find();
    let awarded = 0;

    for (const user of users) {
      for (const badge of badges) {
        // Check if user already has badge
        const exists = await UserBadge.findOne({
          userId: user._id,
          badgeId: badge._id,
        });
        if (exists) continue;

        let qualifies = false;

        // Check criteria
        switch (badge.criteria.type) {
          case "SKILL_COUNT": {
            const skillCount = await Skill.countDocuments({
              userId: user._id,
              isActive: true,
            });
            qualifies = skillCount >= badge.criteria.value;
            break;
          }
          case "MENTORSHIP": {
            const mentorshipCount = await Mentorship.countDocuments({
              mentorId: user._id,
              status: "COMPLETED",
            });
            qualifies = mentorshipCount >= badge.criteria.value;
            break;
          }
          case "RATING": {
            const reviews = await Review.find({ revieweeId: user._id });
            if (reviews.length > 0) {
              const avgRating =
                reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
              qualifies = avgRating >= badge.criteria.value;
            }
            break;
          }
        }

        if (qualifies) {
          const userBadge = new UserBadge({
            userId: user._id,
            badgeId: badge._id,
          });
          await userBadge.save();
          awarded++;
        }
      }
    }

    res.json({ msg: `Awarded ${awarded} badges` });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
