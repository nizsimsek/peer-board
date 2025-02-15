import { Card, CardContent } from "@/components/ui/card";

import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import Menu from "./components/menu";
import Canvas from "./components/canvas";
import { useSocket } from "@/hooks/useSocket";
import { UserEvent } from "@/types";
import { useRandomColor } from "@/hooks/useRandomColor";

const Room = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const password = searchParams.get("password");
  const name = searchParams.get("name");
  const navigate = useNavigate();
  const color = useRandomColor();

  useEffect(() => {
    if (!roomId || !password || !name) {
      navigate("/");
      return;
    }
  }, [roomId, password, name, navigate]);

  const { socket, isConnected } = useSocket({
    roomId: roomId!,
    password: password!,
    name: name!,
    color: color!,
  });

  useEffect(() => {
    if (!socket) return;

    socket.on("user:joined", (data: UserEvent) => {
      console.log(`User ${data.name} joined room ${data.roomId}`);
    });

    socket.on("user:left", (data: UserEvent) => {
      console.log(`User ${data.name} left room ${data.roomId}`);
    });

    return () => {
      socket.off("user:joined");
      socket.off("user:left");
    };
  }, [socket]);

  return (
    <div className="flex h-svh flex-col items-center justify-center bg-muted bg-zinc-200 dark:bg-zinc-800 p-2">
      <div
        className={`fixed top-4 left-4 z-10 animate-pulse w-3 h-3 rounded-full ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      />

      <Card className="rounded-2xl w-full h-full flex">
        <CardContent className="relative flex flex-auto overflow-hidden p-0 m-4">
          <Menu />
          <Canvas />
        </CardContent>
      </Card>
    </div>
  );
};

export default Room;
