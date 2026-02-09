import { useEffect } from "react";
import { GifWithFallback } from "../components/GifWithFallback";
import { TiltCard } from "../components/TiltCard";
import { HeartsCanvasOverlay } from "../effects/HeartsCanvasOverlay";

type CelebrateViewProps = {
  headline: string;
  gifPath: string;
  onDone: () => void;
  durationMs?: number;
};

export function CelebrateView({
  headline,
  gifPath,
  onDone,
  durationMs = 7600,
}: CelebrateViewProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [durationMs, onDone]);

  return (
    <section className="screen">
      <TiltCard className="card">
        <div className="image-container">
          <GifWithFallback src={gifPath} alt="Yay!" fallback="🎉❤️🎉" className="layer-1" />
        </div>
        <h1 className="layer-1">{headline}</h1>
      </TiltCard>
      <HeartsCanvasOverlay durationMs={9000} variant="celebrate" />
    </section>
  );
}
