const mongoose = require("mongoose");

const DemoQuizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    questions: [
      {
        id: {
          type: String,
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["multipleChoice", "trueFalse", "shortAnswer"],
          required: true,
        },
        options: [
          {
            text: String,
            isCorrect: Boolean,
          },
        ],
        correctAnswer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          default: null,
        },
        order: Number,
      },
    ],
    passingScore: {
      type: Number,
      default: 70, // percentage
      min: 0,
      max: 100,
    },
    timeLimit: {
      type: Number,
      default: null, // in minutes, null = no limit
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    showCorrectAnswersAfter: {
      type: Boolean,
      default: true, // show correct answers after completion
    },
    allowRetakes: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    attempts: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        score: Number,
        percentage: Number,
        passedAt: Date,
        answers: [
          {
            questionId: String,
            selectedAnswer: String,
            isCorrect: Boolean,
          },
        ],
        completedAt: Date,
        timeSpent: Number, // in seconds
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
DemoQuizSchema.index({ courseId: 1 });
DemoQuizSchema.index({ instructorId: 1 });
DemoQuizSchema.index({ isPublished: 1 });

module.exports = mongoose.model("DemoQuiz", DemoQuizSchema);
