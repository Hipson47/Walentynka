import { describe, expect, it } from "vitest";
import { pickOne, randomInRange } from "../utils/rand";

describe("randomInRange", () => {
  it("returns a value between min and max", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInRange(5, 15);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThan(15);
    }
  });

  it("returns min when min equals max", () => {
    expect(randomInRange(7, 7)).toBe(7);
  });

  it("works with negative ranges", () => {
    for (let i = 0; i < 50; i++) {
      const value = randomInRange(-10, -5);
      expect(value).toBeGreaterThanOrEqual(-10);
      expect(value).toBeLessThan(-5);
    }
  });
});

describe("pickOne", () => {
  it("picks an element from the array", () => {
    const items = ["a", "b", "c"] as const;
    for (let i = 0; i < 50; i++) {
      const picked = pickOne(items);
      expect(items).toContain(picked);
    }
  });

  it("returns the only element for a single-item array", () => {
    expect(pickOne(["only"])).toBe("only");
  });
});
