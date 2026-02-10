import { useEffect, useRef, useState } from "react";
import type { MotionMode } from "../hooks/useMotionMode";
import { CssHeroFallback } from "./hero/CssHeroFallback";
import { createWebGL2HeroRenderer } from "./hero/WebGL2HeroRenderer";
import { createWebGPUHeroRenderer } from "./hero/WebGPUHeroRenderer";
import type { HeroRenderer, HeroRenderTier } from "./hero/types";

type HeroPlaneProps = {
  heroImageSrc: string;
  motionMode: MotionMode;
  vNorm: number;
  isIntroVisible: boolean;
  enableWebGPU?: boolean;
  debugEnabled?: boolean;
  onDiagnostics?: (diagnostics: { tier: HeroRenderTier; backend: Backend }) => void;
};

type Backend = "webgpu" | "webgl2" | "css" | "static";

type TierConfig = {
  dprCap: number;
  renderScale: number;
  targetFps: number;
  minAcceptableFps: number;
};

const TIER_ORDER: HeroRenderTier[] = ["high", "medium", "low"];

const TIER_CONFIG: Record<HeroRenderTier, TierConfig> = {
  high: { dprCap: 2, renderScale: 1, targetFps: 60, minAcceptableFps: 42 },
  medium: { dprCap: 1.6, renderScale: 0.86, targetFps: 56, minAcceptableFps: 38 },
  low: { dprCap: 1.25, renderScale: 0.72, targetFps: 50, minAcceptableFps: 32 },
};

const TIER_PRIORITY: Record<HeroRenderTier, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function nextTier(currentTier: HeroRenderTier): HeroRenderTier {
  const idx = TIER_ORDER.indexOf(currentTier);
  return TIER_ORDER[Math.min(TIER_ORDER.length - 1, idx + 1)];
}

function previousTier(currentTier: HeroRenderTier): HeroRenderTier {
  const idx = TIER_ORDER.indexOf(currentTier);
  return TIER_ORDER[Math.max(0, idx - 1)];
}

function clampTierByMaxTier(candidateTier: HeroRenderTier, maxTier: HeroRenderTier): HeroRenderTier {
  if (TIER_PRIORITY[candidateTier] > TIER_PRIORITY[maxTier]) return maxTier;
  return candidateTier;
}

export function HeroPlane({
  heroImageSrc,
  motionMode,
  vNorm,
  isIntroVisible,
  enableWebGPU = false,
  debugEnabled = false,
  onDiagnostics,
}: HeroPlaneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<HeroRenderer | null>(null);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const vNormRef = useRef(vNorm);
  const motionModeRef = useRef(motionMode);
  const [tier, setTier] = useState<HeroRenderTier>("high");
  const [maxTier, setMaxTier] = useState<HeroRenderTier>("high");
  const [backend, setBackend] = useState<Backend>(motionMode === "off" ? "static" : "css");
  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden);
  const [heroImageTimedOut, setHeroImageTimedOut] = useState(false);

  const avgFpsRef = useRef(60);
  const lowTargetDurationRef = useRef(0);
  const minFpsDurationRef = useRef(0);
  const lowTierMinDurationRef = useRef(0);
  const goodFpsDurationRef = useRef(0);
  const lastTickRef = useRef<number>(performance.now());

  vNormRef.current = vNorm;
  motionModeRef.current = motionMode;

  const shouldRun = motionMode !== "off" && isIntroVisible && documentVisible;

  useEffect(() => {
    if (!debugEnabled || !onDiagnostics) return;
    onDiagnostics({ tier, backend });
  }, [backend, debugEnabled, onDiagnostics, tier]);

  useEffect(() => {
    document.documentElement.dataset.heroTier = tier;
    document.documentElement.dataset.heroBackend = backend;
  }, [backend, tier]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let detachBatteryListener: (() => void) | null = null;
    const isMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.matchMedia("(pointer: coarse)").matches;

    if (!isMobile) {
      setMaxTier("high");
      return () => {
        cancelled = true;
      };
    }

    const maybeNavigator = navigator as Navigator & {
      getBattery?: () => Promise<{
        level: number;
        addEventListener?: (name: string, listener: () => void) => void;
        removeEventListener?: (name: string, listener: () => void) => void;
      }>;
    };
    if (!maybeNavigator.getBattery) {
      setMaxTier("high");
      return () => {
        cancelled = true;
      };
    }

    const syncCap = (level: number) => {
      if (cancelled) return;
      setMaxTier(level < 0.2 ? "medium" : "high");
    };

    const initBatteryRule = async () => {
      try {
        const battery = await maybeNavigator.getBattery!();
        syncCap(battery.level);
        const onLevelChange = () => syncCap(battery.level);
        battery.addEventListener?.("levelchange", onLevelChange);
        detachBatteryListener = () => battery.removeEventListener?.("levelchange", onLevelChange);
      } catch {
        setMaxTier("high");
      }
    };

    void initBatteryRule();

    return () => {
      cancelled = true;
      detachBatteryListener?.();
    };
  }, []);

  useEffect(() => {
    setTier((prevTier) => clampTierByMaxTier(prevTier, maxTier));
  }, [maxTier]);

  useEffect(() => {
    if (motionMode === "off") {
      setHeroImageTimedOut(false);
      return;
    }

    let cancelled = false;
    setHeroImageTimedOut(false);
    const img = new Image();
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setHeroImageTimedOut(true);
      setBackend("static");
    }, 1200);

    img.onload = () => {
      if (cancelled) return;
      window.clearTimeout(timeoutId);
    };
    img.onerror = () => {
      if (cancelled) return;
      window.clearTimeout(timeoutId);
      setHeroImageTimedOut(true);
      setBackend("static");
    };
    img.src = heroImageSrc;

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [heroImageSrc, motionMode]);

  useEffect(() => {
    if (motionMode === "off") {
      rendererRef.current?.dispose();
      rendererRef.current = null;
      setBackend("static");
      return;
    }
    if (heroImageTimedOut) {
      rendererRef.current?.dispose();
      rendererRef.current = null;
      setBackend("static");
      return;
    }

    let cancelled = false;

    const initRenderer = async () => {
      const canvas = canvasRef.current;
      const host = heroRef.current;
      if (!canvas || !host) return;

      rendererRef.current?.dispose();
      rendererRef.current = null;

      let resolvedRenderer: HeroRenderer | null = null;
      if (enableWebGPU) {
        resolvedRenderer = await createWebGPUHeroRenderer(canvas, heroImageSrc, true);
      }
      if (!resolvedRenderer) {
        resolvedRenderer = await createWebGL2HeroRenderer(canvas, heroImageSrc);
      }

      if (cancelled || !mountedRef.current) {
        resolvedRenderer?.dispose();
        return;
      }

      if (!resolvedRenderer) {
        setBackend("css");
        return;
      }

      rendererRef.current = resolvedRenderer;
      setBackend(resolvedRenderer.backend);

      const rect = host.getBoundingClientRect();
      const appliedTier = clampTierByMaxTier(tier, maxTier);
      const dpr = Math.min(window.devicePixelRatio || 1, TIER_CONFIG[appliedTier].dprCap);
      resolvedRenderer.setSize(rect.width, rect.height, dpr, TIER_CONFIG[appliedTier].renderScale);
    };

    void initRenderer();

    return () => {
      cancelled = true;
    };
  }, [enableWebGPU, heroImageSrc, heroImageTimedOut, maxTier, motionMode, tier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onContextLost = () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
      setBackend("css");
    };

    canvas.addEventListener("webglcontextlost", onContextLost);
    return () => canvas.removeEventListener("webglcontextlost", onContextLost);
  }, []);

  useEffect(() => {
    const host = heroRef.current;
    const renderer = rendererRef.current;
    if (!host || !renderer) return;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const appliedTier = clampTierByMaxTier(tier, maxTier);
      const dpr = Math.min(window.devicePixelRatio || 1, TIER_CONFIG[appliedTier].dprCap);
      renderer.setSize(rect.width, rect.height, dpr, TIER_CONFIG[appliedTier].renderScale);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [backend, maxTier, tier]);

  useEffect(() => {
    if (!(backend === "webgpu" || backend === "webgl2")) return;
    if (!shouldRun) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    let active = true;
    lastTickRef.current = performance.now();
    avgFpsRef.current = 60;
    lowTargetDurationRef.current = 0;
    minFpsDurationRef.current = 0;
    lowTierMinDurationRef.current = 0;
    goodFpsDurationRef.current = 0;

    const tick = (now: number) => {
      if (!active) return;
      const renderer = rendererRef.current;
      if (!renderer) return;

      const dt = Math.min(0.2, Math.max(0.001, (now - lastTickRef.current) / 1000));
      lastTickRef.current = now;
      const fps = 1 / dt;
      const smoothing = 1 - Math.exp(-4 * dt);
      avgFpsRef.current += (fps - avgFpsRef.current) * smoothing;

      const appliedTier = clampTierByMaxTier(tier, maxTier);
      const cfg = TIER_CONFIG[appliedTier];
      if (avgFpsRef.current < cfg.targetFps - 5) {
        lowTargetDurationRef.current += dt;
      } else {
        lowTargetDurationRef.current = 0;
      }

      if (avgFpsRef.current < cfg.minAcceptableFps) {
        minFpsDurationRef.current += dt;
      } else {
        minFpsDurationRef.current = 0;
      }

      if (appliedTier === "low" && avgFpsRef.current < cfg.minAcceptableFps) {
        lowTierMinDurationRef.current += dt;
      } else {
        lowTierMinDurationRef.current = 0;
      }

      if (minFpsDurationRef.current >= 1 && appliedTier !== "low") {
        setTier("low");
        minFpsDurationRef.current = 0;
        lowTargetDurationRef.current = 0;
        goodFpsDurationRef.current = 0;
      } else if (lowTargetDurationRef.current >= 2 && appliedTier !== "low") {
        setTier((prev) => nextTier(prev));
        lowTargetDurationRef.current = 0;
        goodFpsDurationRef.current = 0;
      } else if (appliedTier === "low" && lowTierMinDurationRef.current >= 2) {
        renderer.dispose();
        rendererRef.current = null;
        setBackend("css");
        return;
      }

      const isActivelyScrolling = vNormRef.current >= 0.08;
      const hasGoodFps = avgFpsRef.current >= cfg.targetFps;
      if (!isActivelyScrolling && hasGoodFps && appliedTier !== maxTier) {
        goodFpsDurationRef.current += dt;
        if (goodFpsDurationRef.current >= 10) {
          setTier((prev) => clampTierByMaxTier(previousTier(prev), maxTier));
          goodFpsDurationRef.current = 0;
        }
      } else {
        goodFpsDurationRef.current = 0;
      }

      renderer.render(now / 1000, vNormRef.current, motionModeRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [backend, maxTier, shouldRun, tier]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  return (
    <div className="hero-plane" ref={heroRef} aria-hidden="true">
      {(backend === "webgpu" || backend === "webgl2") && (
        <canvas className="hero-plane-canvas" ref={canvasRef} aria-hidden="true" />
      )}
      {backend === "css" && <CssHeroFallback heroImageSrc={heroImageSrc} vNorm={vNorm} isAnimated={motionMode !== "off"} />}
      {backend === "static" && <CssHeroFallback heroImageSrc={heroImageSrc} vNorm={0} isAnimated={false} />}
      <div className="hero-plane-veil" />
    </div>
  );
}
