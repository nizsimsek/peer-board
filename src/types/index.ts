export interface Transform {
  scale: number;
  x: number;
  y: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface ContainerSize {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface UserEvent {
  userId: string;
  roomId: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export type ElementType = "SQUARE" | "LINE" | "PENCIL" | "TEXT";

interface BaseElement {
  id: string;
  type: ElementType;
  color: string;
}

export interface ShapeElement extends BaseElement {
  type: "SQUARE" | "LINE";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PencilElement extends BaseElement {
  type: "PENCIL";
  points: Point[];
}

export interface TextElement extends BaseElement {
  type: "TEXT";
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export type BoardElement = ShapeElement | PencilElement | TextElement;
