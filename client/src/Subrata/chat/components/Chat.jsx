import React, { useState, useEffect, useRef } from "react";
import { FaCheck, FaCheckDouble } from "react-icons/fa";

export default function Chat({
  conversation,
  onSendMessage,
  currentUserId,
  setMessages,
}) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const handleSend = () => {
    if (message.trim()) {
      // Immediately add message to local state for instant feedback
      const newMessage = {
        _id: Date.now(),
        senderId: currentUserId,
        receiverId: conversation.userId,
        message: message,
        timestamp: new Date(),
        isRead: false,
      };
      if (setMessages) {
        setMessages((prev) => [...prev, newMessage]);
      }
      const messageText = message;
      setMessage("");
      onSendMessage(conversation.userId, messageText);
    }
  };

  const renderMessages = () => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginTop: "80px",
          }}
        >
          No messages yet. Start the conversation.
        </div>
      );
    }

    return conversation.messages.map((msg, idx) => {
      const senderId = msg.senderId?._id ? msg.senderId._id : msg.senderId;
      const isMine = senderId === currentUserId;
      const timestamp = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      return (
        <div
          key={idx}
          style={{
            display: "flex",
            justifyContent: isMine ? "flex-end" : "flex-start",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
          <div
            style={{
              maxWidth: "60%",
              padding: "10px 14px",
              borderRadius: "18px",
              backgroundColor: isMine ? "#2563eb" : "#e5e7eb",
              color: isMine ? "#fff" : "#111827",
              wordWrap: "break-word",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            <div>{msg.message}</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "11px",
                marginTop: "6px",
                opacity: 0.75,
                gap: "6px",
              }}
            >
              <span>{timestamp}</span>
              {isMine && (
                <span>{msg.isRead ? <FaCheckDouble /> : <FaCheck />}</span>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div
      className="chat-container"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        height: "500px",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ fontWeight: "600", fontSize: "16px" }}>
            {conversation.userName}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            Active now
          </div>
        </div>
      </div>

      {/* Messages */}
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
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: "8px",
          backgroundColor: "#fff",
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
