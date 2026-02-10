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

export function IntroView({ onOpen }: IntroViewProps) {
  const { mode: motionMode, setMode: setMotionMode } = useMotionMode();
  const introRootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLElement>(null);
  const velocityStateRef = useRef<ScrollVelocityState | null>(null);
  const decayRafRef = useRef(0);
  const targetScrollTopRef = useRef(0);
  const debugLastCommitTsRef = useRef(0);
  const triggerHoldStartRef = useRef<number | null>(null);
  const hasTriggeredFlyInRef = useRef(false);
  const flyRafRef = useRef(0);
  const flyStartTsRef = useRef(0);
  const landingRectRef = useRef({ width: 320, height: 320 });
  const ctaDelayTimeoutRef = useRef<number | null>(null);
  const ctaEnableTimeoutRef = useRef<number | null>(null);
  const ctaSkipFadeTimeoutRef = useRef<number | null>(null);
  const [opening, setOpening] = useState(false);
  const [vNorm, setVNorm] = useState(0);
  const [debugMetrics, setDebugMetrics] = useState({ scrollTop: 0, vRaw: 0, vSmooth: 0, vNorm: 0 });
  const [heroDiagnostics, setHeroDiagnostics] = useState<{ tier: string; backend: string }>({
    tier: "high",
    backend: "css",
  });
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isLandingVisibleEnough, setIsLandingVisibleEnough] = useState(false);
  const [flyPhase, setFlyPhase] = useState<"idle" | "flying" | "landed">("idle");
  const [ctaVisible, setCtaVisible] = useState(false);
  const [ctaEnabled, setCtaEnabled] = useState(false);
  const [ctaFastReveal, setCtaFastReveal] = useState(false);
  const [envelopePose, setEnvelopePose] = useState({ x: 0, y: 0, scale: 0.9, rotateDeg: -12 });

  const introMotionConfig = valentineConfig.introMotion;
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

  const applyIdlePose = useCallback(() => {
    const width = landingRectRef.current.width;
    const height = landingRectRef.current.height;
    const radius = Math.min(width, height) * 0.42;
    const angle = -0.72;
    setEnvelopePose({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      scale: 0.88,
      rotateDeg: -12,
    });
  }, []);

  const clearCtaTimers = useCallback(() => {
    if (ctaDelayTimeoutRef.current) {
      window.clearTimeout(ctaDelayTimeoutRef.current);
      ctaDelayTimeoutRef.current = null;
    }
    if (ctaEnableTimeoutRef.current) {
      window.clearTimeout(ctaEnableTimeoutRef.current);
      ctaEnableTimeoutRef.current = null;
    }
    if (ctaSkipFadeTimeoutRef.current) {
      window.clearTimeout(ctaSkipFadeTimeoutRef.current);
      ctaSkipFadeTimeoutRef.current = null;
    }
  }, []);

  const markLandedAndRevealCta = useCallback(() => {
    clearCtaTimers();
    setCtaFastReveal(false);
    setFlyPhase("landed");
    setEnvelopePose({ x: 0, y: 0, scale: 1, rotateDeg: 0 });
    ctaDelayTimeoutRef.current = window.setTimeout(() => {
      setCtaVisible(true);
    }, introMotionConfig.ctaDelayMs);
    ctaEnableTimeoutRef.current = window.setTimeout(() => {
      setCtaEnabled(true);
    }, introMotionConfig.ctaDelayMs + introMotionConfig.ctaFadeMs);
  }, [clearCtaTimers, introMotionConfig.ctaDelayMs, introMotionConfig.ctaFadeMs]);

  const skipToLanded = useCallback(() => {
    cancelAnimationFrame(flyRafRef.current);
    hasTriggeredFlyInRef.current = true;
    setFlyPhase("landed");
    setEnvelopePose({ x: 0, y: 0, scale: 1, rotateDeg: 0 });
    clearCtaTimers();
    setCtaFastReveal(true);
    setCtaVisible(true);
    setCtaEnabled(true);
    ctaSkipFadeTimeoutRef.current = window.setTimeout(() => {
      setCtaFastReveal(false);
    }, 120);
  }, [clearCtaTimers]);

  const startFlyIn = useCallback(() => {
    if (hasTriggeredFlyInRef.current) return;
    if (motionMode === "off") {
      hasTriggeredFlyInRef.current = true;
      markLandedAndRevealCta();
      return;
    }

    hasTriggeredFlyInRef.current = true;
    setFlyPhase("flying");
    flyStartTsRef.current = performance.now();

    const width = landingRectRef.current.width;
    const height = landingRectRef.current.height;
    const startRadius = Math.min(width, height) * 0.42;
    const baseAngle = -0.72;

    const tick = (now: number) => {
      const t = Math.min(1, (now - flyStartTsRef.current) / introMotionConfig.flyDurationMs);
      const eased = 1 - (1 - t) * (1 - t) * (1 - t);
      const angle = baseAngle + introMotionConfig.loopsCount * Math.PI * 2 * (1 - eased);
      const radius = startRadius * (1 - eased);
      setEnvelopePose({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        scale: 0.88 + 0.12 * eased,
        rotateDeg: -12 * (1 - eased),
      });

      if (t < 1) {
        flyRafRef.current = requestAnimationFrame(tick);
      } else {
        markLandedAndRevealCta();
      }
    };

    flyRafRef.current = requestAnimationFrame(tick);
  }, [introMotionConfig.flyDurationMs, introMotionConfig.loopsCount, markLandedAndRevealCta, motionMode]);

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
    const stage = stageRef.current;
    const landing = landingRef.current;
    if (!stage || !landing) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visibleEnough = entry.intersectionRatio >= introMotionConfig.landingIntersectionRatio;
        setIsLandingVisibleEnough(visibleEnough);
      },
      { root: stage, threshold: [0, introMotionConfig.landingIntersectionRatio, 1] },
    );

    observer.observe(landing);
    return () => observer.disconnect();
  }, [introMotionConfig.landingIntersectionRatio]);

  useEffect(() => {
    const landing = landingRef.current;
    if (!landing) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = landing.getBoundingClientRect();
      landingRectRef.current = { width: rect.width, height: rect.height };
      if (flyPhase === "idle") {
        applyIdlePose();
      } else if (flyPhase === "landed") {
        setEnvelopePose({ x: 0, y: 0, scale: 1, rotateDeg: 0 });
      }
    });

    resizeObserver.observe(landing);
    return () => resizeObserver.disconnect();
  }, [applyIdlePose, flyPhase]);

  useEffect(() => {
    const onViewportResize = () => {
      if (flyPhase === "landed") {
        setEnvelopePose({ x: 0, y: 0, scale: 1, rotateDeg: 0 });
      }
    };

    window.addEventListener("resize", onViewportResize);
    window.addEventListener("orientationchange", onViewportResize);
    return () => {
      window.removeEventListener("resize", onViewportResize);
      window.removeEventListener("orientationchange", onViewportResize);
    };
  }, [flyPhase]);

  useEffect(() => {
    if (motionMode === "off") {
      hasTriggeredFlyInRef.current = true;
      setFlyPhase("landed");
      setEnvelopePose({ x: 0, y: 0, scale: 1, rotateDeg: 0 });
      clearCtaTimers();
      setCtaFastReveal(false);
      setCtaVisible(true);
      setCtaEnabled(true);
      return;
    }

    if (flyPhase === "idle") {
      hasTriggeredFlyInRef.current = false;
      applyIdlePose();
      clearCtaTimers();
      setCtaFastReveal(false);
      setCtaVisible(false);
      setCtaEnabled(false);
    }
  }, [applyIdlePose, clearCtaTimers, flyPhase, motionMode]);

  useEffect(() => {
    if (!isLandingVisibleEnough) return;
    startFlyIn();
  }, [isLandingVisibleEnough, startFlyIn]);

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

      if (debugEnabled && ts - debugLastCommitTsRef.current >= 100) {
        debugLastCommitTsRef.current = ts;
        setDebugMetrics({
          scrollTop: nextPos,
          vRaw: nextState.vRaw,
          vSmooth: nextState.vSmooth,
          vNorm: nextState.vNorm,
        });
      }

      if (!hasTriggeredFlyInRef.current) {
        if (nextState.vNorm >= introMotionConfig.triggerVelocityNorm) {
          if (triggerHoldStartRef.current === null) {
            triggerHoldStartRef.current = ts;
          } else if (ts - triggerHoldStartRef.current >= introMotionConfig.triggerVelocityHoldMs) {
            startFlyIn();
          }
        } else {
          triggerHoldStartRef.current = null;
        }
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
    introMotionConfig.triggerVelocityHoldMs,
    introMotionConfig.triggerVelocityNorm,
    startFlyIn,
    velocityParams,
  ]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(flyRafRef.current);
      clearCtaTimers();
    };
  }, [clearCtaTimers]);

  const envelopeStyle = useMemo(
    () => ({
      transform: `translate3d(${envelopePose.x.toFixed(1)}px, ${envelopePose.y.toFixed(1)}px, 0) scale(${envelopePose.scale.toFixed(3)}) rotate(${envelopePose.rotateDeg.toFixed(2)}deg)`,
    }),
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
          <div className="card intro-hero-card">
            <p className="intro-kicker">Mam coś dla Ciebie 💌</p>
            <h1>Mała niespodzianka</h1>
            <p className="intro-subtitle">Przewiń, aby sprowadzić kopertę i otworzyć walentynkę.</p>
            <div className="motion-mode-toggle" role="group" aria-label="Tryb animacji">
              <button
                type="button"
                className={`motion-mode-btn ${motionMode === "full" ? "active" : ""}`}
                onClick={() => setMotionMode("full")}
                aria-pressed={motionMode === "full"}
              >
                Full
              </button>
              <button
                type="button"
                className={`motion-mode-btn ${motionMode === "lite" ? "active" : ""}`}
                onClick={() => setMotionMode("lite")}
                aria-pressed={motionMode === "lite"}
              >
                Lite
              </button>
              <button
                type="button"
                className={`motion-mode-btn ${motionMode === "off" ? "active" : ""}`}
                onClick={() => setMotionMode("off")}
                aria-pressed={motionMode === "off"}
              >
                Off
              </button>
            </div>
            <button
              type="button"
              className="btn btn-secondary intro-skip-btn"
              aria-label="Pomiń animację intro"
              onClick={skipToLanded}
            >
              Pomiń animację intro
            </button>
          </div>
        </section>

        <section className="intro-snap intro-snap-landing" aria-label="Landing" ref={landingRef}>
          <div className="card intro-card intro-landing-card">
            <p className="intro-kicker">Lądowanie koperty</p>
            <p className="intro-subtitle">Mocniejszy scroll lub dojedź do sekcji, żeby uruchomić animację.</p>

            <div className="envelope-zone">
              <div className={`envelope-shell phase-${flyPhase}`} style={envelopeStyle}>
                <button type="button" className={`envelope ${opening ? "opening" : ""}`} onClick={handleOpen}>
                  <span className="envelope-flap" />
                  <span className="envelope-letter">💖</span>
                  <span className="envelope-body">
                    <span className="envelope-heart">💌</span>
                  </span>
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`btn btn-primary intro-cta ${ctaVisible ? "cta-visible" : ""} ${ctaFastReveal ? "cta-fast" : ""}`}
              onClick={handleOpen}
              disabled={!ctaEnabled}
            >
              {valentineConfig.texts.introHint}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
