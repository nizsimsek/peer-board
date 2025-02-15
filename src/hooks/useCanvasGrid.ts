import { useCallback } from "react";
import { GRID_DIMENSIONS, GRID_COLORS } from "@/constants";

export const useCanvasGrid = () => {
  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement,
      theme: string
    ) => {
      const { small: gridSize, large: sectionSize } = GRID_DIMENSIONS;
      ctx.strokeStyle = theme === "dark" ? GRID_COLORS.dark : GRID_COLORS.light;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 0.5;
      const drawLines = (size: number, lineWidth: number) => {
        ctx.lineWidth = lineWidth;

        for (let x = 0; x <= canvas.width; x += size) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        for (let y = 0; y <= canvas.height; y += size) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      };

      drawLines(gridSize, 0.5);
      drawLines(sectionSize, 2);

      ctx.font = "24px Arial";
      ctx.fillStyle = theme === "dark" ? GRID_COLORS.dark : GRID_COLORS.light;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let x = 0; x < canvas.width; x += sectionSize) {
        for (let y = 0; y < canvas.height; y += sectionSize) {
          const coordX = Math.floor(x / sectionSize);
          const coordY = Math.floor(y / sectionSize);
          const text = `${coordX},${coordY}`;
          ctx.fillText(text, x + sectionSize / 2, y + sectionSize / 2);
        }
      }
    },
    []
  );

  return { drawGrid };
};
