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
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ marginBottom: "24px", fontSize: "28px", fontWeight: "700" }}>
        ⭐ Reviews
      </h1>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        <ReviewForm
          targetUserId={userId}
          onSubmit={handleSubmitReview}
          loading={submitting}
        />
        <ReviewsList reviews={reviews} loading={loading} />
      </div>
    </div>
  );
}
