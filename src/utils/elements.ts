import { getStroke } from "perfect-freehand";
import { DRAW_DEFAULTS } from "@/constants";
import { BoardElement, Point } from "@/types";

export const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const getCanvasPoint = (
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): Point => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
};

const getStrokePathPoints = (points: Point[]): number[][] => {
  const stroke = getStroke(
    points.map((p) => [p.x, p.y]),
    {
      size: DRAW_DEFAULTS.strokeWidth * 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    }
  );
  return stroke;
};

export const drawElement = (
  ctx: CanvasRenderingContext2D,
  element: BoardElement
) => {
  ctx.save();
  ctx.strokeStyle = element.color;
  ctx.fillStyle = element.color;
  ctx.lineWidth = DRAW_DEFAULTS.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (element.type) {
    case "SQUARE": {
      const x = Math.min(element.x1, element.x2);
      const y = Math.min(element.y1, element.y2);
      const w = Math.abs(element.x2 - element.x1);
      const h = Math.abs(element.y2 - element.y1);
      ctx.strokeRect(x, y, w, h);
      break;
    }
    case "LINE": {
      ctx.beginPath();
      ctx.moveTo(element.x1, element.y1);
      ctx.lineTo(element.x2, element.y2);
      ctx.stroke();
      break;
    }
    case "PENCIL": {
      if (element.points.length === 0) break;
      const stroke = getStrokePathPoints(element.points);
      if (stroke.length === 0) break;
      ctx.beginPath();
      stroke.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "TEXT": {
      ctx.font = `${element.fontSize}px Arial`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText(element.text, element.x, element.y);
      break;
    }
  }

  ctx.restore();
};

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const getElementBounds = (
  element: BoardElement,
  ctx?: CanvasRenderingContext2D
): Bounds => {
  switch (element.type) {
    case "SQUARE":
    case "LINE":
      return {
        minX: Math.min(element.x1, element.x2),
        minY: Math.min(element.y1, element.y2),
        maxX: Math.max(element.x1, element.x2),
        maxY: Math.max(element.y1, element.y2),
      };
    case "PENCIL": {
      const xs = element.points.map((p) => p.x);
      const ys = element.points.map((p) => p.y);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    case "TEXT": {
      let width = element.text.length * element.fontSize * 0.5;
      if (ctx) {
        ctx.font = `${element.fontSize}px Arial`;
        width = ctx.measureText(element.text).width;
      }
      return {
        minX: element.x,
        minY: element.y,
        maxX: element.x + width,
        maxY: element.y + element.fontSize,
      };
    }
  }
};

const distanceToSegment = (p: Point, a: Point, b: Point): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
};

const isPointHittingElement = (
  point: Point,
  element: BoardElement,
  ctx?: CanvasRenderingContext2D
): boolean => {
  const threshold = DRAW_DEFAULTS.hitThreshold;

  switch (element.type) {
    case "LINE":
      return (
        distanceToSegment(
          point,
          { x: element.x1, y: element.y1 },
          { x: element.x2, y: element.y2 }
        ) <= threshold
      );
    case "PENCIL":
      return element.points.some(
        (p) => Math.hypot(p.x - point.x, p.y - point.y) <= threshold
      );
    case "SQUARE":
    case "TEXT": {
      const b = getElementBounds(element, ctx);
      return (
        point.x >= b.minX - threshold &&
        point.x <= b.maxX + threshold &&
        point.y >= b.minY - threshold &&
        point.y <= b.maxY + threshold
      );
    }
  }
};

export const getElementAtPosition = (
  point: Point,
  elements: BoardElement[],
  ctx?: CanvasRenderingContext2D
): BoardElement | null => {
  for (let i = elements.length - 1; i >= 0; i--) {
    if (isPointHittingElement(point, elements[i], ctx)) return elements[i];
  }
  return null;
};

export const moveElement = (
  element: BoardElement,
  dx: number,
  dy: number
): BoardElement => {
  switch (element.type) {
    case "SQUARE":
    case "LINE":
      return {
        ...element,
        x1: element.x1 + dx,
        y1: element.y1 + dy,
        x2: element.x2 + dx,
        y2: element.y2 + dy,
      };
    case "PENCIL":
      return {
        ...element,
        points: element.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
      };
    case "TEXT":
      return { ...element, x: element.x + dx, y: element.y + dy };
  }
};

export const drawSelectionBox = (
  ctx: CanvasRenderingContext2D,
  element: BoardElement
) => {
  const b = getElementBounds(element, ctx);
  const padding = 8;
  ctx.save();
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(
    b.minX - padding,
    b.minY - padding,
    b.maxX - b.minX + padding * 2,
    b.maxY - b.minY + padding * 2
  );
  ctx.restore();
};
