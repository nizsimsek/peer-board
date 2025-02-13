import { Card, CardContent } from "@/components/ui/card";

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { connectToSocket } from "@/socket";
import Menu from "./components/menu";
import Canvas from "./components/canvas";

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    connectToSocket(roomId);
  }, []);

  return (
    <div className="flex h-svh flex-col items-center justify-center bg-muted bg-zinc-200 dark:bg-zinc-800 p-2">
      <Card className="rounded-2xl w-full h-full flex">
        <CardContent className="relative flex flex-auto overflow-hidden p-0 m-2 md:m-4">
          <Menu />
          <Canvas />
        </CardContent>
      </Card>
    </div>
  );
};

export default Room;
