import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { connectToSocket } from "@/socket";
import Menu from "./components/menu";

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
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted bg-zinc-200 dark:bg-zinc-800 p-2">
      <Card className="w-full flex-1">
        <CardHeader className="flex flex-row justify-center items-center w-full p-2">
          <Menu />
        </CardHeader>
        <CardContent className="flex">
        </CardContent>
      </Card>
    </div>
  );
};

export default Room;
