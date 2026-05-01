import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { mentorshipApi } from "../services/mentorshipApi";
import MentorshipRequestsInbox from "../components/MentorshipRequestsInbox";
import MentorshipChatInterface from "../components/MentorshipChatInterface";
import MentorshipSlotBooking from "../components/MentorshipSlotBooking";
import ApplyMentorshipModal from "../components/ApplyMentorshipModal";
import {
  FaPlus,
  FaSpinner,
  FaComments,
  FaInbox,
  FaCheckCircle,
} from "react-icons/fa";

export default function MentorshipPage() {
  const [searchParams] = useSearchParams();
  const courseIdFromQuery = searchParams.get("courseId") || "";
  const [tab, setTab] = useState("active"); // "active" | "requests" | "apply"
  const [mentorships, setMentorships] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState("mentee"); // "mentor" or "mentee"

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (courseIdFromQuery) {
      setShowModal(true);
    }
  }, [courseIdFromQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch active mentorships
      const activeMentorships = await mentorshipApi.getActiveMentorships();
      setMentorships(activeMentorships);

      // Fetch pending requests (if mentor)
      try {
        const requests = await mentorshipApi.getPendingRequests();
        setPendingRequests(requests);
        if (requests.length > 0) {
          setUserRole("mentor");
        }
      } catch (err) {
        // User might be mentee only
      }

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (formData) => {
    try {
      await mentorshipApi.applyForMentorship(formData.courseId, {
        sessionCount: formData.sessionCount,
        preferredTimeSlots: formData.preferredTimeSlots,
      });
      setShowModal(false);
      setTimeout(() => {
        fetchData();
        setTab("active");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply for mentorship");
    }
  };

  return (
    <div className="feature-page">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              color: "white",
              marginTop: 0,
              marginBottom: "10px",
              fontSize: "2.5rem",
            }}
          >
            🎓 Mentorship
          </h1>
          <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
            Connect with mentors and build your skills
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "16px",
              background: "#f8d7da",
              color: "#721c24",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #f5c6cb",
            }}
          >
            {error}
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setTab("active")}
            style={{
              padding: "12px 24px",
              background: tab === "active" ? "white" : "rgba(255,255,255,0.2)",
              color: tab === "active" ? "#667eea" : "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaComments /> Active Mentorships ({mentorships.length})
          </button>

          {userRole === "mentor" && pendingRequests.length > 0 && (
            <button
              onClick={() => setTab("requests")}
              style={{
                padding: "12px 24px",
                background:
                  tab === "requests" ? "white" : "rgba(255,255,255,0.2)",
                color: tab === "requests" ? "#667eea" : "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FaInbox /> Requests ({pendingRequests.length})
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "auto",
            }}
          >
            <FaPlus /> Request Mentorship
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <FaSpinner
              style={{
                fontSize: "3rem",
                color: "white",
                animation: "spin 2s linear infinite",
              }}
            />
          </div>
        ) : (
          <>
            {/* Active Mentorships Tab */}
            {tab === "active" && (
              <div style={{ display: "grid", gap: "20px" }}>
                {mentorships.length === 0 ? (
                  <div
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "60px 20px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "1.1rem", color: "#999", margin: 0 }}>
                      No active mentorships yet
                    </p>
                  </div>
                ) : selectedMentorship ? (
                  <div>
                    <button
                      onClick={() => setSelectedMentorship(null)}
                      style={{
                        padding: "8px 16px",
                        background: "rgba(255,255,255,0.3)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        marginBottom: "15px",
                        fontWeight: "600",
                      }}
                    >
                      ← Back to List
                    </button>
                    <MentorshipChatInterface
                      mentorshipId={selectedMentorship._id}
                    />
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "15px" }}>
                    {mentorships.map((m) => (
                      <div
                        key={m._id}
                        style={{
                          background: "white",
                          borderRadius: "12px",
                          padding: "20px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        onClick={() => setSelectedMentorship(m)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0,0,0,0.1)";
                        }}
                      >
                        <div>
                          <h3
                            style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}
                          >
                            {m.mentorId.name ===
                            localStorage.getItem("userName")
                              ? m.menteeId.name
                              : m.mentorId.name}
                          </h3>
                          {m.courseId && (
                            <p style={{ margin: "0 0 8px 0", color: "#666" }}>
                              📚 {m.courseId.title}
                            </p>
                          )}
                          <div
                            style={{
                              display: "flex",
                              gap: "15px",
                              fontSize: "0.9rem",
                              color: "#999",
                            }}
                          >
                            <span>
                              Sessions: {m.completedSessions}/{m.sessionCount}
                            </span>
                            <span>Progress: {m.progress}%</span>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              textAlign: "center",
                              background: "#f5f5f5",
                              padding: "12px 20px",
                              borderRadius: "8px",
                            }}
                          >
                            <div
                              style={{ color: "#667eea", fontWeight: "600" }}
                            >
                              {m.completedSessions}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#999" }}>
                              Completed
                            </div>
                          </div>
                          <FaComments
                            style={{
                              fontSize: "1.5rem",
                              color: "#667eea",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {tab === "requests" && <MentorshipRequestsInbox />}
          </>
        )}

        {/* Apply Modal */}
        {showModal && (
          <ApplyMentorshipModal
            defaultCourseId={courseIdFromQuery}
            onClose={() => setShowModal(false)}
            onApply={handleApply}
          />
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
