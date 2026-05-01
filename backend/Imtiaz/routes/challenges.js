const express = require("express");
const router = express.Router();
const Challenge = require("../models/Challenge");
const ChallengeAttempt = require("../models/ChallengeAttempt");
const Wallet = require("../models/Wallet");
const auth = require("../middleware/auth");

// GET /api/challenges - Get all challenges
router.get("/", async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.json({ challenges });
  } catch (err) {
    console.error("Error fetching challenges:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/challenges/:id - Get single challenge
router.get("/:id", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ msg: "Challenge not found" });
    }
    res.json({ challenge });
  } catch (err) {
    console.error("Error fetching challenge:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/challenges - Create a challenge (protected)
router.post("/", auth, async (req, res) => {
  try {
    const {
      skillId,
      skillName,
      title,
      description,
      difficulty,
      questions,
      passingScore,
      creditsReward,
    } = req.body;

    if (!skillId || !skillName || !title) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ msg: "At least one question is required" });
    }

    const challenge = new Challenge({
      skillId,
      skillName,
      title,
      description,
      difficulty,
      questions,
      passingScore: passingScore || 70,
      creditsReward: creditsReward || 10,
    });

    await challenge.save();
    res.status(201).json({ challenge });
  } catch (err) {
    console.error("Error creating challenge:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/challenges/:id/submit - Submit challenge answers (protected)
router.post("/:id/submit", auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const challengeId = req.params.id;
    const userId = req.userId;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ msg: "Challenge not found" });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ msg: "Answers are required" });
    }

    // Calculate score
    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = challenge.questions[index];
      const isCorrect =
        question && answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        correct: isCorrect,
      };
    });

    const score = Math.round((correctCount / challenge.questions.length) * 100);
    const passed = score >= challenge.passingScore;
    const creditsEarned = passed ? challenge.creditsReward : 0;

    // Save attempt
    const attempt = new ChallengeAttempt({
      userId,
      challengeId,
      skillId: challenge.skillId,
      score,
      passed,
      creditsEarned,
      answers: processedAnswers,
    });

    await attempt.save();

    // Update wallet if passed
    if (passed) {
      try {
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
          wallet = new Wallet({
            userId,
            credits: creditsEarned,
            totalEarned: creditsEarned,
          });
        } else {
          wallet.credits += creditsEarned;
          wallet.totalEarned += creditsEarned;
        }
        await wallet.save();
      } catch (walletErr) {
        console.error("Error updating wallet:", walletErr);
      }
    }

    res.json({
      attempt,
      score,
      passed,
      creditsEarned,
      message: passed
        ? "Challenge passed! Credits earned!"
        : "Challenge failed. Try again!",
    });
  } catch (err) {
    console.error("Error submitting challenge:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/challenges/:id/attempts - Get user's attempts for a challenge (protected)
router.get("/:id/attempts", auth, async (req, res) => {
  try {
    const attempts = await ChallengeAttempt.find({
      userId: req.userId,
      challengeId: req.params.id,
    }).sort({ completedAt: -1 });

    res.json({ attempts });
  } catch (err) {
    console.error("Error fetching attempts:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
