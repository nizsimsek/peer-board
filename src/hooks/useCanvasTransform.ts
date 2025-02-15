import { useState, useCallback, useMemo, useEffect } from "react";
import { CANVAS_DIMENSIONS, SCALE_LIMITS } from "@/constants";
import { Transform, ContainerSize, CanvasSize } from "@/types";

const calculateInitialScale = (
  container: ContainerSize,
  canvas: CanvasSize
): number => {
  const scaleX = container.width / canvas.width;
  const scaleY = container.height / canvas.height;
  return Math.max(scaleX, scaleY);
};

const calculateCenteredPosition = (
  container: ContainerSize,
  canvas: CanvasSize,
  scale: number
): Pick<Transform, "x" | "y"> => ({
  x: (container.width - canvas.width * scale) / 2,
  y: (container.height - canvas.height * scale) / 2,
});

const calculateBoundedPosition = (
  container: ContainerSize,
  canvas: CanvasSize,
  scale: number,
  position: Pick<Transform, "x" | "y">
): Pick<Transform, "x" | "y"> => {
  const scaledWidth = canvas.width * scale;
  const scaledHeight = canvas.height * scale;
  const minX = container.width - scaledWidth;
  const minY = container.height - scaledHeight;

  return {
    x: Math.min(0, Math.max(minX, position.x)),
    y: Math.min(0, Math.max(minY, position.y)),
  };
};

export const useCanvasTransform = (
  canvasRef: React.RefObject<HTMLCanvasElement>
) => {
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    x: 0,
    y: 0,
  });

  const getCanvasAndContainer = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;

    if (!canvas || !container) {
      return null;
    }

    return {
      canvas: {
        width: CANVAS_DIMENSIONS.width,
        height: CANVAS_DIMENSIONS.height,
      },
      container: {
        width: container.clientWidth,
        height: container.clientHeight,
      },
    };
  }, []);

  const initializeTransform = useCallback(() => {
    const sizes = getCanvasAndContainer();
    if (!sizes) return;

    const { canvas, container } = sizes;

    if (canvasRef.current) {
      canvasRef.current.width = CANVAS_DIMENSIONS.width;
      canvasRef.current.height = CANVAS_DIMENSIONS.height;
    }

    const initialScale = calculateInitialScale(container, canvas);
    const position = calculateCenteredPosition(container, canvas, initialScale);

    setTransform({
      scale: initialScale,
      ...position,
    });
  }, [getCanvasAndContainer]);

  const updateTransform = useCallback(
    (newTransform: Partial<Transform>) => {
      setTransform((prev) => {
        const sizes = getCanvasAndContainer();
        if (!sizes) return prev;

        const { canvas, container } = sizes;
        const next = { ...prev, ...newTransform };

        next.scale = Math.min(
          Math.max(next.scale, SCALE_LIMITS.min),
          SCALE_LIMITS.max
        );

        const boundedPosition = calculateBoundedPosition(
          container,
          canvas,
          next.scale,
          { x: next.x, y: next.y }
        );

        return { ...next, ...boundedPosition };
      });
    },
    [getCanvasAndContainer]
  );

  useEffect(() => {
    const handleResize = () => {
      const sizes = getCanvasAndContainer();
      if (!sizes) return;

      const { canvas, container } = sizes;
      const minScale = calculateInitialScale(container, canvas);

      if (transform.scale < minScale) {
        const position = calculateCenteredPosition(container, canvas, minScale);
        setTransform({
          scale: minScale,
          ...position,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [transform.scale, getCanvasAndContainer]);

  const transformStyle = useMemo(
    () => ({
      width: `${CANVAS_DIMENSIONS.width}px`,
      height: `${CANVAS_DIMENSIONS.height}px`,
      transform: `matrix(${transform.scale}, 0, 0, ${transform.scale}, ${transform.x}, ${transform.y})`,
      transformOrigin: "0 0",
    }),
    [transform]
  );

  return {
    transform,
    setTransform,
    initializeTransform,
    updateTransform,
    transformStyle,
  };
};
