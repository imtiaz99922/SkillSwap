const express = require("express");
const Review = require("../../models/Review");
const UserProfile = require("../../models/UserProfile");
const auth = require("../../middleware/auth");

const router = express.Router();

// POST /api/reviews - Create a new review
router.post("/", auth, async (req, res) => {
  const { targetUserId, sessionId, rating, comment } = req.body;

  if (!targetUserId || !rating || !comment) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ msg: "Rating must be between 1 and 5" });
  }

  try {
    // Check if user already reviewed this session
    if (sessionId) {
      const existingReview = await Review.findOne({
        reviewerId: req.userId,
        sessionId: sessionId,
      });
      if (existingReview) {
        return res
          .status(400)
          .json({ msg: "You have already reviewed this session" });
      }
    }

    // Create the review
    const review = new Review({
      reviewerId: req.userId,
      targetUserId,
      sessionId,
      rating,
      comment,
    });

    await review.save();

    // Update the target user's profile with new average rating
    await updateUserRating(targetUserId);

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/reviews/user/:userId - Get reviews for a user
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ targetUserId: req.params.userId })
      .populate("reviewerId", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/reviews/my-reviews - Get reviews written by current user
router.get("/my-reviews", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerId: req.userId })
      .populate("targetUserId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching my reviews:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Helper function to update user's average rating
async function updateUserRating(userId) {
  try {
    const reviews = await Review.find({ targetUserId: userId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await UserProfile.findOneAndUpdate(
      { userId },
      {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length,
      },
      { upsert: true },
    );
  } catch (error) {
    console.error("Error updating user rating:", error);
  }
}

module.exports = router;
