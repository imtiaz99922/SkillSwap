import React, { useState, useEffect, useRef } from "react";
import { mentorshipApi } from "../services/mentorshipApi";
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function MentorshipChatInterface({ mentorshipId }) {
  const [messages, setMessages] = useState([]);
  const [mentorship, setMentorship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");
  const [blockMessage, setBlockMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [mentorshipId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const data = await mentorshipApi.getMessages(mentorshipId);
      setMentorship(data.mentorship);
      setMessages(data.messages);

      // Check for block message
      if (data.mentorship.status === "REJECTED" && data.mentorship.blockUntil) {
        const now = new Date();
        const blockUntil = new Date(data.mentorship.blockUntil);
        if (now < blockUntil) {
          const minutesLeft = Math.ceil((blockUntil - now) / (1000 * 60));
          setBlockMessage(
            `⏱️ You cannot message this mentor for another ${minutesLeft} minutes`,
          );
        } else {
          setBlockMessage("");
        }
      }
      setError("");
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || "Failed to fetch messages");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await mentorshipApi.sendMessage(mentorshipId, messageText);
      setMessageText("");
      await fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <FaSpinner
          style={{
            fontSize: "2.5rem",
            color: "#667eea",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!mentorship) {
    return (
      <div
        style={{
          padding: "20px",
          background: "#fff3cd",
          borderRadius: "8px",
          color: "#856404",
        }}
      >
        Mentorship not found
      </div>
    );
  }

  const isActive = mentorship.status === "ACTIVE";
  const otherUser =
    mentorship.mentorId._id !== localStorage.getItem("userId")
      ? mentorship.mentorId
      : mentorship.menteeId;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "600px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <div>
          <h3 style={{ margin: 0, marginBottom: "5px" }}>
            💬 Chat with {otherUser.name}
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.9 }}>
            {mentorship.courseId && `📚 ${mentorship.courseId.title}`}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "20px",
            fontSize: "0.85rem",
          }}
        >
          {isActive ? (
            <>
              <FaCheckCircle /> Active
            </>
          ) : (
            <>
              <FaExclamationCircle /> {mentorship.status}
            </>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#999",
              marginTop: "40px",
            }}
          >
            <p>No messages yet. Start the conversation! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId._id === localStorage.getItem("userId");
            return (
              <div
                key={msg._id}
                style={{
                  display: "flex",
                  justifyContent: isOwn ? "flex-end" : "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: isOwn ? "#667eea" : "#e0e0e0",
                    color: isOwn ? "white" : "#333",
                    wordWrap: "break-word",
                    fontSize: "0.95rem",
                  }}
                >
                  <p style={{ margin: 0, marginBottom: "5px" }}>
                    {msg.message}
                  </p>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.7,
                      marginTop: "5px",
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: "12px",
            background: "#f8d7da",
            color: "#721c24",
            fontSize: "0.9rem",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          {error}
        </div>
      )}

      {/* Block Message */}
      {blockMessage && (
        <div
          style={{
            padding: "12px",
            background: "#fff3cd",
            color: "#856404",
            fontSize: "0.9rem",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          {blockMessage}
        </div>
      )}

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "12px",
          background: "#f5f5f5",
          borderTop: "1px solid #e0e0e0",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={
            isActive ? "Type your message..." : "Mentorship not active"
          }
          disabled={!isActive || blockMessage}
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "0.95rem",
            outline: "none",
            background: !isActive || blockMessage ? "#f0f0f0" : "white",
            cursor: !isActive || blockMessage ? "not-allowed" : "text",
          }}
        />
        <button
          type="submit"
          disabled={!isActive || !messageText.trim() || sending || blockMessage}
          style={{
            padding: "10px 16px",
            background:
              !isActive || !messageText.trim() || blockMessage
                ? "#ccc"
                : "#667eea",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor:
              !isActive || !messageText.trim() || blockMessage
                ? "not-allowed"
                : "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {sending ? (
            <>
              <FaSpinner style={{ animation: "spin 1s linear infinite" }} />{" "}
              Sending
            </>
          ) : (
            "Send"
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
