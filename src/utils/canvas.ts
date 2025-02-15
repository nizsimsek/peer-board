export const drawTestSquares = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => {
  const squareSize = 98;
  const centerX = canvas.width / 2 - squareSize / 2;
  const centerY = canvas.height / 2 - squareSize / 2;
  const offset = 50;

  const squares = [
    { color: "yellow", x: centerX - offset, y: centerY - offset },
    { color: "red", x: centerX + offset, y: centerY - offset },
    { color: "blue", x: centerX - offset, y: centerY + offset },
    { color: "green", x: centerX + offset, y: centerY + offset },
  ];

  squares.forEach(({ color, x, y }) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, squareSize, squareSize);
  });
}; 