import { useState, useCallback, useEffect } from "react";
import { toolTypes, SCALE_LIMITS } from "@/constants";
import { Transform, Point } from "@/types";

type Tool = string | null;

interface UseCanvasEventsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  transform: Transform;
  tool: Tool;
  updateTransform: (newTransform: Partial<Transform>) => void;
}

interface ContainerDimensions {
  container: { width: number; height: number };
  canvas: { width: number; height: number };
  rect: DOMRect;
}

const ZOOM_INTENSITY = 0.1;

const getContainerDimensions = (
  canvas: HTMLCanvasElement
): ContainerDimensions | null => {
  const container = canvas.parentElement;
  if (!container) return null;

  return {
    container: {
      width: container.clientWidth,
      height: container.clientHeight,
    },
    canvas: {
      width: canvas.width,
      height: canvas.height,
    },
    rect: container.getBoundingClientRect(),
  };
};

const calculateMinScale = (dimensions: ContainerDimensions): number => {
  const { container, canvas } = dimensions;
  const minScaleX = container.width / canvas.width;
  const minScaleY = container.height / canvas.height;
  return Math.max(minScaleX, minScaleY);
};

const calculateNewScale = (
  currentScale: number,
  deltaY: number,
  minScale: number
): number => {
  const delta = -Math.sign(deltaY) * ZOOM_INTENSITY;
  const newScale = currentScale * Math.exp(delta);
  return Math.min(Math.max(newScale, minScale), SCALE_LIMITS.max);
};

const calculateNewPosition = (
  mousePoint: Point,
  transform: Transform,
  newScale: number,
  dimensions: ContainerDimensions
): { x: number; y: number } => {
  const { container, canvas } = dimensions;
  
  const canvasX = (mousePoint.x - transform.x) / transform.scale;
  const canvasY = (mousePoint.y - transform.y) / transform.scale;

  let newX = mousePoint.x - canvasX * newScale;
  let newY = mousePoint.y - canvasY * newScale;

  const minScale = calculateMinScale(dimensions);
  if (newScale <= minScale) {
    const scaledWidth = canvas.width * newScale;
    const scaledHeight = canvas.height * newScale;
    newX = (container.width - scaledWidth) / 2;
    newY = (container.height - scaledHeight) / 2;
  }

  return { x: newX, y: newY };
};

export const useCanvasEvents = ({
  canvasRef,
  transform,
  tool,
  updateTransform,
}: UseCanvasEventsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dimensions = getContainerDimensions(canvas);
      if (!dimensions) return;

      const mousePoint = {
        x: e.clientX - dimensions.rect.left,
        y: e.clientY - dimensions.rect.top,
      };

      const minScale = calculateMinScale(dimensions);
      const newScale = calculateNewScale(transform.scale, e.deltaY, minScale);
      
      if (newScale === transform.scale) return;

      const newPosition = calculateNewPosition(
        mousePoint,
        transform,
        newScale,
        dimensions
      );

      updateTransform({
        ...newPosition,
        scale: newScale,
      });
    },
    [transform, updateTransform, canvasRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (tool !== toolTypes.HAND) return;
      setIsDragging(true);
      setDragStart({
        x: e.clientX - transform.x,
        y: e.clientY - transform.y,
      });
    },
    [tool, transform.x, transform.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;

      updateTransform({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart, updateTransform]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseUp);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [handleWheel, handleMouseUp, canvasRef]);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
