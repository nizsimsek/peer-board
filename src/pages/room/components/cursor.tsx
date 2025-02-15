import { useCursorStore } from "@/store/cursors.store";
import { MousePointer2 } from "lucide-react";
import { RefObject } from "react";

interface CursorProps {
  canvasRef: RefObject<HTMLCanvasElement>;
}

const Cursor = ({ canvasRef }: CursorProps) => {
  const { cursors } = useCursorStore();

  const getCursorPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    const canvasLeft = rect.left + window.scrollX;
    const canvasTop = rect.top + window.scrollY;

    const viewportX = (x / 5000) * rect.width + canvasLeft;
    const viewportY = (y / 5000) * rect.height + canvasTop;

    return { viewportX, viewportY };
  };

  return (
    <>
      {cursors.map((c, index) => {
        const position = getCursorPosition(c.x, c.y);
        if (!position) return null;
        const { viewportX, viewportY } = position;

        if (
          (viewportX === 0 && viewportY === 0) ||
          isNaN(viewportX) ||
          isNaN(viewportY)
        )
          return null;

        return (
          <div
            key={index}
            style={{
              position: "fixed",
              left: viewportX,
              top: viewportY,
              pointerEvents: "none",
              zIndex: 1000,
              display: "flex",
              alignItems: "flex-start",
              gap: "4px",
            }}
          >
            <MousePointer2
              style={{
                width: "30px",
                height: "30px",
              }}
              color={c.color}
            />
            <span
              style={{
                backgroundColor: c.color,
                padding: "2px 6px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                marginTop: "8px",
              }}
            >
              {c.name}
            </span>
          </div>
        );
      })}
    </>
  );
};

export default Cursor;
