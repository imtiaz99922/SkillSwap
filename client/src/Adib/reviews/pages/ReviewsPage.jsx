import React, { useState, useEffect } from "react";
import ReviewForm from "../components/ReviewForm";
import ReviewsList from "../components/ReviewsList";
import { reviewApi } from "../services/reviewApi";
import { useParams } from "react-router-dom";
import "../../../styles/ModernDesign.css";

export default function ReviewsPage() {
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchReviews();
    }
  }, [userId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getReviewsForUser(userId);
      setReviews(data || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (targetId, rating, comment) => {
    try {
      setSubmitting(true);
      setError("");
      await reviewApi.createReview(targetId, rating, comment);
      fetchReviews();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError(err?.response?.data?.msg || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feature-page">
      <div className="section-header">
        <div>
          <h1 className="section-title">⭐ Reviews</h1>
          <p className="section-copy">
            Read and submit reviews for peers, tutors, and mentors.
          </p>
        </div>
      </div>

      {error && <div className="field-error">{error}</div>}

      <div className="card-grid">
        <div className="card">
          <ReviewForm
            targetUserId={userId}
            onSubmit={handleSubmitReview}
            loading={submitting}
          />
        </div>
        <div className="card">
          <ReviewsList reviews={reviews} loading={loading} />
        </div>
      </div>
    </div>
  );
}
