import { useState, useCallback, useMemo } from "react";
import { CANVAS_DIMENSIONS, SCALE_LIMITS } from "@/constants";
import { Transform, ContainerSize, CanvasSize } from "@/types";

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

    return canvas && container
      ? {
          canvas: {
            width: CANVAS_DIMENSIONS.width,
            height: CANVAS_DIMENSIONS.height,
          },
          container: {
            width: container.clientWidth,
            height: container.clientHeight,
          },
        }
      : null;
  }, []);

  const calculatePosition = useCallback(
    (
      container: ContainerSize,
      canvas: CanvasSize,
      scale: number,
      position?: Pick<Transform, "x" | "y">,
      center = false
    ): Pick<Transform, "x" | "y"> => {
      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;

      if (center) {
        return {
          x: (container.width - scaledWidth) / 2,
          y: (container.height - scaledHeight) / 2,
        };
      }

      const minX = container.width - scaledWidth;
      const minY = container.height - scaledHeight;

      return {
        x: Math.min(0, Math.max(minX, position?.x ?? 0)),
        y: Math.min(0, Math.max(minY, position?.y ?? 0)),
      };
    },
    []
  );

  const initializeTransform = useCallback(() => {
    const sizes = getCanvasAndContainer();
    if (!sizes) return;

    if (canvasRef.current) {
      canvasRef.current.width = CANVAS_DIMENSIONS.width;
      canvasRef.current.height = CANVAS_DIMENSIONS.height;
    }

    const initialScale = 0.6;
    const position = calculatePosition(
      sizes.container,
      sizes.canvas,
      initialScale,
      undefined,
      true
    );
    setTransform({ scale: initialScale, ...position });
  }, [getCanvasAndContainer, calculatePosition]);

  const updateTransform = useCallback(
    (newTransform: Partial<Transform>) => {
      setTransform((prev) => {
        const sizes = getCanvasAndContainer();
        if (!sizes) return prev;

        const scale = Math.min(
          Math.max(newTransform.scale ?? prev.scale, SCALE_LIMITS.min),
          SCALE_LIMITS.max
        );
        const position = calculatePosition(
          sizes.container,
          sizes.canvas,
          scale,
          {
            x: newTransform.x ?? prev.x,
            y: newTransform.y ?? prev.y,
          }
        );

        return { scale, ...position };
      });
    },
    [getCanvasAndContainer, calculatePosition]
  );

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
