import { useState } from "react";

export const useCanvasPointerPosition = (
  canvasRef: React.RefObject<HTMLCanvasElement>
) => {
  const [pointerPosition, setPointerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const handlePointerMove = (
    event: MouseEvent | React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    setPointerPosition({ x: Math.floor(x), y: Math.floor(y) });
  };

  return { pointerPosition, handlePointerMove };
};
