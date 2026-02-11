import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { valentineConfig } from "../config/valentine.config";
import { HeroPlane } from "../effects/HeroPlane";
import { useMotionMode } from "../hooks/useMotionMode";
import {
  createScrollVelocityState,
  decayScrollVelocity,
  DEFAULT_SCROLL_VELOCITY_PARAMS,
  stepScrollVelocity,
  type ScrollVelocityState,
} from "../utils/scrollVelocity";

type IntroViewProps = {
  onOpen: () => void;
};

type Point = { x: number; y: number };
type BezierSegment = {
  end: number;
  p0: Point;
  c1: Point;
  c2: Point;
  p1: Point;
};
type FlightVariant = {
  key: "rose" | "velvet" | "moonlight";
  segments: BezierSegment[];
  scaleNearStart: number;
  scaleFar: number;
  scaleNearEnd: number;
  wobbleStart: number;
  wobbleEnd: number;
  wobbleAmp: number;
  flutterUntil: number;
  flutterAmp: number;
  rotationOffsetDeg: number;
  rotationClampDeg: number;
};

function cubicBezierPoint(p0: Point, c1: Point, c2: Point, p1: Point, t: number): Point {
  const u = Math.min(1, Math.max(0, t));
  const m = 1 - u;
  const m2 = m * m;
  const u2 = u * u;
  const x = m2 * m * p0.x + 3 * m2 * u * c1.x + 3 * m * u2 * c2.x + u2 * u * p1.x;
  const y = m2 * m * p0.y + 3 * m2 * u * c1.y + 3 * m * u2 * c2.y + u2 * u * p1.y;
  return { x, y };
}

function cubicBezierTangent(p0: Point, c1: Point, c2: Point, p1: Point, t: number): Point {
  const u = Math.min(1, Math.max(0, t));
  const m = 1 - u;
  const x = 3 * m * m * (c1.x - p0.x) + 6 * m * u * (c2.x - c1.x) + 3 * u * u * (p1.x - c2.x);
  const y = 3 * m * m * (c1.y - p0.y) + 6 * m * u * (c2.y - c1.y) + 3 * u * u * (p1.y - c2.y);
  return { x, y };
}

const FLIGHT_VARIANTS: Record<FlightVariant["key"], FlightVariant> = {
  // Default: classic romantic heart with balanced width.
  rose: {
    key: "rose",
    segments: [
      { end: 0.34, p0: { x: 0.7, y: -0.2 }, c1: { x: 0.5, y: -0.62 }, c2: { x: -0.66, y: -0.54 }, p1: { x: -0.62, y: 0.12 } },
      { end: 0.58, p0: { x: -0.62, y: 0.12 }, c1: { x: -0.58, y: -0.08 }, c2: { x: -0.3, y: -0.44 }, p1: { x: 0, y: -0.16 } },
      { end: 0.8, p0: { x: 0, y: -0.16 }, c1: { x: 0.22, y: -0.42 }, c2: { x: 0.48, y: -0.08 }, p1: { x: 0.34, y: 0.08 } },
      { end: 0.94, p0: { x: 0.34, y: 0.08 }, c1: { x: 0.2, y: 0.3 }, c2: { x: 0.08, y: 0.4 }, p1: { x: 0.01, y: 0.41 } },
      { end: 1, p0: { x: 0.01, y: 0.41 }, c1: { x: 0.01, y: 0.47 }, c2: { x: 0, y: 0.52 }, p1: { x: 0, y: 0.56 } },
    ],
    scaleNearStart: 2.05,
    scaleFar: 0.72,
    scaleNearEnd: 1.08,
    wobbleStart: 0.6,
    wobbleEnd: 0.9,
    wobbleAmp: 0.028,
    flutterUntil: 0.22,
    flutterAmp: 0.016,
    rotationOffsetDeg: 6,
    rotationClampDeg: 68,
  },
  // Softer, wider top lobes; slower-feeling romantic sweep.
  velvet: {
    key: "velvet",
    segments: [
      { end: 0.36, p0: { x: 0.74, y: -0.16 }, c1: { x: 0.56, y: -0.6 }, c2: { x: -0.7, y: -0.6 }, p1: { x: -0.66, y: 0.14 } },
      { end: 0.6, p0: { x: -0.66, y: 0.14 }, c1: { x: -0.62, y: -0.04 }, c2: { x: -0.34, y: -0.42 }, p1: { x: 0, y: -0.2 } },
      { end: 0.82, p0: { x: 0, y: -0.2 }, c1: { x: 0.26, y: -0.44 }, c2: { x: 0.56, y: -0.1 }, p1: { x: 0.37, y: 0.12 } },
      { end: 0.95, p0: { x: 0.37, y: 0.12 }, c1: { x: 0.25, y: 0.31 }, c2: { x: 0.1, y: 0.41 }, p1: { x: 0.01, y: 0.43 } },
      { end: 1, p0: { x: 0.01, y: 0.43 }, c1: { x: 0.01, y: 0.49 }, c2: { x: 0, y: 0.54 }, p1: { x: 0, y: 0.58 } },
    ],
    scaleNearStart: 2.12,
    scaleFar: 0.68,
    scaleNearEnd: 1.1,
    wobbleStart: 0.58,
    wobbleEnd: 0.9,
    wobbleAmp: 0.022,
    flutterUntil: 0.2,
    flutterAmp: 0.012,
    rotationOffsetDeg: 5,
    rotationClampDeg: 64,
  },
  // Slimmer heart with cleaner descent to tip.
  moonlight: {
    key: "moonlight",
    segments: [
      { end: 0.33, p0: { x: 0.68, y: -0.24 }, c1: { x: 0.47, y: -0.66 }, c2: { x: -0.58, y: -0.52 }, p1: { x: -0.56, y: 0.06 } },
      { end: 0.57, p0: { x: -0.56, y: 0.06 }, c1: { x: -0.54, y: -0.1 }, c2: { x: -0.25, y: -0.4 }, p1: { x: 0, y: -0.15 } },
      { end: 0.79, p0: { x: 0, y: -0.15 }, c1: { x: 0.18, y: -0.38 }, c2: { x: 0.43, y: -0.06 }, p1: { x: 0.3, y: 0.08 } },
      { end: 0.93, p0: { x: 0.3, y: 0.08 }, c1: { x: 0.2, y: 0.24 }, c2: { x: 0.07, y: 0.35 }, p1: { x: 0.01, y: 0.39 } },
      { end: 1, p0: { x: 0.01, y: 0.39 }, c1: { x: 0.01, y: 0.46 }, c2: { x: 0, y: 0.5 }, p1: { x: 0, y: 0.55 } },
    ],
    scaleNearStart: 1.98,
    scaleFar: 0.74,
    scaleNearEnd: 1.06,
    wobbleStart: 0.62,
    wobbleEnd: 0.88,
    wobbleAmp: 0.018,
    flutterUntil: 0.22,
    flutterAmp: 0.01,
    rotationOffsetDeg: 7,
    rotationClampDeg: 62,
  },
};

function sampleFlight(variant: FlightVariant, t: number): { point: Point; tangent: Point } {
  const clamped = Math.min(1, Math.max(0, t));
  let prevEnd = 0;
  let chosen = variant.segments[variant.segments.length - 1];
  for (const seg of variant.segments) {
    if (clamped <= seg.end) {
      chosen = seg;
      break;
    }
    prevEnd = seg.end;
  }
  const localT = chosen.end <= prevEnd ? 1 : (clamped - prevEnd) / (chosen.end - prevEnd);
  return {
    point: cubicBezierPoint(chosen.p0, chosen.c1, chosen.c2, chosen.p1, localT),
    tangent: cubicBezierTangent(chosen.p0, chosen.c1, chosen.c2, chosen.p1, localT),
  };
}

export function IntroView({ onOpen }: IntroViewProps) {
  const { mode: motionMode } = useMotionMode();
  const introRootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const velocityStateRef = useRef<ScrollVelocityState | null>(null);
  const decayRafRef = useRef(0);
  const targetScrollTopRef = useRef(0);
  const debugLastCommitTsRef = useRef(0);
  const [opening, setOpening] = useState(false);
  const [vNorm, setVNorm] = useState(0);
  const [debugMetrics, setDebugMetrics] = useState({ scrollTop: 0, vRaw: 0, vSmooth: 0, vNorm: 0 });
  const [heroDiagnostics, setHeroDiagnostics] = useState<{ tier: string; backend: string }>({
    tier: "high",
    backend: "css",
  });
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewportSize, setViewportSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  const velocityParams = DEFAULT_SCROLL_VELOCITY_PARAMS;
  const debugEnabled = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1") return true;
    try {
      return window.localStorage.getItem("valentine.debugHud") === "1";
    } catch {
      return false;
    }
  }, []);
  const flightVariant = useMemo<FlightVariant>(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("heartFlight");
    if (key === "velvet" || key === "moonlight" || key === "rose") return FLIGHT_VARIANTS[key];
    return FLIGHT_VARIANTS.rose;
  }, []);

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(onOpen, 620);
  }, [onOpen, opening]);

  useEffect(() => {
    const introRoot = introRootRef.current;
    if (!introRoot) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntroVisible(entry.intersectionRatio >= 0.25);
      },
      { threshold: [0, 0.25, 1] },
    );

    observer.observe(introRoot);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncViewport = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    return () => {
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const now = performance.now();
    targetScrollTopRef.current = stage.scrollTop;
    debugLastCommitTsRef.current = now;
    velocityStateRef.current = createScrollVelocityState(stage.scrollTop, now);
    setVNorm(0);
    if (debugEnabled) {
      setDebugMetrics({ scrollTop: stage.scrollTop, vRaw: 0, vSmooth: 0, vNorm: 0 });
    }

    const onScroll = () => {
      targetScrollTopRef.current = stage.scrollTop;
    };

    let active = true;
    const tick = (ts: number) => {
      if (!active) return;

      const currentState = velocityStateRef.current ?? createScrollVelocityState(targetScrollTopRef.current, ts);
      const nextPos = targetScrollTopRef.current;
      const nextState =
        Math.abs(nextPos - currentState.lastPos) > 0.1
          ? stepScrollVelocity(currentState, nextPos, ts, velocityParams)
          : decayScrollVelocity(currentState, ts, velocityParams);

      velocityStateRef.current = nextState;
      setVNorm(nextState.vNorm);
      const maxScroll = Math.max(1, stage.scrollHeight - stage.clientHeight);
      setScrollProgress(Math.min(1, Math.max(0, nextPos / maxScroll)));

      if (debugEnabled && ts - debugLastCommitTsRef.current >= 100) {
        debugLastCommitTsRef.current = ts;
        setDebugMetrics({
          scrollTop: nextPos,
          vRaw: nextState.vRaw,
          vSmooth: nextState.vSmooth,
          vNorm: nextState.vNorm,
        });
      }

      decayRafRef.current = requestAnimationFrame(tick);
    };

    stage.addEventListener("scroll", onScroll, { passive: true });
    decayRafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      stage.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(decayRafRef.current);
    };
  }, [
    debugEnabled,
    velocityParams,
  ]);

  const effectiveProgress = motionMode === "off" ? 1 : scrollProgress;
  const envelopeReady = effectiveProgress >= 0.985;

  const envelopeStyle = useMemo(() => {
    const p = Math.min(1, Math.max(0, effectiveProgress));
    const smooth = p * p * (3 - 2 * p);
    const { point, tangent } = sampleFlight(flightVariant, smooth);

    const x = point.x * viewportSize.width;
    const y = point.y * viewportSize.height;
    const heading = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI;

    let scale: number;
    if (smooth < 0.34) {
      const k = smooth / 0.34;
      scale = flightVariant.scaleNearStart + (flightVariant.scaleFar - flightVariant.scaleNearStart) * k;
    } else if (smooth < 0.74) {
      const k = (smooth - 0.34) / 0.4;
      scale = flightVariant.scaleFar + (0.95 - flightVariant.scaleFar) * k;
    } else {
      const k = (smooth - 0.74) / 0.26;
      scale = 0.95 + (flightVariant.scaleNearEnd - 0.95) * k;
    }

    // Subtle depth wobble only in heart loop section.
    if (smooth > flightVariant.wobbleStart && smooth < flightVariant.wobbleEnd) {
      const heartK = (smooth - flightVariant.wobbleStart) / (flightVariant.wobbleEnd - flightVariant.wobbleStart);
      scale += Math.sin(heartK * Math.PI * 2) * flightVariant.wobbleAmp;
    }

    if (smooth < flightVariant.flutterUntil) {
      const flutter = 1 - smooth / flightVariant.flutterUntil;
      scale += Math.sin(smooth * Math.PI * 20) * flightVariant.flutterAmp * flutter;
    }

    const rotateDeg = Math.max(
      -flightVariant.rotationClampDeg,
      Math.min(flightVariant.rotationClampDeg, heading + flightVariant.rotationOffsetDeg),
    );

    return {
      transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${rotateDeg.toFixed(2)}deg)`,
    };
  }, [effectiveProgress, flightVariant, viewportSize.height, viewportSize.width]);

  return (
    <section className="screen intro-screen intro-screen-scroll" ref={introRootRef}>
      <div className="intro-hero-bg">
        <HeroPlane
          heroImageSrc={valentineConfig.assets.heroImage}
          vNorm={vNorm}
          motionMode={motionMode}
          isIntroVisible={isIntroVisible}
          enableWebGPU={valentineConfig.introMotion.useWebGPU}
          debugEnabled={debugEnabled}
          onDiagnostics={setHeroDiagnostics}
        />
      </div>

      {debugEnabled ? (
        <aside className="intro-debug-hud" aria-live="polite">
          <p>scrollTop: {debugMetrics.scrollTop.toFixed(1)} px</p>
          <p>vRaw: {debugMetrics.vRaw.toFixed(1)} px/s</p>
          <p>vSmooth: {debugMetrics.vSmooth.toFixed(1)} px/s</p>
          <p>vNorm: {debugMetrics.vNorm.toFixed(3)}</p>
          <p>tier: {heroDiagnostics.tier}</p>
          <p>backend: {heroDiagnostics.backend}</p>
          <p>mode: {motionMode}</p>
        </aside>
      ) : null}

      <div className="intro-stage" ref={stageRef}>
        <section className="intro-snap intro-snap-hero" aria-label="Hero">
          <div className="intro-ambient-copy" aria-hidden="true">
            <p className="intro-scroll-whisper">Przewiń w dół, aby sprowadzić kopertę</p>
          </div>
          <div className="intro-floating-ui">
            <p className="intro-kicker">Mam coś dla Ciebie 💌</p>
            <h1>Mała niespodzianka</h1>
          </div>
        </section>

        <section className="intro-snap intro-snap-landing" aria-label="Landing">
          <div className="intro-scroll-spacer" aria-hidden="true" />
        </section>
      </div>

      <div className="intro-envelope-layer">
        <div className="envelope-shell" style={envelopeStyle}>
          <button
            type="button"
            className={`envelope ${opening ? "opening" : ""} ${envelopeReady ? "ready" : ""}`}
            onClick={handleOpen}
            aria-label="Dla Ciebie"
          >
            <span className="envelope-flap" />
            <span className="envelope-letter">
              <span className="envelope-note">Dla Ciebie</span>
            </span>
            <span className="envelope-body">
              <span className="envelope-heart">💌</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
