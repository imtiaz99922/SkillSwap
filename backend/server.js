const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

// Enhanced CORS configuration with proper preflight handling
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Still allow but log for debugging
        console.log("CORS request from:", origin);
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);

app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const skillRoutes = require("./routes/skills");
const analyticsRoutes = require("./routes/analytics");
const challengeRoutes = require("./routes/challenges");
const searchRoutes = require("./routes/search");
const walletRoutes = require("./routes/wallet");
const paymentRoutes = require("./routes/payment");
const availabilityRoutes = require("./routes/availability/availabilityRoutes");
const chatRoutes = require("./routes/chat/chatRoutes");
const notificationRoutes = require("./routes/notifications/notificationRoutes");
const reviewRoutes = require("./routes/reviews/reviewRoutes");
const recommendationRoutes = require("./routes/recommendations");
const mentorshipRoutes = require("./routes/mentorship");
const referralRoutes = require("./routes/referral");
const reportRoutes = require("./routes/reports");
const leaderboardRoutes = require("./routes/leaderboard");
const sessionRoutes = require("./routes/sessions");
const pdfReportRoutes = require("./routes/pdf-reports");
const courseRoutes = require("./routes/courses");
const courseContentRoutes = require("./routes/course-content");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/pdf-reports", pdfReportRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/course-content", courseContentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, dbConnected: mongoose.connection.readyState === 1 });
});

async function connectDB() {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/skillswap";
    console.log("Connecting to MongoDB...");

    const connectPromise = mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await Promise.race([
      connectPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 12000),
      ),
    ]);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.warn(
      "⚠️ MongoDB Atlas connection failed, switching to in-memory database",
    );
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ Using in-memory MongoDB");
    } catch (fallbackErr) {
      console.error("❌ Failed to initialize database:", fallbackErr.message);
      process.exit(1);
    }
  }
}

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Socket.IO setup with proper CORS
    const io = socketIo(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      transports: ["websocket", "polling"],
    });

    app.locals.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      const token = socket.handshake.auth.token;
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "skillswap_secret",
          );
          socket.userId = decoded.id;
        } catch (err) {
          socket.disconnect();
          return;
        }
      } else {
        socket.disconnect();
        return;
      }

      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      });

      socket.on("sendMessage", async (data) => {
        try {
          const ChatMessage = require("./models/ChatMessage");
          const msg = new ChatMessage({
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            timestamp: new Date(),
          });
          await msg.save();

          // Emit to receiver's room
          io.to(data.receiverId.toString()).emit("receiveMessage", {
            _id: msg._id,
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            timestamp: msg.timestamp,
            isRead: false,
          });

          // Confirm to sender
          socket.emit("messageSent", msg);
        } catch (err) {
          console.error("Message error:", err);
          socket.emit("messageError", { error: err.message });
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // Serve frontend build
    const clientPath = path.join(__dirname, "..", "client", "dist");
    if (fs.existsSync(clientPath)) {
      app.use(express.static(clientPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(clientPath, "index.html"));
      });
    }
  })
  .catch((err) => {
    console.error("Server startup failed:", err);
    process.exit(1);
  });
