import { io, Socket } from "socket.io-client";

let socket: Socket;

export const connectToSocket = (roomId: string) => {
  socket = io("http://localhost:3000", {
    query: {
      roomId,
    },
  });

  socket.on("connect", () => {
    console.log("connected to socket");
  });

  socket.on("disconnect", () => {
    console.log("disconnected from socket");
  });
};

export const emitClearWhiteboard = () => {
  socket.emit("clearWhiteboard");
};
