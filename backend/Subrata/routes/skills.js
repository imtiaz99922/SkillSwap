const express = require("express");
const router = express.Router();
const Skill = require("../models/Skill");
const auth = require("../middleware/auth");

// Validation middleware
const validateSkill = (req, res, next) => {
  const { title, type, level } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ msg: "Title is required" });
  }

  if (title.length > 150) {
    return res
      .status(400)
      .json({ msg: "Title must be 150 characters or less" });
  }

  if (!["teach", "learn"].includes(type)) {
    return res
      .status(400)
      .json({ msg: 'Type must be either "teach" or "learn"' });
  }

  if (!["beginner", "intermediate", "advanced"].includes(level)) {
    return res
      .status(400)
      .json({ msg: "Level must be beginner, intermediate, or advanced" });
  }

  if (req.body.category && req.body.category.length > 80) {
    return res
      .status(400)
      .json({ msg: "Category must be 80 characters or less" });
  }

  next();
};

// All routes require authentication
router.use(auth);

// GET /api/skills/me - List my skills
router.get("/me", async (req, res) => {
  try {
    const skills = await Skill.find({
      userId: req.userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({ skills });
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/skills - Create a skill
router.post("/", validateSkill, async (req, res) => {
  try {
    const { title, description, category, type, level, tags } = req.body;

    const skill = new Skill({
      userId: req.userId,
      title: title.trim(),
      description: description ? description.trim() : "",
      category: category ? category.trim() : "",
      type,
      level,
      tags: tags || [],
    });

    await skill.save();

    res.status(201).json({ skill });
  } catch (err) {
    console.error("Error creating skill:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/skills/:id - Get single skill
router.get("/:id", async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    // Users can only view their own skills
    if (skill.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json({ skill });
  } catch (err) {
    console.error("Error fetching skill:", err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Skill not found" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/skills/:id - Update skill (owner only)
router.put("/:id", validateSkill, async (req, res) => {
  try {
    const { title, description, category, type, level, tags } = req.body;

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    // Only owner can update
    if (skill.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    skill.title = title.trim();
    skill.description = description ? description.trim() : "";
    skill.category = category ? category.trim() : "";
    skill.type = type;
    skill.level = level;
    skill.tags = tags || [];

    await skill.save();

    res.json({ skill });
  } catch (err) {
    console.error("Error updating skill:", err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Skill not found" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/skills/:id - Soft delete skill (owner only)
router.delete("/:id", async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: "Skill not found" });
    }

    // Only owner can delete
    if (skill.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    skill.isActive = false;
    await skill.save();

    res.json({ msg: "Skill deleted successfully" });
  } catch (err) {
    console.error("Error deleting skill:", err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Skill not found" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
