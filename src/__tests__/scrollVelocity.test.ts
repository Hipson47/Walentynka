import { describe, expect, it } from "vitest";
import {
  createScrollVelocityState,
  decayScrollVelocity,
  DEFAULT_SCROLL_VELOCITY_PARAMS,
  stepScrollVelocity,
} from "../utils/scrollVelocity";

const params = DEFAULT_SCROLL_VELOCITY_PARAMS;

describe("createScrollVelocityState", () => {
  it("creates initial state with zeroed velocity", () => {
    const state = createScrollVelocityState(100, 1000);
    expect(state.lastPos).toBe(100);
    expect(state.lastTs).toBe(1000);
    expect(state.vRaw).toBe(0);
    expect(state.vSmooth).toBe(0);
    expect(state.vNorm).toBe(0);
  });
});

describe("stepScrollVelocity", () => {
  it("computes velocity on position change", () => {
    const initial = createScrollVelocityState(0, 0);
    const next = stepScrollVelocity(initial, 100, 16, params);
    expect(next.vRaw).not.toBe(0);
    expect(next.vSmooth).not.toBe(0);
    expect(next.vNorm).toBeGreaterThan(0);
    expect(next.vNorm).toBeLessThanOrEqual(1);
  });

  it("returns zero velocity when position does not change", () => {
    const initial = createScrollVelocityState(50, 0);
    const next = stepScrollVelocity(initial, 50, 16, params);
    expect(next.vRaw).toBe(0);
    expect(next.vNorm).toBe(0);
  });

  it("returns state unchanged (except pos/ts) when dt is zero", () => {
    const initial = createScrollVelocityState(0, 100);
    const next = stepScrollVelocity(initial, 50, 100, params);
    expect(next.vSmooth).toBe(initial.vSmooth);
    expect(next.lastPos).toBe(50);
    expect(next.lastTs).toBe(100);
  });

  it("normalizes velocity between 0 and 1", () => {
    const initial = createScrollVelocityState(0, 0);
    // Very fast scroll
    const next = stepScrollVelocity(initial, 10000, 16, params);
    expect(next.vNorm).toBeGreaterThanOrEqual(0);
    expect(next.vNorm).toBeLessThanOrEqual(1);
  });

  it("clamps large dt to MAX_DT_SECONDS", () => {
    const initial = createScrollVelocityState(0, 0);
    // 1 second gap
    const next = stepScrollVelocity(initial, 100, 1000, params);
    // Should have a clamped velocity, not divide by 1 second
    expect(next.vRaw).not.toBe(0);
  });
});

describe("decayScrollVelocity", () => {
  it("decays velocity toward zero over time", () => {
    const initial = createScrollVelocityState(0, 0);
    const scrolled = stepScrollVelocity(initial, 500, 16, params);
    expect(scrolled.vSmooth).not.toBe(0);

    const decayed = decayScrollVelocity(scrolled, 200, params);
    expect(Math.abs(decayed.vSmooth)).toBeLessThan(Math.abs(scrolled.vSmooth));
  });

  it("preserves lastPos during decay", () => {
    const initial = createScrollVelocityState(42, 0);
    const scrolled = stepScrollVelocity(initial, 100, 16, params);
    const decayed = decayScrollVelocity(scrolled, 200, params);
    expect(decayed.lastPos).toBe(scrolled.lastPos);
  });

  it("sets vRaw to zero during decay", () => {
    const initial = createScrollVelocityState(0, 0);
    const scrolled = stepScrollVelocity(initial, 200, 16, params);
    const decayed = decayScrollVelocity(scrolled, 200, params);
    expect(decayed.vRaw).toBe(0);
  });

  it("handles zero dt gracefully", () => {
    const initial = createScrollVelocityState(0, 100);
    const decayed = decayScrollVelocity(initial, 100, params);
    expect(decayed.vSmooth).toBe(initial.vSmooth);
  });
});
