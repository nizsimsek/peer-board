import { useRef, useEffect, useMemo, useCallback } from "react";
import { useThemeStore } from "@/store/theme.store";
import { useBoardStore } from "@/store/board.store";
import { toolTypes } from "@/constants";
import { useCanvasTransform } from "@/hooks/useCanvasTransform";
import { useCanvasGrid } from "@/hooks/useCanvasGrid";
import { useCanvasEvents } from "@/hooks/useCanvasEvents";
import { useCanvasDrawing } from "@/hooks/useCanvasDrawing";
import { drawElement, drawSelectionBox } from "@/utils/elements";
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
  const { tool, elements } = useBoardStore();
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

  const {
    selectedElementId,
    handleDrawStart,
    handleDrawMove,
    handleDrawEnd,
  } = useCanvasDrawing({ canvasRef, tool, color, socket });

  useEffect(() => {
    initializeTransform();
  }, [initializeTransform]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawGrid(ctx, canvas, theme);
    elements.forEach((element) => drawElement(ctx, element));

    if (selectedElementId) {
      const selected = elements.find((el) => el.id === selectedElementId);
      if (selected) drawSelectionBox(ctx, selected);
    }
  }, [drawGrid, theme, elements, selectedElementId]);

  useEffect(() => {
    redraw();
  }, [redraw, transform]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleMouseDown(e);
      handleDrawStart(e);
    },
    [handleMouseDown, handleDrawStart]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleMouseMove(e);
      handleDrawMove(e);
    },
    [handleMouseMove, handleDrawMove]
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleMouseUp();
      handleDrawEnd();
      void e;
    },
    [handleMouseUp, handleDrawEnd]
  );

  useEffect(() => {
    window.addEventListener("mouseup", handleDrawEnd);
    return () => window.removeEventListener("mouseup", handleDrawEnd);
  }, [handleDrawEnd]);

  const cursorStyle = useMemo(() => {
    if (tool === toolTypes.HAND) return isDragging ? "grabbing" : "grab";
    if (
      tool === toolTypes.SQUARE ||
      tool === toolTypes.LINE ||
      tool === toolTypes.PENCIL
    )
      return "crosshair";
    if (tool === toolTypes.TEXT) return "text";
    if (tool === toolTypes.ERASER) return "cell";
    if (tool === toolTypes.SELECTION) return "move";
    return "default";
  }, [tool, isDragging]);

  const canvasStyle = useMemo(
    () => ({
      ...transformStyle,
      cursor: cursorStyle,
    }),
    [transformStyle, cursorStyle]
  );

  return (
    <div className="w-full h-full overflow-hidden rounded-2xl border-2 border-solid border-spacing-1 border-zinc-900 dark:border-zinc-400 relative">
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        style={canvasStyle}
        className="rounded-2xl bg-zinc-100 dark:bg-zinc-900"
      />
      <Cursor canvasRef={canvasRef} />
    </div>
  );
};

export default Canvas;
