const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const CourseContent = require("../models/CourseContent");
const DemoQuiz = require("../models/DemoQuiz");
const CourseEnrollment = require("../models/CourseEnrollment");
const Course = require("../models/Course");
const Notification = require("../models/Notification");

// Create course content (instructor only)
router.post("/:courseId/content", auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      contentType,
      content,
      description,
      duration,
      fileSize,
      fileType,
      order,
      section,
      isRequired,
      isPreviewable,
      thumbnail,
      accessLevel,
    } = req.body;

    // Verify course exists and user is instructor
    const course = await Course.findOne({
      _id: courseId,
      instructorId: req.user.id,
    });
    if (!course) {
      return res
        .status(403)
        .json({
          message: "Unauthorized. Only course instructor can add content.",
        });
    }

    const courseContent = new CourseContent({
      courseId,
      instructorId: req.user.id,
      title,
      contentType,
      content,
      description,
      duration,
      fileSize,
      fileType,
      order,
      section,
      isRequired,
      isPreviewable,
      thumbnail,
      accessLevel,
    });

    await courseContent.save();

    res.status(201).json({
      message: "Content added successfully",
      content: courseContent,
    });
  } catch (error) {
    console.error("Error adding content:", error);
    res
      .status(500)
      .json({ message: "Error adding content", error: error.message });
  }
});

// Get course content (organized by section)
router.get("/:courseId/content/organized", auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify access
    const enrollment = await CourseEnrollment.findOne({
      userId: req.user.id,
      courseId,
      paymentStatus: "completed",
    });

    const course = await Course.findOne({
      _id: courseId,
      instructorId: req.user.id,
    });

    if (!enrollment && !course) {
      return res
        .status(403)
        .json({
          message: "Access denied. You must be enrolled or instructor.",
        });
    }

    // Get all content
    const contents = await CourseContent.find({ courseId }).sort({
      section: 1,
      order: 1,
    });

    // Organize by section
    const organizedContent = {};
    contents.forEach((content) => {
      if (!organizedContent[content.section]) {
        organizedContent[content.section] = [];
      }
      organizedContent[content.section].push(content);
    });

    res.json(organizedContent);
  } catch (error) {
    console.error("Error fetching organized content:", error);
    res
      .status(500)
      .json({ message: "Error fetching content", error: error.message });
  }
});

// Mark content as viewed
router.post("/:contentId/viewed", auth, async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await CourseContent.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Check enrollment
    const enrollment = await CourseEnrollment.findOne({
      userId: req.user.id,
      courseId: content.courseId,
      paymentStatus: "completed",
    });

    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled in course" });
    }

    // Update progress
    const existingProgress = content.userProgress.findIndex(
      (p) => p.userId.toString() === req.user.id,
    );

    if (existingProgress >= 0) {
      content.userProgress[existingProgress].viewed = true;
      content.userProgress[existingProgress].completedAt = new Date();
    } else {
      content.userProgress.push({
        userId: req.user.id,
        viewed: true,
        completedAt: new Date(),
      });
    }

    await content.save();

    // Update enrollment progress
    const courseContents = await CourseContent.find({
      courseId: content.courseId,
    });
    const viewedCount = courseContents.filter((c) =>
      c.userProgress.some(
        (p) => p.userId.toString() === req.user.id && p.viewed,
      ),
    ).length;

    const progressPercentage = Math.floor(
      (viewedCount / courseContents.length) * 100,
    );

    await CourseEnrollment.updateOne(
      { _id: enrollment._id },
      {
        progressPercentage,
        lastAccessedAt: new Date(),
      },
    );

    res.json({
      message: "Content marked as viewed",
      progress: progressPercentage,
    });
  } catch (error) {
    console.error("Error updating content view:", error);
    res
      .status(500)
      .json({ message: "Error updating content", error: error.message });
  }
});

// Create demo quiz (instructor only)
router.post("/:courseId/demo-quiz", auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      questions,
      passingScore,
      timeLimit,
      shuffleQuestions,
      showCorrectAnswersAfter,
      allowRetakes,
    } = req.body;

    // Verify course exists and user is instructor
    const course = await Course.findOne({
      _id: courseId,
      instructorId: req.user.id,
    });
    if (!course) {
      return res
        .status(403)
        .json({
          message: "Unauthorized. Only course instructor can create quiz.",
        });
    }

    // Delete existing quiz if any
    await DemoQuiz.deleteOne({ courseId });

    const demoQuiz = new DemoQuiz({
      courseId,
      instructorId: req.user.id,
      title,
      description,
      questions: questions.map((q, index) => ({
        ...q,
        id: `q_${index + 1}`,
        order: index,
      })),
      passingScore: passingScore || 70,
      timeLimit,
      shuffleQuestions,
      showCorrectAnswersAfter,
      allowRetakes,
    });

    await demoQuiz.save();

    // Update course
    course.hasDemoQuiz = true;
    await course.save();

    res.status(201).json({
      message: "Demo quiz created successfully",
      quiz: demoQuiz,
    });
  } catch (error) {
    console.error("Error creating demo quiz:", error);
    res
      .status(500)
      .json({ message: "Error creating demo quiz", error: error.message });
  }
});

// Get demo quiz (public - anyone can take)
router.get("/:courseId/demo-quiz", async (req, res) => {
  try {
    const { courseId } = req.params;

    const quiz = await DemoQuiz.findOne({
      courseId,
      isPublished: true,
    });

    if (!quiz) {
      return res.status(404).json({ message: "Demo quiz not found" });
    }

    // Return quiz without answers if not authenticated or not instructor
    const isInstructor =
      req.user &&
      (await Course.findOne({ _id: courseId, instructorId: req.user.id }));

    if (!isInstructor) {
      // Remove correct answers and explanations
      const safeQuiz = {
        ...quiz.toObject(),
        questions: quiz.questions.map(
          ({ correctAnswer, explanation, ...q }) => q,
        ),
      };
      return res.json(safeQuiz);
    }

    res.json(quiz);
  } catch (error) {
    console.error("Error fetching demo quiz:", error);
    res
      .status(500)
      .json({ message: "Error fetching demo quiz", error: error.message });
  }
});

// Submit demo quiz attempt
router.post("/:courseId/demo-quiz/attempt", auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body;

    const quiz = await DemoQuiz.findOne({ courseId, isPublished: true });
    if (!quiz) {
      return res.status(404).json({ message: "Demo quiz not found" });
    }

    // Calculate score
    let correctCount = 0;
    const attempt = {
      userId: req.user.id,
      answers: answers.map((answer) => {
        const question = quiz.questions.find((q) => q.id === answer.questionId);
        const isCorrect =
          question && question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) correctCount++;

        return {
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
        };
      }),
      score: correctCount,
      percentage: Math.floor((correctCount / quiz.questions.length) * 100),
      completedAt: new Date(),
      timeSpent: answer.timeSpent || null,
    };

    attempt.passedAt =
      attempt.percentage >= quiz.passingScore ? new Date() : null;

    // Save attempt
    quiz.attempts.push(attempt);
    await quiz.save();

    // Prepare response
    const response = {
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.percentage >= quiz.passingScore,
      passingScore: quiz.passingScore,
    };

    // Include answers if quiz shows correct answers
    if (quiz.showCorrectAnswersAfter) {
      response.correctAnswers = quiz.questions.map(
        ({ id, correctAnswer, explanation }) => ({
          questionId: id,
          correctAnswer,
          explanation,
        }),
      );
    }

    // Create notification if passed
    if (response.passed) {
      await Notification.create({
        userId: req.user.id,
        type: "quiz_passed",
        message: `You passed the demo quiz for "${quiz.title}" with ${attempt.percentage}% score`,
        relatedId: courseId,
        relatedModel: "Course",
      });
    }

    res.json(response);
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res
      .status(500)
      .json({ message: "Error submitting quiz", error: error.message });
  }
});

// Get quiz attempts (instructor only)
router.get("/:courseId/demo-quiz/attempts", auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      instructorId: req.user.id,
    });
    if (!course) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const quiz = await DemoQuiz.findOne({ courseId }).populate(
      "attempts.userId",
      "name email",
    );

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({
      quiz: {
        title: quiz.title,
        totalAttempts: quiz.attempts.length,
        attempts: quiz.attempts,
      },
    });
  } catch (error) {
    console.error("Error fetching attempts:", error);
    res
      .status(500)
      .json({ message: "Error fetching attempts", error: error.message });
  }
});

module.exports = router;
