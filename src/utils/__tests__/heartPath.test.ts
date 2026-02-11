import { describe, expect, it } from "vitest";
import { heartXY } from "../heartPath";

describe("heartXY", () => {
  it("returns finite values for key progress points", () => {
    const a0 = heartXY(0);
    const aQuarter = heartXY(Math.PI * 0.5);
    const aFull = heartXY(Math.PI * 2);

    expect(Number.isFinite(a0.x)).toBe(true);
    expect(Number.isFinite(a0.y)).toBe(true);
    expect(Number.isFinite(aQuarter.x)).toBe(true);
    expect(Number.isFinite(aQuarter.y)).toBe(true);
    expect(Number.isFinite(aFull.x)).toBe(true);
    expect(Number.isFinite(aFull.y)).toBe(true);
  });

  it("starts and ends near the same point", () => {
    const start = heartXY(0);
    const end = heartXY(Math.PI * 2);
    expect(Math.abs(start.x - end.x)).toBeLessThan(0.0001);
    expect(Math.abs(start.y - end.y)).toBeLessThan(0.0001);
  });

  it("has positive x at quarter turn", () => {
    const quarter = heartXY(Math.PI * 0.5);
    expect(quarter.x).toBeGreaterThan(0);
  });
});
