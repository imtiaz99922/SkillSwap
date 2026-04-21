import React from "react";
import { FaStar } from "react-icons/fa";

export default function ReviewsList({ reviews, loading }) {
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "24px",
          color: "#9ca3af",
        }}
      >
        Loading reviews...
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid #e5e7eb",
          fontWeight: "600",
          fontSize: "18px",
        }}
      >
        Reviews
      </div>

      {reviews && reviews.length > 0 ? (
        <div>
          {reviews.map((review) => (
            <div
              key={review._id}
              style={{
                padding: "16px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header with rating */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div style={{ fontWeight: "600" }}>{review.reviewerName}</div>
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={16}
                      color={i < review.rating ? "#fbbf24" : "#d1d5db"}
                    />
                  ))}
                  <span
                    style={{
                      marginLeft: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {review.rating}/5
                  </span>
                </div>
              </div>

              {/* Comment */}
              <p
                style={{
                  color: "#4b5563",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "8px 0",
                }}
              >
                {review.comment}
              </p>

              {/* Date */}
              <div
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  marginTop: "8px",
                }}
              >
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "#9ca3af",
          }}
        >
          No reviews yet
        </div>
      )}
    </div>
  );
}
