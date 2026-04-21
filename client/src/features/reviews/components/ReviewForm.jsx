import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

export default function ReviewForm({ targetUserId, onSubmit, loading }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit(targetUserId, rating, comment);
      setComment("");
      setRating(5);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
      }}
    >
      <h3 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>
        Leave a Review
      </h3>

      {/* Star Rating */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
        >
          Rating
        </label>
        <div style={{ display: "flex", gap: "4px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={24}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                cursor: "pointer",
                color: star <= (hover || rating) ? "#fbbf24" : "#d1d5db",
                transition: "color 0.2s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
        >
          Your Review ({comment.length}/500)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          placeholder="Share your experience..."
          maxLength={500}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
            minHeight: "120px",
            outline: "none",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !comment.trim()}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: loading || !comment.trim() ? "#d1d5db" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: loading || !comment.trim() ? "not-allowed" : "pointer",
          fontWeight: "500",
        }}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
