import { useRef, useState, useEffect } from "react";
import { useThemeStore } from "@/store/theme.store.ts";
import { useBoardStore } from "@/store/board.store";
import { toolTypes } from "@/constants";

interface Transform {
  scale: number;
  x: number;
  y: number;
}

const Canvas = () => {
  const { theme } = useThemeStore();
  const { tool } = useBoardStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    x: 0,
    y: 0,
  });

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const gridSize = 100;
    const sectionSize = 500;

    if (theme === "dark") {
      ctx.strokeStyle = "#E5E7EB";
    } else {
      ctx.strokeStyle = "#374151";
    }

    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.lineWidth = 2;
    for (let x = 0; x <= canvas.width; x += sectionSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += sectionSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = 5000;
    canvas.height = 5000;

    const scaleX = container.clientWidth / canvas.width;
    const scaleY = container.clientHeight / canvas.height;
    const initialScale = Math.max(scaleX, scaleY);

    setTransform({
      scale: initialScale,
      x: (container.clientWidth - canvas.width * initialScale) / 2,
      y: (container.clientHeight - canvas.height * initialScale) / 2,
    });

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid(ctx, canvas);

      const squareSize = 100;
      const centerX = canvas.width / 2 - squareSize / 2;
      const centerY = canvas.height / 2 - squareSize / 2;

      ctx.fillStyle = "black";
      ctx.fillRect(centerX, centerY, squareSize, squareSize);
    }
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomIntensity = 0.1;
      const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
      const newScale = transform.scale * (1 + delta);

      const minScaleX = container.clientWidth / canvas.width;
      const minScaleY = container.clientHeight / canvas.height;
      const minScale = Math.max(minScaleX, minScaleY);

      if (newScale < minScale || newScale > 5) return;

      let newX, newY;

      if (e.deltaY > 0) {
        const canvasX = (mouseX - transform.x) / transform.scale;
        const canvasY = (mouseY - transform.y) / transform.scale;

        newX = mouseX - canvasX * newScale;
        newY = mouseY - canvasY * newScale;

        if (newScale <= minScale) {
          const scaledWidth = canvas.width * newScale;
          const scaledHeight = canvas.height * newScale;
          newX = (container.clientWidth - scaledWidth) / 2;
          newY = (container.clientHeight - scaledHeight) / 2;
        }
      } else {
        const canvasX = (mouseX - transform.x) / transform.scale;
        const canvasY = (mouseY - transform.y) / transform.scale;

        newX = mouseX - canvasX * newScale;
        newY = mouseY - canvasY * newScale;
      }

      const scaledWidth = canvas.width * newScale;
      const scaledHeight = canvas.height * newScale;
      const minX = container.clientWidth - scaledWidth;
      const minY = container.clientHeight - scaledHeight;

      const constrainedX = Math.min(0, Math.max(minX, newX));
      const constrainedY = Math.min(0, Math.max(minY, newY));

      setTransform({
        scale: newScale,
        x: constrainedX,
        y: constrainedY,
      });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [transform]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const scaleX = container.clientWidth / canvas.width;
      const scaleY = container.clientHeight / canvas.height;
      const minScale = Math.max(scaleX, scaleY);

      if (transform.scale < minScale) {
        const scaledWidth = canvas.width * minScale;
        const scaledHeight = canvas.height * minScale;

        setTransform({
          scale: minScale,
          x: (container.clientWidth - scaledWidth) / 2,
          y: (container.clientHeight - scaledHeight) / 2,
        });
      } else {
        const scaledWidth = canvas.width * transform.scale;
        const scaledHeight = canvas.height * transform.scale;

        const minX = container.clientWidth - scaledWidth;
        const minY = container.clientHeight - scaledHeight;

        const newX = Math.min(0, Math.max(minX, transform.x));
        const newY = Math.min(0, Math.max(minY, transform.y));

        if (newX !== transform.x || newY !== transform.y) {
          setTransform((prev) => ({
            ...prev,
            x: newX,
            y: newY,
          }));
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [transform]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== toolTypes.HAND) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    const scaledWidth = canvas.width * transform.scale;
    const scaledHeight = canvas.height * transform.scale;

    const minX = container.clientWidth - scaledWidth;
    const minY = container.clientHeight - scaledHeight;

    newX = Math.min(0, Math.max(minX, newX));
    newY = Math.min(0, Math.max(minY, newY));

    setTransform((prev) => ({
      ...prev,
      x: newX,
      y: newY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
    };
  }, []);

  return (
    <div className="w-full h-full overflow-hidden rounded-2xl">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          width: "5000px",
          height: "5000px",
          transform: `matrix(${transform.scale}, 0, 0, ${transform.scale}, ${transform.x}, ${transform.y})`,
          transformOrigin: "0 0",
          cursor:
            tool !== toolTypes.HAND
              ? "default"
              : isDragging
              ? "grabbing"
              : "grab",
        }}
        className="rounded-2xl bg-zinc-100 dark:bg-zinc-900"
      />
    </div>
  );
};

export default Canvas;
