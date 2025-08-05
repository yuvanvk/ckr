import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://ckr-web.vercel.app/"],
    methods: ["GET", "POST"],
  },
});

const PORT = Number(process.env.PORT) || 3000;
// Store active users and their room information
interface User {
  id: string;
  username: string;
  room: string;
}

const activeUsers = new Map<string, User>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room functionality
  socket.on("join_room", ({ username, room }, callback) => {
    try {
      // Validate input
      if (!username || !room) {
        callback({
          success: false,
          message: "Username and room are required",
        });
        return;
      }

      // Remove user from previous room if they were in one
      const existingUser = activeUsers.get(socket.id);
      if (existingUser) {
        socket.leave(existingUser.room);
        socket.to(existingUser.room).emit("user_left", {
          username: existingUser.username,
          message: `${existingUser.username} has left the room`,
        });
        
        // Update room participants list
        const roomParticipants = Array.from(activeUsers.values())
          .filter(user => user.room === existingUser.room)
          .map(user => ({ id: user.id, username: user.username }));
        
        io.to(existingUser.room).emit("room_participants", roomParticipants);
      }

      // Join new room
      socket.join(room);
      
      // Store user information
      activeUsers.set(socket.id, {
        id: socket.id,
        username,
        room,
      });

      // Notify room about new user
      socket.to(room).emit("user_joined", {
        username,
        message: `${username} has joined the room`,
      });

      // Get current room participants
      const roomParticipants = Array.from(activeUsers.values())
        .filter(user => user.room === room)
        .map(user => ({ id: user.id, username: user.username }));

      // Send room participants to all users in the room
      io.to(room).emit("room_participants", roomParticipants);

      // Send welcome message to the joining user
      socket.emit("receive_message", {
        username: "System",
        message: `Welcome to room ${room}!`,
        timestamp: new Date().toISOString(),
      });

      callback({
        success: true,
        message: `Successfully joined room ${room}`,
        room,
        participants: roomParticipants,
      });

      console.log(`${username} joined room ${room}`);
    } catch (error) {
      console.error("Error joining room:", error);
      callback({
        success: false,
        message: "Failed to join room",
      });
    }
  });

  // Send message functionality
  socket.on("send_message", ({ room, message, username }, callback) => {
    try {
      // Validate input
      if (!room || !message || !username) {
        callback({
          success: false,
          message: "Room, message, and username are required",
        });
        return;
      }

      // Check if user is in the room
      const user = activeUsers.get(socket.id);
      if (!user || user.room !== room) {
        callback({
          success: false,
          message: "You are not in this room",
        });
        return;
      }

      // Broadcast message to room
      io.to(room).emit("receive_message", {
        username,
        message,
        timestamp: new Date().toISOString(),
      });

      callback({
        success: true,
        message: "Message sent successfully",
      });

      console.log(`Message from ${username} in room ${room}: ${message}`);
    } catch (error) {
      console.error("Error sending message:", error);
      callback({
        success: false,
        message: "Failed to send message",
      });
    }
  });

  // Get room participants
  socket.on("get_room_participants", ({ room }, callback) => {
    try {
      const participants = Array.from(activeUsers.values())
        .filter(user => user.room === room)
        .map(user => ({ id: user.id, username: user.username }));

      callback({
        success: true,
        participants,
      });
    } catch (error) {
      console.error("Error getting room participants:", error);
      callback({
        success: false,
        message: "Failed to get room participants",
      });
    }
  });

  // Leave room functionality
  socket.on("leave_room", (callback) => {
    try {
      const user = activeUsers.get(socket.id);
      if (!user) {
        callback({
          success: false,
          message: "You are not in any room",
        });
        return;
      }

      const { room, username } = user;
      
      // Leave the room
      socket.leave(room);
      activeUsers.delete(socket.id);

      // Notify other users
      socket.to(room).emit("user_left", {
        username,
        message: `${username} has left the room`,
      });

      // Update room participants list
      const roomParticipants = Array.from(activeUsers.values())
        .filter(user => user.room === room)
        .map(user => ({ id: user.id, username: user.username }));

      io.to(room).emit("room_participants", roomParticipants);

      callback({
        success: true,
        message: `Left room ${room}`,
      });

      console.log(`${username} left room ${room}`);
    } catch (error) {
      console.error("Error leaving room:", error);
      callback({
        success: false,
        message: "Failed to leave room",
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const { room, username } = user;
      
      // Remove from active users
      activeUsers.delete(socket.id);
      
      // Notify other users in the room
      socket.to(room).emit("user_left", {
        username,
        message: `${username} has disconnected`,
      });

      // Update room participants list
      const roomParticipants = Array.from(activeUsers.values())
        .filter(user => user.room === room)
        .map(user => ({ id: user.id, username: user.username }));

      io.to(room).emit("room_participants", roomParticipants);

      console.log(`${username} disconnected from room ${room}`);
    }
    console.log("User disconnected:", socket.id);
  });
});
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${PORT}`);
});
