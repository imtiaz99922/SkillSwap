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
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem("token");
    if (token) {
      initializeSocket(token);
    }
    const socket = getSocket();

    if (socket) {
      // Listen for incoming messages
      socket.on("receiveMessage", (newMessage) => {
        // Add message if it's from the current conversation
        if (newMessage.senderId === selectedUserId) {
          setMessages((prev) => [...prev, newMessage]);
        }
        // Refresh conversations to update last message and add new senders
        fetchConversations();
      });

      // Listen for conversation updates (new or updated conversations)
      socket.on("conversationUpdated", (updatedConversation) => {
        setConversations((prev) => {
          const exists = prev.find(
            (c) => c.userId === updatedConversation.userId,
          );
          if (exists) {
            // Update existing conversation
            return prev.map((c) =>
              c.userId === updatedConversation.userId
                ? { ...c, lastMessage: updatedConversation.lastMessage }
                : c,
            );
          } else {
            // Add new conversation to the beginning
            return [updatedConversation, ...prev];
          }
        });
      });

      return () => {
        socket.off("receiveMessage");
        socket.off("conversationUpdated");
      };
    }
  }, [selectedUserId, currentUserId]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialUserId = searchParams.get("user");
    const initialUserName = location.state?.userName;

    if (initialUserId) {
      setSelectedUserId(initialUserId);
      setSelectedUserName(initialUserName || "");
    }

    fetchConversations();
  }, [location.search]);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      const conversationList = data.conversations || [];
      setConversations(conversationList);

      if (selectedUserId) {
        const selected = conversationList.find(
          (c) => c.userId === selectedUserId,
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
    try {
      await chatApi.sendMessage(receiverId, messageText);
      fetchMessages(receiverId);
      fetchConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const selectedConversation = conversations.find(
    (c) => c.userId === selectedUserId,
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

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "24px",
            minHeight: "600px",
          }}
        >
          <ChatList
            conversations={conversations}
            selectedUserId={selectedUserId}
            onSelectUser={(userId) => {
              setSelectedUserId(userId);
              const conversation = conversations.find(
                (c) => c.userId === userId,
              );
              if (conversation) {
                setSelectedUserName(conversation.userName);
              }
            }}
          />
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
      )}
    </div>
  );
}
