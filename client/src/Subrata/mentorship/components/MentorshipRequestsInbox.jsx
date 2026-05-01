import React, { useState, useEffect } from "react";
import { mentorshipApi } from "../services/mentorshipApi";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaClock,
} from "react-icons/fa";

export default function MentorshipRequestsInbox() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const data = await mentorshipApi.getPendingRequests();
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch requests");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      await mentorshipApi.acceptMentorship(id);
      setMessage("✅ Mentorship request accepted!");
      setTimeout(() => {
        fetchPendingRequests();
        setMessage("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await mentorshipApi.rejectMentorship(id);
      setMessage(
        "❌ Mentorship request rejected. 24-hour message block activated.",
      );
      setTimeout(() => {
        fetchPendingRequests();
        setMessage("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "1.5rem" }}>
        📬 Mentorship Requests
      </h2>

      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            background:
              message.includes("✅") || message.includes("❌")
                ? "#d4edda"
                : "#fff3cd",
            color:
              message.includes("✅") || message.includes("❌")
                ? "#155724"
                : "#856404",
            border: "1px solid",
            borderColor:
              message.includes("✅") || message.includes("❌")
                ? "#c3e6cb"
                : "#ffeaa7",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            background: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <FaSpinner
            style={{
              fontSize: "2.5rem",
              color: "#667eea",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <FaClock
            style={{ fontSize: "3rem", color: "#ccc", marginBottom: "15px" }}
          />
          <p style={{ color: "#999", marginBottom: 0 }}>
            No pending mentorship requests
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {requests.map((req) => (
            <div
              key={req._id}
              style={{
                padding: "16px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                background: "#fafafa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "1.1rem" }}>
                    {req.menteeId?.name}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    📧 {req.menteeId?.email}
                  </p>
                </div>
                <span
                  style={{
                    background: "#667eea",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                  }}
                >
                  {req.sessionCount} Sessions
                </span>
              </div>

              {req.courseId && (
                <p style={{ margin: "8px 0", color: "#555" }}>
                  📚 <strong>Course:</strong> {req.courseId.title}
                </p>
              )}

              {req.preferredTimeSlots && req.preferredTimeSlots.length > 0 && (
                <div style={{ margin: "8px 0" }}>
                  <strong>⏰ Preferred Times:</strong>
                  <div style={{ marginTop: "5px", color: "#666" }}>
                    {req.preferredTimeSlots.map((slot, idx) => (
                      <div key={idx} style={{ fontSize: "0.9rem" }}>
                        {slot.day}: {slot.startTime} - {slot.endTime}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p
                style={{ margin: "8px 0", color: "#999", fontSize: "0.85rem" }}
              >
                Requested: {new Date(req.createdAt).toLocaleDateString()}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                <button
                  onClick={() => handleAccept(req._id)}
                  disabled={processingId === req._id}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor:
                      processingId === req._id ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    opacity: processingId === req._id ? 0.6 : 1,
                  }}
                >
                  {processingId === req._id ? (
                    <>
                      <FaSpinner style={{ marginRight: "5px" }} /> Accepting...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle style={{ marginRight: "5px" }} /> Accept
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  disabled={processingId === req._id}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor:
                      processingId === req._id ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    opacity: processingId === req._id ? 0.6 : 1,
                  }}
                >
                  {processingId === req._id ? (
                    <>
                      <FaSpinner style={{ marginRight: "5px" }} /> Rejecting...
                    </>
                  ) : (
                    <>
                      <FaTimesCircle style={{ marginRight: "5px" }} /> Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
