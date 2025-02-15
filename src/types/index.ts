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
