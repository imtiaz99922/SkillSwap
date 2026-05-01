import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Chat from "../components/Chat";
import ChatList from "../components/ChatList";
import { chatApi } from "../services/chatApi";
import { initializeSocket, getSocket } from "../../../services/socketService";
import "../../../styles/ModernDesign.css";

export default function ChatPage() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [globalMessages, setGlobalMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [conversationSearch, setConversationSearch] = useState("");
  const [activeTab, setActiveTab] = useState("private"); // "private" or "global"
  const [globalMessageInput, setGlobalMessageInput] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const currentUserId = localStorage.getItem("userId");

  const normalizeConversation = (conversation) => ({
    ...conversation,
    userId: String(conversation.userId),
    userName: conversation.userName || "Unknown",
    lastMessage: conversation.lastMessage || "",
  });

  const addOrUpdateConversation = (conversation) => {
    const normalizedConversation = normalizeConversation(conversation);

    setConversations((prev) => {
      const exists = prev.some(
        (c) => String(c.userId) === normalizedConversation.userId,
      );
      const updatedList = exists
        ? prev.map((c) =>
            String(c.userId) === normalizedConversation.userId
              ? { ...c, ...normalizedConversation }
              : c,
          )
        : [normalizedConversation, ...prev];

      return updatedList.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
      );
    });

    if (!selectedUserId) {
      setSelectedUserId(normalizedConversation.userId);
      setSelectedUserName(normalizedConversation.userName);
    } else if (String(selectedUserId) === normalizedConversation.userId) {
      setSelectedUserName(normalizedConversation.userName);
    }
  };

  const markMessagesRead = async (userId) => {
    if (!userId) return;
    try {
      await chatApi.markAsRead(userId);
      setConversations((prev) =>
        prev.map((conversation) =>
          String(conversation.userId) === String(userId)
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        ),
      );
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const handleSelectUser = async (userId) => {
    const selectedConversation = conversations.find(
      (c) => String(c.userId) === String(userId),
    );

    setSelectedUserId(userId);
    setSelectedUserName(selectedConversation?.userName || "Chat");
    await markMessagesRead(userId);
    await fetchMessages(userId);
  };

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem("token");
    if (token) {
      initializeSocket(token);
    }
    const socket = getSocket();

    if (socket) {
      socket.on("connect", () => {
        setSocketConnected(true);
      });
      socket.on("disconnect", () => {
        setSocketConnected(false);
      });

      // Listen for incoming private messages
      socket.on("receiveMessage", (newMessage) => {
        const senderId = String(newMessage.senderId);
        const receiverId = String(newMessage.receiverId);
        const selectedId = String(selectedUserId);
        const otherUserId = senderId === currentUserId ? receiverId : senderId;
        const otherUserName =
          senderId === currentUserId
            ? newMessage.receiverName || "Unknown"
            : newMessage.senderName || "Unknown";
        const isCurrentConversation =
          activeTab === "private" && selectedId === otherUserId;

        if (isCurrentConversation) {
          setMessages((prev) => [...prev, newMessage]);
          markMessagesRead(otherUserId);
        }

        addOrUpdateConversation({
          userId: otherUserId,
          userName: otherUserName,
          lastMessage: newMessage.message,
          lastMessageTime: newMessage.timestamp,
          unreadCount:
            receiverId === currentUserId && senderId !== currentUserId ? 1 : 0,
        });

        if (isCurrentConversation) {
          fetchMessages(otherUserId);
        }

        // Refresh conversations to update last message and add new senders
        fetchConversations();
      });

      socket.on("messageSent", (sentMessage) => {
        const receiverId = String(sentMessage.receiverId);
        const selectedId = String(selectedUserId);
        const otherUserName = sentMessage.receiverName || "Unknown";

        if (activeTab === "private" && selectedId === receiverId) {
          setMessages((prev) => [...prev, sentMessage]);
        }

        addOrUpdateConversation({
          userId: receiverId,
          userName: otherUserName,
          lastMessage: sentMessage.message,
          lastMessageTime: sentMessage.timestamp,
          unreadCount: 0,
        });
      });

      // Listen for conversation updates (new or updated conversations)
      socket.on("conversationUpdated", (updatedConversation) => {
        addOrUpdateConversation(updatedConversation);
      });

      // Listen for new global messages
      socket.on("newGlobalMessage", (newMessage) => {
        if (activeTab === "global") {
          setGlobalMessages((prev) => [...prev, newMessage]);
        }
      });

      // Listen for message deletions
      socket.on("messageDeleted", (data) => {
        if (activeTab === "global") {
          setGlobalMessages((prev) =>
            prev.filter((msg) => msg._id !== data.messageId),
          );
        }
      });

      // Listen for message likes
      socket.on("messageLikeUpdated", (data) => {
        if (activeTab === "global") {
          setGlobalMessages((prev) =>
            prev.map((msg) =>
              msg._id === data.messageId ? { ...msg, likes: data.likes } : msg,
            ),
          );
        }
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("receiveMessage");
        socket.off("messageSent");
        socket.off("conversationUpdated");
        socket.off("newGlobalMessage");
        socket.off("messageDeleted");
        socket.off("messageLikeUpdated");
      };
    }
  }, [selectedUserId, activeTab, currentUserId]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialUserId = searchParams.get("user");
    const initialUserName = location.state?.userName;

    if (initialUserId) {
      setSelectedUserId(initialUserId);
      setSelectedUserName(initialUserName || "");
      setActiveTab("private");
    }

    fetchConversations();
    fetchGlobalMessages();
  }, [location.search]);

  useEffect(() => {
    if (selectedUserId && activeTab === "private") {
      fetchMessages(selectedUserId);
      markMessagesRead(selectedUserId);
    }
  }, [selectedUserId, activeTab]);

  const fetchGlobalMessages = async () => {
    try {
      const data = await chatApi.getGlobalMessages();
      setGlobalMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch global messages:", err);
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      const conversationList = (data.conversations || [])
        .map(normalizeConversation)
        .sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
        );

      setConversations(conversationList);

      if (selectedUserId) {
        const selected = conversationList.find(
          (c) => String(c.userId) === String(selectedUserId),
        );
        if (selected) {
          setSelectedUserName(selected.userName);
        }
      } else if (conversationList.length > 0) {
        setSelectedUserId(conversationList[0].userId);
        setSelectedUserName(conversationList[0].userName);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const data = await chatApi.getMessages(userId);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSendMessage = async (receiverId, messageText) => {
    const normalizedReceiverId = String(receiverId);
    const socket = getSocket();
    const useSocket = socket && socket.connected;

    try {
      if (useSocket) {
        socket.emit("sendMessage", {
          senderId: currentUserId,
          receiverId: normalizedReceiverId,
          message: messageText,
        });
        return;
      }

      await chatApi.sendMessage(normalizedReceiverId, messageText);
      fetchMessages(normalizedReceiverId);
      fetchConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handlePostGlobalMessage = async () => {
    if (!globalMessageInput.trim()) return;

    try {
      await chatApi.postGlobalMessage(globalMessageInput);
      setGlobalMessageInput("");
      fetchGlobalMessages();
    } catch (err) {
      console.error("Failed to post global message:", err);
    }
  };

  const handleDeleteGlobalMessage = async (messageId) => {
    try {
      await chatApi.deleteGlobalMessage(messageId);
      setGlobalMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleLikeGlobalMessage = async (messageId) => {
    try {
      await chatApi.likeGlobalMessage(messageId);
      fetchGlobalMessages();
    } catch (err) {
      console.error("Failed to like message:", err);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const searchText = conversationSearch.toLowerCase();
    const userNameMatches = conversation.userName
      .toLowerCase()
      .includes(searchText);
    const lastMessageMatches = conversation.lastMessage
      ? conversation.lastMessage.toLowerCase().includes(searchText)
      : false;
    return userNameMatches || lastMessageMatches;
  });

  const selectedConversation = conversations.find(
    (c) => String(c.userId) === String(selectedUserId),
  );
  const selectedMessages = selectedConversation
    ? {
        ...selectedConversation,
        messages,
      }
    : {
        userId: selectedUserId,
        userName: selectedUserName || "Chat",
        messages,
      };

  return (
    <div className="feature-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">
          Connect and collaborate with mentors and learners
        </p>
      </div>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "0",
          marginBottom: "20px",
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <button
          onClick={() => setActiveTab("private")}
          style={{
            padding: "12px 24px",
            backgroundColor: activeTab === "private" ? "#2563eb" : "#f3f4f6",
            color: activeTab === "private" ? "#fff" : "#333",
            border: "none",
            cursor: "pointer",
            fontWeight: "500",
            borderBottom:
              activeTab === "private" ? "3px solid #2563eb" : "none",
          }}
        >
          Direct Messages
        </button>
        <button
          onClick={() => setActiveTab("global")}
          style={{
            padding: "12px 24px",
            backgroundColor: activeTab === "global" ? "#2563eb" : "#f3f4f6",
            color: activeTab === "global" ? "#fff" : "#333",
            border: "none",
            cursor: "pointer",
            fontWeight: "500",
            borderBottom: activeTab === "global" ? "3px solid #2563eb" : "none",
          }}
        >
          Community Chat
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : activeTab === "private" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "24px",
            minHeight: "600px",
          }}
        >
          <div>
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 16px",
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <input
                type="text"
                value={conversationSearch}
                onChange={(e) => setConversationSearch(e.target.value)}
                placeholder="Search conversations"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  outline: "none",
                }}
              />
            </div>
            <ChatList
              conversations={filteredConversations}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
            />
          </div>
          {selectedUserId ? (
            <Chat
              conversation={selectedMessages}
              onSendMessage={handleSendMessage}
              currentUserId={currentUserId}
              setMessages={setMessages}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Global Message Input */}
          <div
            style={{
              backgroundColor: "#fff",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ marginBottom: "12px", fontWeight: "500" }}>
              Share with Community
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <textarea
                value={globalMessageInput}
                onChange={(e) => setGlobalMessageInput(e.target.value)}
                placeholder="Share your thoughts with the community..."
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  minHeight: "80px",
                  resize: "vertical",
                }}
              />
            </div>
            <button
              onClick={handlePostGlobalMessage}
              style={{
                marginTop: "12px",
                padding: "10px 20px",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Post Message
            </button>
          </div>

          {/* Global Messages */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {globalMessages && globalMessages.length > 0 ? (
              globalMessages.map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    backgroundColor: "#fff",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", color: "#2563eb" }}>
                        {msg.senderName || "Anonymous"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "2px",
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {msg.senderId === currentUserId && (
                      <button
                        onClick={() => handleDeleteGlobalMessage(msg._id)}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div style={{ marginBottom: "12px", lineHeight: "1.5" }}>
                    {msg.message}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() => handleLikeGlobalMessage(msg._id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        padding: "4px 12px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      👍 {msg.likes ? msg.likes.length : 0}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#9ca3af",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🌍</div>
                <p>No community messages yet. Be the first to share!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
