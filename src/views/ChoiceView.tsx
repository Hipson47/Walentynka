import { TiltCard } from "../components/TiltCard";
import type { ChoiceOption } from "../config/valentine.config";
import { HeartsCanvasOverlay } from "../effects/HeartsCanvasOverlay";

type ChoiceViewProps = {
  headline: string;
  choices: ChoiceOption[];
  onSelect: (choiceId: string) => void;
};

export function ChoiceView({ headline, choices, onSelect }: ChoiceViewProps) {
  return (
    <section className="screen">
      <TiltCard className="card card-wide">
        <h1>{headline}</h1>
        <div className="choice-grid">
          {choices.map((choice) => (
            <button
              key={choice.id}
              className="choice-card layer-1"
              type="button"
              onClick={() => onSelect(choice.id)}
            >
              <span className="choice-icon">{choice.emoji}</span>
              <span className="choice-label">{choice.label}</span>
            </button>
          ))}
        </div>
      </TiltCard>
      <HeartsCanvasOverlay durationMs={12000} variant="ambient" />
    </section>
  );
}
