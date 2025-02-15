import { useRef, useEffect, useMemo } from "react";
import { useThemeStore } from "@/store/theme.store";
import { useBoardStore } from "@/store/board.store";
import { toolTypes } from "@/constants";
import { useCanvasTransform } from "@/hooks/useCanvasTransform";
import { useCanvasGrid } from "@/hooks/useCanvasGrid";
import { useCanvasEvents } from "@/hooks/useCanvasEvents";
import { drawTestSquares } from "@/utils/canvas";
import { useCanvasPointerPosition } from "@/hooks/useCanvasPointerPosition";
import { Socket } from "socket.io-client";
import Cursor from "./cursor";

interface CanvasProps {
  socket: Socket | null;
  name: string;
  color: string;
}

const Canvas = ({ socket, name, color }: CanvasProps) => {
  const { theme } = useThemeStore();
  const { tool } = useBoardStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { transform, initializeTransform, updateTransform, transformStyle } =
    useCanvasTransform(canvasRef);

  const { pointerPosition, handlePointerMove } =
    useCanvasPointerPosition(canvasRef);

  const { drawGrid } = useCanvasGrid();

  useEffect(() => {
    if (!socket) return;

    socket.emit("user:cursor-position", {
      x: pointerPosition.x,
      y: pointerPosition.y,
      userId: socket.id,
      name: name,
      color: color,
    });
  }, [socket, pointerPosition, name, color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousemove", handlePointerMove);

    return () => {
      canvas.removeEventListener("mousemove", handlePointerMove);
    };
  }, [handlePointerMove]);

  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp } =
    useCanvasEvents({
      canvasRef,
      transform,
      tool,
      updateTransform,
    });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initializeTransform();
    const ctx = canvas.getContext("2d");
    if (ctx) {
      drawGrid(ctx, canvas, theme);
      drawTestSquares(ctx, canvas);
    }
  }, [theme, initializeTransform, drawGrid]);

  const canvasStyle = useMemo(
    () => ({
      ...transformStyle,
      cursor:
        tool !== toolTypes.HAND ? "default" : isDragging ? "grabbing" : "grab",
    }),
    [transformStyle, tool, isDragging]
  );

  return (
    <div className="w-full h-full overflow-hidden rounded-2xl border-2 border-solid border-spacing-1 border-zinc-900 dark:border-zinc-400 relative">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={canvasStyle}
        className="rounded-2xl bg-zinc-100 dark:bg-zinc-900"
      />
      <Cursor canvasRef={canvasRef} />
    </div>
  );
};

export default Canvas;
