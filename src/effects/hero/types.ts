import type { MotionMode } from "../../hooks/useMotionMode";

export type HeroRenderTier = "high" | "medium" | "low";

export type HeroRenderer = {
  backend: "webgpu" | "webgl2";
  setSize: (width: number, height: number, dpr: number, renderScale: number) => void;
  render: (timeSeconds: number, vNorm: number, motionMode: MotionMode) => void;
  dispose: () => void;
};
