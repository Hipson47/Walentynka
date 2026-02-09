import { useState } from "react";
import { valentineConfig } from "../config/valentine.config";

type IntroViewProps = {
  onOpen: () => void;
};

export function IntroView({ onOpen }: IntroViewProps) {
  const [opening, setOpening] = useState(false);

  return (
    <section className="screen intro-screen">
      <div className="card intro-card">
        <p className="intro-kicker">Mam coś dla Ciebie 💌</p>
        <h1>Mała niespodzianka</h1>
        <p className="intro-subtitle">Otwórz kopertę i zobacz, co przygotowałem.</p>
        <button
          type="button"
          className={`envelope ${opening ? "opening" : ""}`}
          onClick={() => {
            if (opening) return;
            setOpening(true);
            window.setTimeout(onOpen, 620);
          }}
        >
          <span className="envelope-flap" />
          <span className="envelope-letter">💖</span>
          <span className="envelope-body">
            <span className="envelope-heart">💌</span>
          </span>
        </button>
        <button
          type="button"
          className="btn btn-primary intro-cta"
          onClick={() => {
            if (opening) return;
            setOpening(true);
            window.setTimeout(onOpen, 620);
          }}
        >
          {valentineConfig.texts.introHint}
        </button>
      </div>
    </section>
  );
}
