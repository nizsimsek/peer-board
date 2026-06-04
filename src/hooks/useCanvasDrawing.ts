import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { toolTypes, DRAW_DEFAULTS } from "@/constants";
import { useBoardStore } from "@/store/board.store";
import { BoardElement, Point } from "@/types";
import {
  createId,
  getCanvasPoint,
  getElementAtPosition,
  moveElement,
} from "@/utils/elements";

type Tool = string | null;

interface UseCanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  tool: Tool;
  color: string;
  socket: Socket | null;
}

type Action =
  | { mode: "draw"; element: BoardElement }
  | { mode: "move"; element: BoardElement; lastPoint: Point }
  | { mode: "erase" };

export const useCanvasDrawing = ({
  canvasRef,
  tool,
  color,
  socket,
}: UseCanvasDrawingProps) => {
  const { updateElement, removeElement } = useBoardStore();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const actionRef = useRef<Action | null>(null);

  useEffect(() => {
    if (tool !== toolTypes.SELECTION) setSelectedElementId(null);
  }, [tool]);

  const emitUpdate = useCallback(
    (element: BoardElement) => socket?.emit("element:update", element),
    [socket]
  );

  const emitDelete = useCallback(
    (id: string) => socket?.emit("element:delete", { id }),
    [socket]
  );

  const isDrawingTool =
    tool === toolTypes.SQUARE ||
    tool === toolTypes.LINE ||
    tool === toolTypes.PENCIL;

  const handleDrawStart = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !tool || tool === toolTypes.HAND) return;

      const point = getCanvasPoint(canvas, e.clientX, e.clientY);
      const ctx = canvas.getContext("2d") ?? undefined;

      if (tool === toolTypes.TEXT) {
        const text = window.prompt("Metni girin:");
        if (!text) return;
        const element: BoardElement = {
          id: createId(),
          type: "TEXT",
          color,
          x: point.x,
          y: point.y,
          text,
          fontSize: DRAW_DEFAULTS.fontSize,
        };
        updateElement(element);
        emitUpdate(element);
        return;
      }

      if (tool === toolTypes.SELECTION) {
        const hit = getElementAtPosition(
          point,
          useBoardStore.getState().elements,
          ctx
        );
        if (hit) {
          setSelectedElementId(hit.id);
          actionRef.current = { mode: "move", element: hit, lastPoint: point };
        } else {
          setSelectedElementId(null);
        }
        return;
      }

      if (tool === toolTypes.ERASER) {
        const hit = getElementAtPosition(
          point,
          useBoardStore.getState().elements,
          ctx
        );
        if (hit) {
          removeElement(hit.id);
          emitDelete(hit.id);
        }
        actionRef.current = { mode: "erase" };
        return;
      }

      if (!isDrawingTool) return;

      let element: BoardElement;
      if (tool === toolTypes.PENCIL) {
        element = {
          id: createId(),
          type: "PENCIL",
          color,
          points: [point],
        };
      } else {
        element = {
          id: createId(),
          type: tool === toolTypes.SQUARE ? "SQUARE" : "LINE",
          color,
          x1: point.x,
          y1: point.y,
          x2: point.x,
          y2: point.y,
        };
      }
      updateElement(element);
      emitUpdate(element);
      actionRef.current = { mode: "draw", element };
    },
    [
      canvasRef,
      tool,
      color,
      isDrawingTool,
      updateElement,
      removeElement,
      emitUpdate,
      emitDelete,
    ]
  );

  const handleDrawMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const action = actionRef.current;
      const canvas = canvasRef.current;
      if (!action || !canvas) return;

      const point = getCanvasPoint(canvas, e.clientX, e.clientY);

      if (action.mode === "erase") {
        const ctx = canvas.getContext("2d") ?? undefined;
        const hit = getElementAtPosition(
          point,
          useBoardStore.getState().elements,
          ctx
        );
        if (hit) {
          removeElement(hit.id);
          emitDelete(hit.id);
        }
        return;
      }

      if (action.mode === "move") {
        const dx = point.x - action.lastPoint.x;
        const dy = point.y - action.lastPoint.y;
        const moved = moveElement(action.element, dx, dy);
        updateElement(moved);
        emitUpdate(moved);
        actionRef.current = { mode: "move", element: moved, lastPoint: point };
        return;
      }

      if (action.mode === "draw") {
        let updated: BoardElement;
        if (action.element.type === "PENCIL") {
          updated = {
            ...action.element,
            points: [...action.element.points, point],
          };
        } else if (
          action.element.type === "SQUARE" ||
          action.element.type === "LINE"
        ) {
          updated = { ...action.element, x2: point.x, y2: point.y };
        } else {
          return;
        }
        updateElement(updated);
        emitUpdate(updated);
        actionRef.current = { mode: "draw", element: updated };
      }
    },
    [canvasRef, updateElement, removeElement, emitUpdate, emitDelete]
  );

  const handleDrawEnd = useCallback(() => {
    const action = actionRef.current;
    if (action && action.mode === "draw") {
      emitUpdate(action.element);
    }
    actionRef.current = null;
  }, [emitUpdate]);

  return {
    selectedElementId,
    handleDrawStart,
    handleDrawMove,
    handleDrawEnd,
  };
};
