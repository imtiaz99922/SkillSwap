import io from "socket.io-client";
import { getToken } from "../utils/auth";

let socket = null;

export const initializeSocket = (tokenParam) => {
  if (socket) return socket;

  const token = tokenParam || getToken();
  if (!token) return null;

  socket = io("http://localhost:5000", {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("join", userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
};
