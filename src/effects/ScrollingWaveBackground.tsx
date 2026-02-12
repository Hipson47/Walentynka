import type { MotionMode } from "../hooks/useMotionMode";

type ScrollingWaveBackgroundProps = {
  scrollProgress: number;
  vNorm: number;
  motionMode: MotionMode;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function ScrollingWaveBackground({
  scrollProgress,
  vNorm,
  motionMode,
}: ScrollingWaveBackgroundProps) {
  const progress = clamp01(scrollProgress);
  const velocity = clamp01(vNorm);
  const isMotionOff = motionMode === "off";

  const skyLift = isMotionOff ? 0 : progress * 18;
  const depthA = isMotionOff ? 0 : progress * 140 + velocity * 20;
  const depthB = isMotionOff ? 0 : progress * 190 + velocity * 26;
  const depthC = isMotionOff ? 0 : progress * 240 + velocity * 32;

  return (
    <div className="intro-wave-bg" aria-hidden="true" style={{ transform: `translateY(${skyLift}px)` }}>
      <div className={`intro-wave-layer wave-back ${isMotionOff ? "wave-static" : ""}`}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,192L80,202.7C160,213,320,235,480,229.3C640,224,800,192,960,170.7C1120,149,1280,139,1360,133.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
        </svg>
      </div>
      <div className={`intro-wave-layer wave-mid ${isMotionOff ? "wave-static" : ""}`} style={{ transform: `translate3d(${-depthA}px, 0, 0)` }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,160L80,170.7C160,181,320,203,480,213.3C640,224,800,224,960,213.3C1120,203,1280,181,1360,170.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
        </svg>
      </div>
      <div className={`intro-wave-layer wave-front ${isMotionOff ? "wave-static" : ""}`} style={{ transform: `translate3d(${-depthB}px, 0, 0)` }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,96L80,106.7C160,117,320,139,480,144C640,149,800,139,960,133.3C1120,128,1280,128,1360,128L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
        </svg>
      </div>
      <div className={`intro-wave-layer wave-crest ${isMotionOff ? "wave-static" : ""}`} style={{ transform: `translate3d(${-depthC}px, 0, 0)` }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,64L80,80C160,96,320,128,480,138.7C640,149,800,139,960,117.3C1120,96,1280,64,1360,48L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
        </svg>
      </div>
    </div>
  );
}
