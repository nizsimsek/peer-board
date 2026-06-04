import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://peer-board.nizsimsek.dev"],
    methods: ["GET", "POST"],
  },
});

const roomPasswords = new Map();
const roomElements = new Map();

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

  const existingElements = roomElements.get(roomId);
  if (existingElements && existingElements.size > 0) {
    socket.emit("elements:sync", Array.from(existingElements.values()));
  }

  socket.on("user:cursor-position", (data) => {
    io.to(roomId).emit("user:cursor-position", data);
  });

  socket.on("element:update", (element) => {
    if (!element || !element.id) return;
    let elements = roomElements.get(roomId);
    if (!elements) {
      elements = new Map();
      roomElements.set(roomId, elements);
    }
    elements.set(element.id, element);
    socket.to(roomId).emit("element:update", element);
  });

  socket.on("element:delete", ({ id }) => {
    const elements = roomElements.get(roomId);
    if (elements) elements.delete(id);
    socket.to(roomId).emit("element:delete", { id });
  });

  socket.on("elements:clear", () => {
    roomElements.set(roomId, new Map());
    socket.to(roomId).emit("elements:clear");
  });

  socket.on("disconnect", () => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (!room || room.size === 0) {
      roomPasswords.delete(roomId);
      roomElements.delete(roomId);
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
