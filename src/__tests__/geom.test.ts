import { describe, expect, it } from "vitest";
import { clamp, inflateRect, intersects, type RectLike } from "../utils/geom";

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("handles equal min and max", () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it("handles boundary values exactly", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("intersects", () => {
  const rectA: RectLike = { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 };

  it("returns true for overlapping rectangles", () => {
    const rectB: RectLike = { left: 50, top: 50, right: 150, bottom: 150, width: 100, height: 100 };
    expect(intersects(rectA, rectB)).toBe(true);
  });

  it("returns true when one contains the other", () => {
    const rectB: RectLike = { left: 20, top: 20, right: 80, bottom: 80, width: 60, height: 60 };
    expect(intersects(rectA, rectB)).toBe(true);
  });

  it("returns false for non-overlapping rectangles (horizontal)", () => {
    const rectB: RectLike = { left: 200, top: 0, right: 300, bottom: 100, width: 100, height: 100 };
    expect(intersects(rectA, rectB)).toBe(false);
  });

  it("returns false for non-overlapping rectangles (vertical)", () => {
    const rectB: RectLike = { left: 0, top: 200, right: 100, bottom: 300, width: 100, height: 100 };
    expect(intersects(rectA, rectB)).toBe(false);
  });

  it("returns false for edge-touching rectangles", () => {
    const rectB: RectLike = { left: 100, top: 0, right: 200, bottom: 100, width: 100, height: 100 };
    expect(intersects(rectA, rectB)).toBe(false);
  });
});

describe("inflateRect", () => {
  const rect: RectLike = { left: 10, top: 20, right: 110, bottom: 120, width: 100, height: 100 };

  it("expands the rect by the given amount", () => {
    const result = inflateRect(rect, 10);
    expect(result.left).toBe(0);
    expect(result.top).toBe(10);
    expect(result.right).toBe(120);
    expect(result.bottom).toBe(130);
    expect(result.width).toBe(120);
    expect(result.height).toBe(120);
  });

  it("shrinks the rect with negative amount", () => {
    const result = inflateRect(rect, -5);
    expect(result.left).toBe(15);
    expect(result.top).toBe(25);
    expect(result.right).toBe(105);
    expect(result.bottom).toBe(115);
    expect(result.width).toBe(90);
    expect(result.height).toBe(90);
  });

  it("returns same rect with zero amount", () => {
    const result = inflateRect(rect, 0);
    expect(result.left).toBe(rect.left);
    expect(result.right).toBe(rect.right);
    expect(result.width).toBe(rect.width);
  });
});
