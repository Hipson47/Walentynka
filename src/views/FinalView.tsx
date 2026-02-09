import { Modal } from "../components/Modal";
import { TiltCard } from "../components/TiltCard";
import { GifWithFallback } from "../components/GifWithFallback";
import { valentineConfig } from "../config/valentine.config";
import { HeartsCanvasOverlay } from "../effects/HeartsCanvasOverlay";

type FinalViewProps = {
  finalGifPath: string;
  isPsOpen: boolean;
  onOpenPs: () => void;
  onClosePs: () => void;
};

export function FinalView({
  finalGifPath,
  isPsOpen,
  onOpenPs,
  onClosePs,
}: FinalViewProps) {
  return (
    <section className="screen">
      <TiltCard className="card">
        <div className="image-container">
          <GifWithFallback src={finalGifPath} alt="Yay!" fallback="💖" className="layer-1" />
        </div>
        <h1>{valentineConfig.texts.finalHeadline}</h1>
        <p className="final-subtext">{valentineConfig.texts.finalSubtext}</p>
        <div className="final-actions">
          <button className="btn btn-primary" type="button" onClick={onOpenPs}>
            PS... 💌
          </button>
        </div>
      </TiltCard>
      <HeartsCanvasOverlay durationMs={12000} variant="ambient" />
      <Modal title={valentineConfig.texts.psTitle} open={isPsOpen} onClose={onClosePs}>
        <p>{valentineConfig.texts.psBody}</p>
      </Modal>
    </section>
  );
}
