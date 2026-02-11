import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import { heartXY } from "../utils/heartPath";

type IntroViewProps = {
  onOpen: () => void;
};

type EnvelopePose = { x: number; y: number; scale: number; rotateDeg: number };
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export function IntroView({ onOpen }: IntroViewProps) {
  const { mode: motionMode } = useMotionMode();
  const introRootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const envelopeButtonRef = useRef<HTMLButtonElement>(null);
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
  const [envelopePose, setEnvelopePose] = useState<EnvelopePose>({ x: 0, y: 0, scale: 1, rotateDeg: 0 });
  const targetProgressRef = useRef(0);
  const animatedProgressRef = useRef(0);
  const envelopeRafRef = useRef(0);
  const envelopeLastTsRef = useRef<number | null>(null);

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
      const normalized = Math.min(1, Math.max(0, nextPos / maxScroll));
      targetProgressRef.current = normalized;
      setScrollProgress(normalized);

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

  useEffect(() => {
    const computePose = (progress: number): EnvelopePose => {
      const p = easeInOutSine(Math.min(1, Math.max(0, progress)));
      const a = p * Math.PI * 2;
      const da = 0.002 * Math.PI * 2;
      const { x, y } = heartXY(a);
      const next = heartXY(a + da);

      const envelopeWidth = envelopeButtonRef.current?.clientWidth ?? 340;
      const envelopeHeight = envelopeButtonRef.current?.clientHeight ?? 216;
      const margin = 18;
      const halfW = viewportSize.width / 2 - envelopeWidth / 2 - margin;
      const halfH = viewportSize.height / 2 - envelopeHeight / 2 - margin;
      const safeScale = Math.max(2, Math.min(halfW / 16, halfH / 17));
      const baseScale = Number.isFinite(safeScale) ? safeScale : 8;

      const depth = 0.9 + 0.2 * (1 - Math.max(-1, Math.min(1, y / 17)));
      const px = x * baseScale;
      const py = -y * baseScale;
      const px2 = next.x * baseScale;
      const py2 = -next.y * baseScale;
      const rot = (Math.atan2(py2 - py, px2 - px) * 180) / Math.PI;

      return { x: px, y: py, scale: depth, rotateDeg: rot };
    };

    if (motionMode === "off") {
      animatedProgressRef.current = 1;
      setEnvelopePose(computePose(1));
      return () => {
        cancelAnimationFrame(envelopeRafRef.current);
      };
    }

    let active = true;
    const tick = (now: number) => {
      if (!active) return;
      const lastTs = envelopeLastTsRef.current ?? now;
      const dt = Math.max(0.008, Math.min(0.05, (now - lastTs) / 1000));
      envelopeLastTsRef.current = now;

      const target = targetProgressRef.current;
      const alpha = 1 - Math.exp(-10 * dt);
      const current = animatedProgressRef.current + (target - animatedProgressRef.current) * alpha;
      animatedProgressRef.current = Math.abs(target - current) < 0.0005 ? target : current;
      setEnvelopePose(computePose(animatedProgressRef.current));

      envelopeRafRef.current = requestAnimationFrame(tick);
    };

    envelopeRafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      envelopeLastTsRef.current = null;
      cancelAnimationFrame(envelopeRafRef.current);
    };
  }, [motionMode, viewportSize.height, viewportSize.width]);

  const envelopeStyle = useMemo(
    () =>
      ({
        "--x": `${envelopePose.x.toFixed(1)}px`,
        "--y": `${envelopePose.y.toFixed(1)}px`,
        "--rot": `${envelopePose.rotateDeg.toFixed(2)}deg`,
        "--scale": envelopePose.scale.toFixed(3),
      }) as CSSProperties,
    [envelopePose],
  );

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
            ref={envelopeButtonRef}
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
