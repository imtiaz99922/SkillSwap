import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { referralApi } from "../services/referralApi";
import api from "../../../services/api";
import { FaCopy, FaSpinner, FaCheckCircle } from "react-icons/fa";
import "../../../styles/ModernDesign.css";

export default function ReferralPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [courseReferrals, setCourseReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState(searchParams.get("tab") || "general");
  const [showCourseReferralForm, setShowCourseReferralForm] = useState(false);
  const [referToEmail, setReferToEmail] = useState("");
  const [referToName, setReferToName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(
    searchParams.get("courseId") || "",
  );
  const [sendingReferral, setSendingReferral] = useState(false);
  const [referralMessage, setReferralMessage] = useState(null);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Fetch general referral code
      const codeData = await referralApi.getReferralCode();
      setReferralCode(codeData.referralCode);
      setShareUrl(codeData.shareUrl);

      const statsData = await referralApi.getReferralStats();
      setStats(statsData);

      const referralsData = await referralApi.getReferrals();
      setReferrals(referralsData);

      // Fetch course referrals received
      try {
        const courseRefData = await api.get("/referral/course-referrals");
        setCourseReferrals(courseRefData.data || []);
      } catch (err) {
        // Course referrals endpoint might not exist yet
        console.log("Course referrals not available yet");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch referral data");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendCourseReferral = async () => {
    if (!selectedCourseId || !referToEmail.trim()) {
      setReferralMessage({
        type: "error",
        text: "Please select a course and enter email",
      });
      return;
    }

    setSendingReferral(true);
    try {
      const response = await api.post("/referral/refer-course", {
        courseId: selectedCourseId,
        referToEmail: referToEmail.trim(),
        referToName,
      });

      setReferralMessage({
        type: "success",
        text: `✅ Referral sent! Coupon: ${response.data.couponCode}`,
      });

      // Reset form
      setReferToEmail("");
      setReferToName("");
      setSelectedCourseId("");
      setShowCourseReferralForm(false);

      // Reload course referrals
      setTimeout(() => fetchReferralData(), 1000);
    } catch (err) {
      setReferralMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to send referral",
      });
    } finally {
      setSendingReferral(false);
    }
  };

  return (
    <div className="feature-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1 className="page-title">🎓 Referral Program</h1>
        <p className="page-subtitle">
          Refer courses and earn rewards through our referral system
        </p>
      </div>

      {error && (
        <div
          className="card"
          style={{
            padding: "15px",
            background: "#fee",
            borderLeft: "4px solid #f44",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#c33", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          className="tab"
          style={{
            padding: "10px 20px",
            background: tab === "general" ? "#667eea" : "#e5e7eb",
            color: tab === "general" ? "white" : "#333",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => setTab("general")}
        >
          📊 General Referral
        </button>
        <button
          className="tab"
          style={{
            padding: "10px 20px",
            background: tab === "course" ? "#667eea" : "#e5e7eb",
            color: tab === "course" ? "white" : "#333",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onClick={() => setTab("course")}
        >
          🎯 Course Referrals ({courseReferrals.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <FaSpinner
            style={{
              fontSize: "3rem",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
      ) : (
        <>
          {/* GENERAL REFERRAL TAB */}
          {tab === "general" && (
            <div style={{ display: "grid", gap: "20px" }}>
              {/* Referral Code Card */}
              <div className="card" style={{ padding: "30px" }}>
                <h2 style={{ marginTop: 0 }}>Your Referral Code</h2>
                <div
                  style={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    borderRadius: "12px",
                    padding: "20px",
                    color: "white",
                    marginBottom: "20px",
                  }}
                >
                  <p style={{ margin: "0 0 10px 0", opacity: 0.9 }}>
                    Share this code with friends:
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "rgba(255,255,255,0.2)",
                      padding: "12px",
                      borderRadius: "8px",
                    }}
                  >
                    <code
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        flex: 1,
                      }}
                    >
                      {referralCode}
                    </code>
                    <button
                      onClick={handleCopyCode}
                      style={{
                        background: "white",
                        color: "#667eea",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      <FaCopy /> {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "15px",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      margin: "0 0 10px 0",
                    }}
                  >
                    Or share this link:
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      style={{
                        flex: 1,
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        padding: "10px",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                      }}
                    />
                    <button
                      onClick={handleCopyUrl}
                      style={{
                        background: "#667eea",
                        color: "white",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                }}
              >
                <div
                  className="card"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  <h3 style={{ fontSize: "0.9rem", color: "#999", margin: 0 }}>
                    Total Invited
                  </h3>
                  <p
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#667eea",
                      margin: "10px 0 0 0",
                    }}
                  >
                    {stats?.totalInvited || 0}
                  </p>
                </div>
                <div
                  className="card"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  <h3 style={{ fontSize: "0.9rem", color: "#999", margin: 0 }}>
                    Accepted
                  </h3>
                  <p
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#10b981",
                      margin: "10px 0 0 0",
                    }}
                  >
                    {stats?.accepted || 0}
                  </p>
                </div>
                <div
                  className="card"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  <h3 style={{ fontSize: "0.9rem", color: "#999", margin: 0 }}>
                    Completed
                  </h3>
                  <p
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#f59e0b",
                      margin: "10px 0 0 0",
                    }}
                  >
                    {stats?.completed || 0}
                  </p>
                </div>
                <div
                  className="card"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  <h3 style={{ fontSize: "0.9rem", color: "#999", margin: 0 }}>
                    Bonus Earned
                  </h3>
                  <p
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#f97316",
                      margin: "10px 0 0 0",
                    }}
                  >
                    {stats?.bonusEarned || 0}
                  </p>
                </div>
              </div>

              {/* Referrals List */}
              <div className="card" style={{ padding: "30px" }}>
                <h2 style={{ marginTop: 0 }}>Your Referrals</h2>
                {referrals.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#999",
                      padding: "30px 0",
                    }}
                  >
                    No referrals yet. Start sharing your code!
                  </p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "2px solid #ddd" }}>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              fontWeight: "600",
                            }}
                          >
                            Email
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              fontWeight: "600",
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              fontWeight: "600",
                            }}
                          >
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map((ref) => (
                          <tr
                            key={ref._id}
                            style={{ borderBottom: "1px solid #eee" }}
                          >
                            <td style={{ padding: "12px" }}>{ref.email}</td>
                            <td style={{ padding: "12px" }}>
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "999px",
                                  fontSize: "0.85rem",
                                  fontWeight: "600",
                                  background:
                                    ref.status === "COMPLETED"
                                      ? "#d4edda"
                                      : ref.status === "ACCEPTED"
                                        ? "#cce5ff"
                                        : "#fff3cd",
                                  color:
                                    ref.status === "COMPLETED"
                                      ? "#155724"
                                      : ref.status === "ACCEPTED"
                                        ? "#004085"
                                        : "#856404",
                                }}
                              >
                                {ref.status}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                color: "#666",
                                fontSize: "0.9rem",
                              }}
                            >
                              {new Date(ref.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COURSE REFERRAL TAB */}
          {tab === "course" && (
            <div style={{ display: "grid", gap: "20px" }}>
              {/* Send Course Referral Button */}
              <div
                className="card"
                style={{ padding: "30px", textAlign: "center" }}
              >
                <h2 style={{ marginTop: 0 }}>Send Course Referral</h2>
                <p style={{ color: "#666", marginBottom: "20px" }}>
                  Refer a course to someone and they'll get 10% discount on
                  credit purchases!
                </p>
                <button
                  onClick={() =>
                    setShowCourseReferralForm(!showCourseReferralForm)
                  }
                  style={{
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  {showCourseReferralForm ? "Cancel" : "+ Create Referral"}
                </button>

                {showCourseReferralForm && (
                  <div
                    style={{
                      marginTop: "30px",
                      textAlign: "left",
                      maxWidth: "500px",
                      margin: "30px auto 0",
                    }}
                  >
                    {referralMessage && (
                      <div
                        style={{
                          padding: "12px",
                          borderRadius: "6px",
                          marginBottom: "20px",
                          background:
                            referralMessage.type === "success"
                              ? "#d4edda"
                              : "#f8d7da",
                          color:
                            referralMessage.type === "success"
                              ? "#155724"
                              : "#721c24",
                          border: `1px solid ${referralMessage.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                        }}
                      >
                        {referralMessage.text}
                      </div>
                    )}

                    <div style={{ marginBottom: "20px" }}>
                      <label
                        style={{
                          display: "block",
                          fontWeight: "600",
                          marginBottom: "8px",
                        }}
                      >
                        Course ID *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter course ID"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                      <small
                        style={{
                          display: "block",
                          color: "#999",
                          marginTop: "5px",
                        }}
                      >
                        You can find the course ID in the course details page
                      </small>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label
                        style={{
                          display: "block",
                          fontWeight: "600",
                          marginBottom: "8px",
                        }}
                      >
                        Friend's Email *
                      </label>
                      <input
                        type="email"
                        placeholder="friend@example.com"
                        value={referToEmail}
                        onChange={(e) => setReferToEmail(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label
                        style={{
                          display: "block",
                          fontWeight: "600",
                          marginBottom: "8px",
                        }}
                      >
                        Friend's Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={referToName}
                        onChange={(e) => setReferToName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSendCourseReferral}
                      disabled={
                        sendingReferral || !selectedCourseId || !referToEmail
                      }
                      style={{
                        width: "100%",
                        background:
                          sendingReferral || !selectedCourseId || !referToEmail
                            ? "#ccc"
                            : "#667eea",
                        color: "white",
                        border: "none",
                        padding: "12px",
                        borderRadius: "6px",
                        cursor:
                          sendingReferral || !selectedCourseId || !referToEmail
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: "600",
                      }}
                    >
                      {sendingReferral ? "Sending..." : "✉️ Send Referral"}
                    </button>
                  </div>
                )}
              </div>

              {/* Received Course Referrals */}
              <div className="card" style={{ padding: "30px" }}>
                <h2 style={{ marginTop: 0 }}>Referrals I Received</h2>
                {courseReferrals.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#999",
                      padding: "30px 0",
                    }}
                  >
                    No course referrals yet. When someone refers a course to
                    you, it will appear here!
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "15px" }}>
                    {courseReferrals.map((ref) => (
                      <div
                        key={ref._id}
                        style={{
                          padding: "20px",
                          border: "1px solid #ddd",
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
                          <h3 style={{ margin: 0, color: "#333" }}>
                            {ref.courseId?.title}
                          </h3>
                          <span
                            style={{
                              background: "#667eea",
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "999px",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                            }}
                          >
                            10% Off
                          </span>
                        </div>
                        <p style={{ margin: "8px 0", color: "#666" }}>
                          <strong>From:</strong> {ref.referrerId?.name}
                        </p>
                        <p style={{ margin: "8px 0", color: "#666" }}>
                          <strong>Coupon Code:</strong>{" "}
                          <code
                            style={{
                              background: "#eee",
                              padding: "2px 6px",
                              borderRadius: "3px",
                            }}
                          >
                            {ref.couponCode}
                          </code>
                        </p>
                        <p style={{ margin: "8px 0", color: "#666" }}>
                          <strong>Expires:</strong>{" "}
                          {new Date(ref.expiresAt).toLocaleDateString()}
                        </p>

                        {ref.couponRedeemed ? (
                          <div
                            style={{
                              marginTop: "12px",
                              padding: "10px",
                              background: "#d4edda",
                              borderRadius: "6px",
                              color: "#155724",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <FaCheckCircle /> Coupon Used
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/wallet?coupon=${ref.couponCode}`)
                            }
                            style={{
                              marginTop: "12px",
                              width: "100%",
                              background: "#667eea",
                              color: "white",
                              border: "none",
                              padding: "10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            💳 Use Coupon to Buy Credits
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
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
