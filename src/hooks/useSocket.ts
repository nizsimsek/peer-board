import { io, Socket } from "socket.io-client";
import { useEffect, useState, useCallback } from "react";

interface SocketProps {
  roomId: string;
  password: string;
  name: string;
  color: string;
}

export const useSocket = ({ roomId, password, name, color }: SocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const newSocket = io("http://localhost:3000", {
      query: { roomId, password, name, color },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      newSocket.disconnect();
      window.location.href = "/";
    });

    setSocket(newSocket);

    return newSocket;
  }, [roomId, password, name, color]);

  useEffect(() => {
    const newSocket = connect();

    return () => {
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.disconnect();
      }
    };
  }, [connect]);

  return {
    socket,
    isConnected,
  };
};
