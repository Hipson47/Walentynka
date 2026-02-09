export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
