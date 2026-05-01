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
const CourseEnrollment = require("../models/CourseEnrollment");

const DEFAULT_BADGES = [
  {
    name: "Conqueror",
    description:
      "Awarded to the learner with the highest total course count across all levels.",
    icon: "👑",
    category: "ACHIEVEMENT",
    criteria: { type: "CUSTOM", value: 0 },
  },
  {
    name: "Silver",
    description: "Top learner in beginner course completions.",
    icon: "🥈",
    category: "ACHIEVEMENT",
    criteria: { type: "CUSTOM", value: 0 },
  },
  {
    name: "Gold",
    description: "Top learner in intermediate course completions.",
    icon: "🥇",
    category: "ACHIEVEMENT",
    criteria: { type: "CUSTOM", value: 0 },
  },
  {
    name: "Ace",
    description: "Top learner in advanced course completions.",
    icon: "🅰️",
    category: "ACHIEVEMENT",
    criteria: { type: "CUSTOM", value: 0 },
  },
  {
    name: "Bronze",
    description:
      "Primary badge awarded to every learner who is not a top tier badge winner.",
    icon: "🥉",
    category: "ACHIEVEMENT",
    criteria: { type: "CUSTOM", value: 0 },
  },
];

const ensureDefaultBadges = async () => {
  const existingBadges = await Badge.find({
    name: { $in: DEFAULT_BADGES.map((badge) => badge.name) },
  });

  const existingNames = existingBadges.map((badge) => badge.name);
  const missingBadges = DEFAULT_BADGES.filter(
    (badge) => !existingNames.includes(badge.name),
  );

  if (missingBadges.length > 0) {
    await Badge.insertMany(missingBadges);
  }

  return await Badge.find({
    name: { $in: DEFAULT_BADGES.map((badge) => badge.name) },
  });
};

const buildUserCourseStats = async () => {
  const courseStats = await CourseEnrollment.aggregate([
    { $match: { paymentStatus: "completed" } },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $group: {
        _id: "$userId",
        totalCourses: { $sum: 1 },
        beginnerCourses: {
          $sum: {
            $cond: [{ $eq: ["$course.level", "beginner"] }, 1, 0],
          },
        },
        intermediateCourses: {
          $sum: {
            $cond: [{ $eq: ["$course.level", "intermediate"] }, 1, 0],
          },
        },
        advancedCourses: {
          $sum: {
            $cond: [{ $eq: ["$course.level", "advanced"] }, 1, 0],
          },
        },
      },
    },
  ]);

  return courseStats.reduce((acc, courseStat) => {
    acc[courseStat._id.toString()] = courseStat;
    return acc;
  }, {});
};

const sortUsersByMetric = (users, metric) =>
  [...users].sort((a, b) => {
    if (b[metric] !== a[metric]) return b[metric] - a[metric];
    if (b.totalCourses !== a.totalCourses)
      return b.totalCourses - a.totalCourses;
    return a.name.localeCompare(b.name);
  });

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
    const badges = await ensureDefaultBadges();
    res.json(badges.sort((a, b) => a.category.localeCompare(b.category)));
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get badge winners for leaderboard categories
router.get("/badge-winners", async (req, res) => {
  try {
    const users = await User.find().select("name email");
    const badges = await ensureDefaultBadges();
    const badgeMap = badges.reduce((map, badge) => {
      map[badge.name] = badge;
      return map;
    }, {});

    const statsByUser = await buildUserCourseStats();
    const userStats = users.map((user) => ({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      totalCourses: statsByUser[user._id.toString()]?.totalCourses || 0,
      beginnerCourses: statsByUser[user._id.toString()]?.beginnerCourses || 0,
      intermediateCourses:
        statsByUser[user._id.toString()]?.intermediateCourses || 0,
      advancedCourses: statsByUser[user._id.toString()]?.advancedCourses || 0,
    }));

    const conqueror = sortUsersByMetric(userStats, "totalCourses")[0] || null;
    const silver = sortUsersByMetric(userStats, "beginnerCourses")[0] || null;
    const gold = sortUsersByMetric(userStats, "intermediateCourses")[0] || null;
    const ace = sortUsersByMetric(userStats, "advancedCourses")[0] || null;

    const winnerIds = new Set(
      [conqueror, silver, gold, ace]
        .filter(Boolean)
        .map((winner) => winner.userId),
    );

    const bronzeUsers = userStats.filter((user) => !winnerIds.has(user.userId));

    res.json({
      badgeWinners: [
        {
          badge: badgeMap.Conqueror,
          user: conqueror,
          count: conqueror?.totalCourses || 0,
          metric: "Total Courses",
        },
        {
          badge: badgeMap.Silver,
          user: silver,
          count: silver?.beginnerCourses || 0,
          metric: "Beginner Courses",
        },
        {
          badge: badgeMap.Gold,
          user: gold,
          count: gold?.intermediateCourses || 0,
          metric: "Intermediate Courses",
        },
        {
          badge: badgeMap.Ace,
          user: ace,
          count: ace?.advancedCourses || 0,
          metric: "Advanced Courses",
        },
      ],
      bronze: {
        badge: badgeMap.Bronze,
        userCount: bronzeUsers.length,
        users: bronzeUsers.map((user) => ({
          userId: user.userId,
          name: user.name,
          email: user.email,
        })),
      },
    });
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

// Auto-award badges based on course completion winners (can be called periodically)
router.post("/auto-award", auth, async (req, res) => {
  try {
    const badges = await ensureDefaultBadges();
    const badgeMap = badges.reduce((map, badge) => {
      map[badge.name] = badge;
      return map;
    }, {});

    const users = await User.find().select("name email");
    const statsByUser = await buildUserCourseStats();

    const userStats = users.map((user) => ({
      _id: user._id,
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      totalCourses: statsByUser[user._id.toString()]?.totalCourses || 0,
      beginnerCourses: statsByUser[user._id.toString()]?.beginnerCourses || 0,
      intermediateCourses:
        statsByUser[user._id.toString()]?.intermediateCourses || 0,
      advancedCourses: statsByUser[user._id.toString()]?.advancedCourses || 0,
    }));

    const conqueror = sortUsersByMetric(userStats, "totalCourses")[0];
    const silver = sortUsersByMetric(userStats, "beginnerCourses")[0];
    const gold = sortUsersByMetric(userStats, "intermediateCourses")[0];
    const ace = sortUsersByMetric(userStats, "advancedCourses")[0];

    const winnerIds = new Set(
      [conqueror, silver, gold, ace]
        .filter(Boolean)
        .map((winner) => winner.userId),
    );

    const badgeIds = [
      badgeMap.Conqueror._id,
      badgeMap.Silver._id,
      badgeMap.Gold._id,
      badgeMap.Ace._id,
      badgeMap.Bronze._id,
    ];

    await UserBadge.deleteMany({ badgeId: { $in: badgeIds } });

    const awardEntries = [];
    if (conqueror) {
      awardEntries.push({
        userId: conqueror._id,
        badgeId: badgeMap.Conqueror._id,
      });
    }
    if (silver) {
      awardEntries.push({ userId: silver._id, badgeId: badgeMap.Silver._id });
    }
    if (gold) {
      awardEntries.push({ userId: gold._id, badgeId: badgeMap.Gold._id });
    }
    if (ace) {
      awardEntries.push({ userId: ace._id, badgeId: badgeMap.Ace._id });
    }

    users
      .filter((user) => !winnerIds.has(user._id.toString()))
      .forEach((user) => {
        awardEntries.push({ userId: user._id, badgeId: badgeMap.Bronze._id });
      });

    if (awardEntries.length > 0) {
      await UserBadge.insertMany(awardEntries);
    }

    res.json({
      msg: `Awarded ${awardEntries.length} badges`,
      winners: {
        conqueror: conqueror?.userId,
        silver: silver?.userId,
        gold: gold?.userId,
        ace: ace?.userId,
      },
      bronzeCount: users.filter((user) => !winnerIds.has(user._id.toString()))
        .length,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
