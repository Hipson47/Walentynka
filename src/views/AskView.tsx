import { useRef } from "react";
import { GifWithFallback } from "../components/GifWithFallback";
import { RunawayNoButton } from "../components/RunawayNoButton";
import { TiltCard } from "../components/TiltCard";

type AskViewProps = {
  headline: string;
  askGifPath: string;
  onYes: () => void;
};

export function AskView({ headline, askGifPath, onYes }: AskViewProps) {
  const yesRef = useRef<HTMLButtonElement>(null);

  return (
    <section className="screen">
      <TiltCard className="card">
        <div className="image-container">
          <GifWithFallback src={askGifPath} alt="Proszę" fallback="🥺💕" className="layer-1" />
        </div>
        <h1 className="layer-1">{headline}</h1>
        <div className="buttons">
          <button ref={yesRef} type="button" className="btn btn-primary" onClick={onYes}>
            TAK
          </button>
          <RunawayNoButton getYesRect={() => yesRef.current?.getBoundingClientRect() ?? null} />
        </div>
      </TiltCard>
    </section>
  );
}
