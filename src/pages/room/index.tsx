import { Card, CardContent } from "@/components/ui/card";

import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import Menu from "./components/menu";
import Canvas from "./components/canvas";
import { useSocket } from "@/hooks/useSocket";
import { UserEvent } from "@/types";
import { useRandomColor } from "@/hooks/useRandomColor";
import { useCursorStore } from "@/store/cursors.store";

const Room = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const password = searchParams.get("password");
  const name = searchParams.get("name");
  const navigate = useNavigate();
  const color = useRandomColor();
  const { updateCursorPosition, removeCursorPosition, clearCursors } =
    useCursorStore();

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

    clearCursors();

    socket.on("user:joined", (data: UserEvent) => {
      if (
        data.userId !== socket.id &&
        data.userId !== null &&
        data.userId !== undefined
      ) {
        updateCursorPosition({
          userId: data.userId,
          x: data.x,
          y: data.y,
          name: data.name,
          color: data.color,
        });
      }
    });

    socket.on("user:left", (data: UserEvent) => {
      removeCursorPosition(data.userId);
    });

    socket.on("user:cursor-position", (data: UserEvent) => {
      if (
        data.userId !== socket.id &&
        data.userId !== null &&
        data.userId !== undefined
      ) {
        updateCursorPosition({
          userId: data.userId,
          x: data.x,
          y: data.y,
          name: data.name,
          color: data.color,
        });
      }
    });

    return () => {
      socket.off("user:joined");
      socket.off("user:left");
      socket.off("user:cursor-position");
    };
  }, [socket, updateCursorPosition, removeCursorPosition]);

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
          <Canvas socket={socket} name={name!} color={color!} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Room;
