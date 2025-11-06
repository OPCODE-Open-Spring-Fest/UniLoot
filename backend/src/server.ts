import http from "http";
import { Server } from "socket.io";
import app from "./app"; // 👈 your main Express app
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // or specify frontend URL e.g. "http://localhost:5173"
    methods: ["GET", "POST"],
  },
});

// Map userId to socket.id
const userSocketMap = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // 🧠 When user logs in or joins, client emits "registerUser" with their userId
  socket.on("registerUser", (userId: string) => {
    userSocketMap.set(userId, socket.id);
    socket.join(userId); // ✅ Join a personal room using userId
    console.log(`✅ User ${userId} registered with socket ${socket.id}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    for (const [userId, sockId] of userSocketMap.entries()) {
      if (sockId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

// ✅ Middleware to attach io to every request
import express from "express";
app.use((req: express.Request, _res, next) => {
  (req as any).io = io;
  next();
});

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
