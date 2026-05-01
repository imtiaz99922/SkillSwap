const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const DemoQuiz = require("../models/DemoQuiz");
const Course = require("../models/Course");
const User = require("../models/User");

// POST /api/demo-quizzes - Create a demo quiz for a course
router.post("/", auth, async (req, res) => {
  try {
    const { courseId, title, description, questions, passingScore, timeLimit } =
      req.body;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({ msg: "Course ID is required" });
    }

    // Verify course exists and user is instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    if (course.instructorId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ msg: "Access denied. Only instructor can add quiz" });
    }

    // Validate title
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ msg: "Quiz title is required" });
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ msg: "At least one question is required" });
    }

    // Create demo quiz
    const demoQuiz = new DemoQuiz({
      courseId,
      instructorId: req.userId,
      title: title.trim(),
      description: description ? description.trim() : null,
      questions: questions.map((q, index) => ({
        ...q,
        id: q.id || `question-${index + 1}`,
        order: index,
      })),
      passingScore: passingScore || 70,
      timeLimit: timeLimit || null,
    });

    await demoQuiz.save();

    res.status(201).json({
      msg: "Demo quiz created successfully",
      demoQuiz,
    });
  } catch (err) {
    console.error("Error creating demo quiz:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/demo-quizzes - Get all demo quizzes (for listing)
router.get("/", async (req, res) => {
  try {
    const demoQuizzes = await DemoQuiz.find({ isPublished: true })
      .populate("courseId", "title")
      .populate("instructorId", "name")
      .sort({ createdAt: -1 });

    res.json({ demoQuizzes });
  } catch (err) {
    console.error("Error fetching demo quizzes:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/demo-quizzes/course/:courseId - Get demo quiz for a specific course
router.get("/course/:courseId", async (req, res) => {
  try {
    const demoQuiz = await DemoQuiz.findOne({
      courseId: req.params.courseId,
      isPublished: true,
    });

    if (!demoQuiz) {
      return res
        .status(404)
        .json({ msg: "Demo quiz not found for this course" });
    }

    res.json({ demoQuiz });
  } catch (err) {
    console.error("Error fetching demo quiz:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/demo-quizzes/:id - Get single demo quiz
router.get("/:id", async (req, res) => {
  try {
    const demoQuiz = await DemoQuiz.findById(req.params.id).populate(
      "instructorId",
      "name",
    );

    if (!demoQuiz) {
      return res.status(404).json({ msg: "Demo quiz not found" });
    }

    res.json({ demoQuiz });
  } catch (err) {
    console.error("Error fetching demo quiz:", err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Demo quiz not found" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/demo-quizzes/:id - Update demo quiz (instructor only)
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, questions, passingScore, timeLimit } = req.body;

    const demoQuiz = await DemoQuiz.findById(req.params.id);

    if (!demoQuiz) {
      return res.status(404).json({ msg: "Demo quiz not found" });
    }

    // Only instructor can update
    if (demoQuiz.instructorId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (title) demoQuiz.title = title.trim();
    if (description !== undefined)
      demoQuiz.description = description ? description.trim() : null;
    if (questions)
      demoQuiz.questions = questions.map((q, index) => ({
        ...q,
        id: q.id || `question-${index + 1}`,
        order: index,
      }));
    if (passingScore !== undefined) demoQuiz.passingScore = passingScore;
    if (timeLimit !== undefined) demoQuiz.timeLimit = timeLimit;

    await demoQuiz.save();

    res.json({
      msg: "Demo quiz updated successfully",
      demoQuiz,
    });
  } catch (err) {
    console.error("Error updating demo quiz:", err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Demo quiz not found" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/demo-quizzes/:id - Delete demo quiz (instructor only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const demoQuiz = await DemoQuiz.findById(req.params.id);

    if (!demoQuiz) {
      return res.status(404).json({ msg: "Demo quiz not found" });
    }

    // Only instructor can delete
    if (demoQuiz.instructorId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    await DemoQuiz.findByIdAndDelete(req.params.id);

    res.json({ msg: "Demo quiz deleted successfully" });
  } catch (err) {
    console.error("Error deleting demo quiz:", err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Demo quiz not found" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
