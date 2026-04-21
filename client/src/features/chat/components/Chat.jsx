import React, { useState } from "react";
import { FaCheck, FaCheckDouble } from "react-icons/fa";

export default function Chat({
  conversation,
  onSendMessage,
  currentUserId,
  setMessages,
}) {
  const [message, setMessage] = useState("");

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
      return null;
    }
    return conversation.messages.map((msg, idx) => {
      const senderId = msg.senderId?._id ? msg.senderId._id : msg.senderId;
      const isMine = senderId === currentUserId;
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
              padding: "8px 12px",
              borderRadius: "12px",
              backgroundColor: isMine ? "#2563eb" : "#e5e7eb",
              color: isMine ? "#fff" : "#000",
              wordWrap: "break-word",
            }}
          >
            <div>{msg.message}</div>
            <div
              style={{
                fontSize: "12px",
                marginTop: "4px",
                opacity: 0.7,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {msg.isRead ? <FaCheckDouble /> : <FaCheck />}
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
          fontWeight: "600",
          backgroundColor: "#fff",
        }}
      >
        {conversation.userName}
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
