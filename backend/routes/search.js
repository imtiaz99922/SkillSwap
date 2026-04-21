const express = require("express");
const router = express.Router();
const Skill = require("../models/Skill");

// GET /api/search/skills - Search or list all skills
router.get("/skills", async (req, res) => {
  try {
    const { q } = req.query;

    let query = { isActive: true };

    if (q) {
      // Search by title, description, category, or tags
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const skills = await Skill.find(query).sort({ createdAt: -1 }).limit(100);

    res.json(skills);
  } catch (err) {
    console.error("Error searching skills:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/search/skills/:id - Get single skill detail
router.get("/skills/:id", async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    res.json({ skill });
  } catch (err) {
    console.error("Error fetching skill:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
