const mongoose = require('mongoose');

const ChallengeAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    default: false
  },
  creditsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    correct: Boolean
  }],
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChallengeAttempt', ChallengeAttemptSchema);
