import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const roomPasswords = new Map();

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
  const { roomId, name, password, color } = socket.handshake.query;
  if (!roomId) {
    socket.disconnect();
    return;
  }

  const existingPassword = roomPasswords.get(roomId);
  if (existingPassword) {
    if (existingPassword !== password) {
      socket.emit("error", { message: "Incorrect password" });
      socket.disconnect();
      return;
    }
  } else {
    if (password) {
      roomPasswords.set(roomId, password);
    }
  }

  socket.join(roomId);

  io.to(roomId).emit("user:joined", {
    userId: socket.id,
    roomId: roomId,
    name: name,
    color: color,
  });

  socket.on("user:cursor-position", (data) => {
    io.to(roomId).emit("user:cursor-position", data);
  });

  socket.on("disconnect", () => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (!room || room.size === 0) {
      roomPasswords.delete(roomId);
    } else {
      io.to(roomId).emit("user:left", {
        userId: socket.id,
        roomId: roomId,
        name: name,
        color: color,
      });
    }
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
