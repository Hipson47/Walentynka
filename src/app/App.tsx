import { useMemo, useReducer } from "react";
import { AskView } from "../views/AskView";
import { CelebrateView } from "../views/CelebrateView";
import { ChoiceView } from "../views/ChoiceView";
import { FinalView } from "../views/FinalView";
import { IntroView } from "../views/IntroView";
import { appReducer, initialState } from "./state";
import { valentineConfig } from "../config/valentine.config";
import { sanitizeName } from "../utils/dom";

export function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const askHeadline = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const toName = sanitizeName(params.get("to"));
    if (toName) {
      return `${toName}, czy zostaniesz moją walentynką?`;
    }
    return valentineConfig.texts.askHeadline;
  }, []);

  let currentView: JSX.Element;

  if (state.screen === "intro") {
    currentView = <IntroView onOpen={() => dispatch({ type: "OPEN_ENVELOPE" })} />;
  } else if (state.screen === "ask") {
    currentView = (
      <AskView
        headline={askHeadline}
        askGifPath={valentineConfig.gifPaths.ask}
        onYes={() => dispatch({ type: "YES" })}
      />
    );
  } else if (state.screen === "celebrate") {
    currentView = (
      <CelebrateView
        headline={valentineConfig.texts.celebrateHeadline}
        gifPath={valentineConfig.gifPaths.celebrate}
        onDone={() => dispatch({ type: "CELEBRATE_DONE" })}
      />
    );
  } else if (state.screen === "choice") {
    currentView = (
      <ChoiceView
        headline={valentineConfig.texts.choiceHeadline}
        choices={valentineConfig.choices}
        onSelect={(choiceId) => dispatch({ type: "SELECT_CHOICE", payload: { choiceId } })}
      />
    );
  } else {
    currentView = (
      <FinalView
        finalGifPath={valentineConfig.gifPaths.final}
        isPsOpen={state.isPsOpen}
        onOpenPs={() => dispatch({ type: "OPEN_PS" })}
        onClosePs={() => dispatch({ type: "CLOSE_PS" })}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="bg-blobs" aria-hidden="true">
        <span className="bg-blob blob-a" />
        <span className="bg-blob blob-b" />
        <span className="bg-blob blob-c" />
      </div>
      <div className="bg-grain" aria-hidden="true" />
      <div className="bg-vignette" aria-hidden="true" />
      {currentView}
    </div>
  );
}
