export type HeartPoint = {
  x: number;
  y: number;
};

// Parametric heart curve used by intro envelope path.
export function heartXY(angleRad: number): HeartPoint {
  return {
    x: 16 * Math.pow(Math.sin(angleRad), 3),
    y:
      13 * Math.cos(angleRad) -
      5 * Math.cos(2 * angleRad) -
      2 * Math.cos(3 * angleRad) -
      Math.cos(4 * angleRad),
  };
}
