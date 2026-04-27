const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Recommendation = require("../models/Recommendation");
const Skill = require("../models/Skill");
const User = require("../models/User");
const mongoose = require("mongoose");

// Get recommendations for current user
router.get("/", auth, async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ userId: req.userId })
      .populate("recommendedSkillId")
      .populate("recommendedUserId", "name email")
      .sort({ createdAt: -1 });

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Generate recommendations based on user profile
router.post("/generate", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Get user's skills
    const userSkills = await Skill.find({ userId: req.userId, isActive: true });
    if (userSkills.length === 0) {
      return res
        .status(400)
        .json({ msg: "Add skills first to get recommendations" });
    }

    // Get similar skills from other users
    const categories = userSkills.map((s) => s.category);
    const similarSkills = await Skill.find({
      category: { $in: categories },
      userId: { $ne: req.userId },
      isActive: true,
      verified: true,
    }).limit(10);

    // Create recommendations
    const newRecommendations = [];
    for (const skill of similarSkills) {
      const exists = await Recommendation.findOne({
        userId: req.userId,
        recommendedSkillId: skill._id,
      });

      if (!exists) {
        const recommendation = new Recommendation({
          userId: req.userId,
          recommendedSkillId: skill._id,
          recommendedUserId: skill.userId,
          reason: "SKILL_MATCH",
          score: 75,
        });
        await recommendation.save();
        newRecommendations.push(recommendation);
      }
    }

    res.json({
      msg: `Generated ${newRecommendations.length} recommendations`,
      recommendations: newRecommendations,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Mark recommendation as viewed
router.put("/:id/view", auth, async (req, res) => {
  try {
    const recommendation = await Recommendation.findByIdAndUpdate(
      req.params.id,
      { viewed: true },
      { new: true },
    );

    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Accept a recommendation
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const recommendation = await Recommendation.findByIdAndUpdate(
      req.params.id,
      { accepted: true, viewed: true },
      { new: true },
    );

    res.json({ msg: "Recommendation accepted", recommendation });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete recommendation
router.delete("/:id", auth, async (req, res) => {
  try {
    await Recommendation.findByIdAndDelete(req.params.id);
    res.json({ msg: "Recommendation deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
