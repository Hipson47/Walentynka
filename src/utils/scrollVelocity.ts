export type ScrollVelocityState = {
  lastPos: number;
  lastTs: number;
  vRaw: number;
  vSmooth: number;
  vNorm: number;
};

export type ScrollVelocityParams = {
  lambda: number;
  lambdaDecay: number;
  maxVelocityPxPerS: number;
  vMinThresholdPxPerS: number;
};

export const DEFAULT_SCROLL_VELOCITY_PARAMS: ScrollVelocityParams = {
  lambda: 18,
  lambdaDecay: 9,
  maxVelocityPxPerS: 2800,
  vMinThresholdPxPerS: 40,
};

const MIN_DT_SECONDS = 0.008;
const MAX_DT_SECONDS = 0.05;

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function smoothingFactor(lambda: number, dtSeconds: number): number {
  if (dtSeconds <= 0) return 0;
  return 1 - Math.exp(-lambda * dtSeconds);
}

function clampDtSeconds(dtSeconds: number): number {
  if (dtSeconds <= 0) return 0;
  return Math.min(MAX_DT_SECONDS, Math.max(MIN_DT_SECONDS, dtSeconds));
}

function toNorm(vSmooth: number, maxVelocityPxPerS: number, vMinThresholdPxPerS: number): number {
  if (maxVelocityPxPerS <= 0) return 0;
  const absVelocity = Math.abs(vSmooth);
  if (absVelocity <= vMinThresholdPxPerS) return 0;
  const range = Math.max(1, maxVelocityPxPerS - vMinThresholdPxPerS);
  return clamp01((absVelocity - vMinThresholdPxPerS) / range);
}

export function createScrollVelocityState(pos: number, ts: number): ScrollVelocityState {
  return {
    lastPos: pos,
    lastTs: ts,
    vRaw: 0,
    vSmooth: 0,
    vNorm: 0,
  };
}

export function stepScrollVelocity(
  state: ScrollVelocityState,
  nextPos: number,
  nextTs: number,
  params: ScrollVelocityParams,
): ScrollVelocityState {
  const dtSeconds = clampDtSeconds((nextTs - state.lastTs) / 1000);
  if (dtSeconds <= 0) {
    return { ...state, lastPos: nextPos, lastTs: nextTs };
  }

  const vRaw = (nextPos - state.lastPos) / dtSeconds;
  const a = smoothingFactor(params.lambda, dtSeconds);
  const vSmooth = state.vSmooth + (vRaw - state.vSmooth) * a;

  return {
    lastPos: nextPos,
    lastTs: nextTs,
    vRaw,
    vSmooth,
    vNorm: toNorm(vSmooth, params.maxVelocityPxPerS, params.vMinThresholdPxPerS),
  };
}

export function decayScrollVelocity(
  state: ScrollVelocityState,
  nextTs: number,
  params: ScrollVelocityParams,
): ScrollVelocityState {
  const dtSeconds = clampDtSeconds((nextTs - state.lastTs) / 1000);
  if (dtSeconds <= 0) {
    return { ...state, lastTs: nextTs };
  }

  const aDecay = smoothingFactor(params.lambdaDecay, dtSeconds);
  const vSmooth = state.vSmooth + (0 - state.vSmooth) * aDecay;

  return {
    lastPos: state.lastPos,
    lastTs: nextTs,
    vRaw: 0,
    vSmooth,
    vNorm: toNorm(vSmooth, params.maxVelocityPxPerS, params.vMinThresholdPxPerS),
  };
}
