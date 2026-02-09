export type RectLike = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function intersects(a: RectLike, b: RectLike): boolean {
  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

export function inflateRect(rect: RectLike, amount: number): RectLike {
  return {
    left: rect.left - amount,
    right: rect.right + amount,
    top: rect.top - amount,
    bottom: rect.bottom + amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2,
  };
}
