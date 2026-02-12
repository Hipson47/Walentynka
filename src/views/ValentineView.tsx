import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ScrollingWaveBackground } from "../effects/ScrollingWaveBackground";
import { EnvelopeScrollReveal } from "../effects/EnvelopeScrollReveal";
import { HeartsCanvasOverlay } from "../effects/HeartsCanvasOverlay";
import { GifWithFallback } from "../components/GifWithFallback";
import { RunawayNoButton } from "../components/RunawayNoButton";
import { TiltCard } from "../components/TiltCard";
import { Modal } from "../components/Modal";
import { useMotionMode } from "../hooks/useMotionMode";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import {
  createScrollVelocityState,
  decayScrollVelocity,
  DEFAULT_SCROLL_VELOCITY_PARAMS,
  stepScrollVelocity,
  type ScrollVelocityState,
} from "../utils/scrollVelocity";
import { heartXY } from "../utils/heartPath";
import { valentineConfig } from "../config/valentine.config";
import type { ChoiceOption } from "../config/valentine.config";

type ScreenState = "intro" | "ask" | "celebrate" | "choice" | "final";
type IntroPhase = "scroll" | "ready" | "opening" | "ask";

type ValentineViewProps = {
  screen: ScreenState;
  askHeadline: string;
  isPsOpen: boolean;
  onOpenEnvelope: () => void;
  onYes: () => void;
  onCelebrateDone: () => void;
  onSelectChoice: (choiceId: string) => void;
  onOpenPs: () => void;
  onClosePs: () => void;
};

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const OPENING_JUMP_MS = 180;
const OPENING_TOTAL_MS = 680;
const CONTENT_SWAP_AT_MS = 140;
const CELEBRATE_DURATION_MS = 7600;

type EnvelopePose = { x: number; y: number; scale: number; rotateDeg: number };

export function ValentineView({
  screen,
  askHeadline,
  isPsOpen,
  onOpenEnvelope,
  onYes,
  onCelebrateDone,
  onSelectChoice,
  onOpenPs,
  onClosePs,
}: ValentineViewProps) {
  const { mode: motionMode } = useMotionMode();
  const prefersReducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const envelopeButtonRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const velocityStateRef = useRef<ScrollVelocityState | null>(null);
  const decayRafRef = useRef(0);
  const targetScrollTopRef = useRef(0);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("scroll");
  const [contentSwapped, setContentSwapped] = useState(false);
  const [vNorm, setVNorm] = useState(0);
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
  const touchStartYRef = useRef<number>(0);
  const touchStartScrollRef = useRef<number>(0);

  const velocityParams = DEFAULT_SCROLL_VELOCITY_PARAMS;
  const effectiveProgress = motionMode === "off" ? 1 : scrollProgress;
  const envelopeReady = effectiveProgress >= 0.985;
  const isIntroScreen = screen === "intro";

  useEffect(() => {
    if (introPhase === "scroll" && envelopeReady) setIntroPhase("ready");
    else if (introPhase === "ready" && !envelopeReady) setIntroPhase("scroll");
  }, [introPhase, envelopeReady]);

  const handleEnvelopeClick = useCallback(() => {
    if (introPhase !== "ready" || (motionMode !== "off" && scrollProgress < 0.985)) return;
    setIntroPhase("opening");
  }, [motionMode, introPhase, scrollProgress]);

  useEffect(() => {
    if (introPhase !== "opening") return;
    const reducedMotion = prefersReducedMotion || motionMode === "off";

    if (reducedMotion) {
      setContentSwapped(true);
      setIntroPhase("ask");
      onOpenEnvelope();
      return;
    }

    const t0 = performance.now();
    const shellRef = { current: null as HTMLElement | null };

    const tick = (now: number) => {
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / OPENING_TOTAL_MS);

      if (t >= 1) {
        setIntroPhase("ask");
        onOpenEnvelope();
        return;
      }

      const jumpT = Math.min(1, elapsed / OPENING_JUMP_MS);
      const jumpY = jumpT < 1 ? -120 * easeOutCubic(jumpT) : -120;
      const fallStart = OPENING_JUMP_MS / 1000;
      const fallT = (elapsed / 1000 - fallStart) / ((OPENING_TOTAL_MS - OPENING_JUMP_MS) / 1000);
      const fallY = fallT > 0 ? -120 + 120 * easeInOutSine(Math.min(1, fallT)) : jumpY;

      const rotateDeg = t < 0.5 ? -8 + 16 * t * 2 : 0;

      if (!shellRef.current) {
        shellRef.current = document.querySelector(".intro-ask-card-shell");
      }
      const shell = shellRef.current;
      if (shell) {
        shell.style.setProperty("--opening-y", `${fallY}px`);
        shell.style.setProperty("--opening-rot", `${rotateDeg}deg`);
      }

      requestAnimationFrame(tick);
    };

    const rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [introPhase, onOpenEnvelope, prefersReducedMotion, motionMode]);

  const showAskContent = (isIntroScreen && introPhase === "ask") || contentSwapped;

  useEffect(() => {
    if (introPhase !== "opening" || prefersReducedMotion || motionMode === "off") return;
    const id = window.setTimeout(() => setContentSwapped(true), CONTENT_SWAP_AT_MS);
    return () => window.clearTimeout(id);
  }, [introPhase, prefersReducedMotion, motionMode]);

  useEffect(() => {
    if (introPhase === "scroll" || introPhase === "ready") setContentSwapped(false);
  }, [introPhase]);

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
    velocityStateRef.current = createScrollVelocityState(stage.scrollTop, now);
    setVNorm(0);

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

      decayRafRef.current = requestAnimationFrame(tick);
    };

    stage.addEventListener("scroll", onScroll, { passive: true });
    decayRafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      stage.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(decayRafRef.current);
    };
  }, [velocityParams, isIntroScreen]);

  useEffect(() => {
    const computePose = (progress: number): EnvelopePose => {
      const clamped = Math.min(1, Math.max(0, progress));
      const landingStart = 0.78;
      const flightProgress = easeInOutSine(Math.min(1, clamped / landingStart));
      const a = flightProgress * Math.PI * 2;
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

      const depth = 0.88 + 0.22 * (1 - Math.max(-1, Math.min(1, y / 17)));
      const px = x * baseScale;
      const py = -y * baseScale;
      const px2 = next.x * baseScale;
      const py2 = -next.y * baseScale;
      const rot = (Math.atan2(py2 - py, px2 - px) * 180) / Math.PI;

      if (clamped <= landingStart) {
        return { x: px, y: py, scale: depth, rotateDeg: rot };
      }

      const landT = easeOutCubic((clamped - landingStart) / (1 - landingStart));
      const targetY = 0;
      const targetScale = mix(0.58, 1.85, landT);
      const targetRotate = -8;

      return {
        x: mix(px, 0, landT),
        y: mix(py, targetY, landT),
        scale: mix(depth, targetScale, landT),
        rotateDeg: mix(rot, targetRotate, landT),
      };
    };

    if (motionMode === "off") {
      animatedProgressRef.current = 1;
      setEnvelopePose(computePose(1));
      return () => cancelAnimationFrame(envelopeRafRef.current);
    }

    let active = true;
    const tick = (now: number) => {
      if (!active || introPhase === "opening" || introPhase === "ask") return;
      const lastTs = envelopeLastTsRef.current ?? now;
      const dt = Math.max(0.008, Math.min(0.05, (now - lastTs) / 1000));
      envelopeLastTsRef.current = now;

      const target = targetProgressRef.current;
      const alpha = 1 - Math.exp(-16 * dt);
      const current = animatedProgressRef.current + (target - animatedProgressRef.current) * alpha;
      animatedProgressRef.current = Math.abs(target - current) < 0.001 ? target : current;
      setEnvelopePose(computePose(animatedProgressRef.current));

      envelopeRafRef.current = requestAnimationFrame(tick);
    };

    envelopeRafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      envelopeLastTsRef.current = null;
      cancelAnimationFrame(envelopeRafRef.current);
    };
  }, [motionMode, viewportSize.height, viewportSize.width, introPhase]);

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

  const isCardPhase = screen === "ask" || screen === "celebrate" || screen === "choice" || screen === "final";
  const showIntroUI = isIntroScreen && introPhase !== "ask";

  return (
    <section
      className={`screen intro-screen intro-screen-scroll valentine-view ${envelopeReady ? "intro-landed" : "intro-flying"}`}
    >
      <div className="intro-hero-bg">
        <ScrollingWaveBackground
          scrollProgress={isCardPhase ? 1 : effectiveProgress}
          vNorm={isCardPhase ? 0 : vNorm}
          motionMode={motionMode}
        />
      </div>

      {motionMode !== "off" && isIntroScreen && (
        <EnvelopeScrollReveal containerRef={stageRef} motionMode={motionMode} />
      )}

      {screen === "celebrate" && <HeartsCanvasOverlay durationMs={9000} variant="celebrate" />}
      {(screen === "choice" || screen === "final") && (
        <HeartsCanvasOverlay durationMs={12000} variant="ambient" />
      )}

      {showIntroUI ? (
        <div className="intro-stage" ref={stageRef}>
          <section className="intro-snap intro-snap-hero" aria-label="Hero">
            <div className="intro-ambient-copy" aria-hidden="true">
              <p className="intro-scroll-whisper">
                {envelopeReady ? "Przewiń w górę, aby wrócić" : "Przewiń w dół, aby sprowadzić kopertę"}
              </p>
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
      ) : null}

      <div
        className={`intro-envelope-layer ${introPhase === "ready" || introPhase === "opening" || introPhase === "ask" || isCardPhase ? "intro-ask-card-layer" : ""}`}
        onWheel={(e) => {
          if (stageRef.current && isIntroScreen && (introPhase === "scroll" || introPhase === "ready")) {
            stageRef.current.scrollTop += e.deltaY;
            e.preventDefault();
          }
        }}
        onTouchStart={(e) => {
          if (stageRef.current && isIntroScreen && (introPhase === "scroll" || introPhase === "ready")) {
            touchStartYRef.current = e.touches[0].clientY;
            touchStartScrollRef.current = stageRef.current.scrollTop;
          }
        }}
        onTouchMove={(e) => {
          if (stageRef.current && isIntroScreen && (introPhase === "scroll" || introPhase === "ready")) {
            const dy = touchStartYRef.current - e.touches[0].clientY;
            stageRef.current.scrollTop = touchStartScrollRef.current + dy;
          }
        }}
        style={{ touchAction: isIntroScreen && (introPhase === "scroll" || introPhase === "ready") ? "pan-y" : undefined }}
      >
        <div
          className={`intro-ask-card-shell ${introPhase === "opening" ? "intro-ask-card-opening" : ""} ${introPhase === "ask" || isCardPhase ? "intro-ask-card-landed" : ""}`}
          style={
            isIntroScreen && (introPhase === "scroll" || introPhase === "ready")
              ? envelopeStyle
              : introPhase === "opening"
                ? ({ "--x": "0px", "--y": "0px", "--rot": "-8deg", "--scale": "0.58" } as CSSProperties)
                : ({} as CSSProperties)
          }
        >
          <AnimatePresence mode="wait">
            {isIntroScreen && !showAskContent ? (
              <motion.div
                key="envelope"
                className="intro-ask-envelope-wrap"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                <button
                  ref={envelopeButtonRef}
                  type="button"
                  className={`envelope ${introPhase === "opening" ? "opening" : ""} ${envelopeReady ? "ready" : ""}`}
                  onClick={handleEnvelopeClick}
                  aria-label="Dla Ciebie"
                  aria-disabled={!envelopeReady}
                  disabled={!envelopeReady || introPhase === "opening"}
                >
                  <span className="envelope-flap" />
                  <span className="envelope-letter">
                    <span className="envelope-note">Dla Ciebie</span>
                  </span>
                  <span className="envelope-body">
                    <span className="envelope-heart">💌</span>
                  </span>
                </button>
              </motion.div>
            ) : (screen === "ask" || (isIntroScreen && showAskContent)) ? (
              <motion.div
                key="ask"
                className="intro-ask-card-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <TiltCard className="card intro-ask-card">
                  <div className="image-container">
                    <GifWithFallback src={valentineConfig.gifPaths.ask} alt="Proszę" fallback="🥺💕" className="layer-1" />
                  </div>
                  <h1 className="layer-1">{askHeadline}</h1>
                  <div className="buttons">
                    <button ref={yesRef} type="button" className="btn btn-primary" onClick={onYes}>
                      TAK
                    </button>
                    <RunawayNoButton getYesRect={() => yesRef.current?.getBoundingClientRect() ?? null} />
                  </div>
                </TiltCard>
              </motion.div>
            ) : screen === "celebrate" ? (
              <CelebrateCard key="celebrate" onDone={onCelebrateDone} />
            ) : screen === "choice" ? (
              <ChoiceCard key="choice" onSelect={onSelectChoice} />
            ) : screen === "final" ? (
              <FinalCard key="final" onOpenPs={onOpenPs} />
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <Modal title={valentineConfig.texts.psTitle} open={isPsOpen} onClose={onClosePs}>
        <p>{valentineConfig.texts.psBody}</p>
      </Modal>
    </section>
  );
}

function CelebrateCard({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, CELEBRATE_DURATION_MS);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <motion.div
      className="intro-ask-card-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <TiltCard className="card intro-ask-card">
        <div className="image-container">
          <GifWithFallback
            src={valentineConfig.gifPaths.celebrate}
            alt="Yay!"
            fallback="🎉❤️🎉"
            className="layer-1"
          />
        </div>
        <h1 className="layer-1">{valentineConfig.texts.celebrateHeadline}</h1>
      </TiltCard>
    </motion.div>
  );
}

function ChoiceCard({ onSelect }: { onSelect: (choiceId: string) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <motion.div
      className="intro-ask-card-wrap choice-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div className="choice-stage-inner">
        <h1 className="choice-stage-title">{valentineConfig.texts.choiceHeadline}</h1>
        <div className="choice-grid" data-expanded={expandedId ?? ""}>
          {valentineConfig.choices.map((choice: ChoiceOption) => (
            <SingleChoiceCard
              key={choice.id}
              choice={choice}
              isExpanded={expandedId === choice.id}
              isMinimized={expandedId != null && expandedId !== choice.id}
              onToggle={() => setExpandedId((id) => (id === choice.id ? null : choice.id))}
              onSelect={() => onSelect(choice.id)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SingleChoiceCard({
  choice,
  isExpanded,
  isMinimized,
  onToggle,
  onSelect,
}: {
  choice: ChoiceOption;
  isExpanded: boolean;
  isMinimized: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  const imageSrc = choice.imagePath ?? valentineConfig.gifPaths.ask;
  const description = choice.description ?? choice.label;

  return (
    <article
      className={`choice-card choice-card-tile ${isExpanded ? "choice-card-expanded" : ""} ${isMinimized ? "choice-card-minimized" : ""}`}
    >
      <div className="choice-card-inner">
        {isExpanded ? (
          <>
            <div className="choice-card-image-wrap">
              <GifWithFallback src={imageSrc} alt={choice.label} fallback={choice.emoji} />
            </div>
            <p className="choice-card-description">{description}</p>
            <div className="choice-card-actions">
              <button className="choice-card-btn choice-card-btn-secondary" type="button" onClick={onToggle}>
                Schowaj
              </button>
              <button className="choice-card-btn choice-card-btn-primary" type="button" onClick={onSelect}>
                Wybieram
              </button>
            </div>
          </>
        ) : (
          <button className="choice-card-preview" type="button" onClick={onToggle}>
            <span className="choice-icon">{choice.emoji}</span>
            {!isMinimized && <span className="choice-label">{choice.label}</span>}
          </button>
        )}
      </div>
    </article>
  );
}

function FinalCard({ onOpenPs }: { onOpenPs: () => void }) {
  return (
    <motion.div
      className="intro-ask-card-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <TiltCard className="card intro-ask-card">
        <div className="image-container">
          <GifWithFallback
            src={valentineConfig.gifPaths.final}
            alt="Yay!"
            fallback="💖"
            className="layer-1"
          />
        </div>
        <h1>{valentineConfig.texts.finalHeadline}</h1>
        <p className="final-subtext">{valentineConfig.texts.finalSubtext}</p>
        <div className="final-actions">
          <button className="btn btn-primary" type="button" onClick={onOpenPs}>
            PS... 💌
          </button>
        </div>
      </TiltCard>
    </motion.div>
  );
}
