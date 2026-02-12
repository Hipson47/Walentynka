import { useMemo, useReducer } from "react";
import { ValentineView } from "../views/ValentineView";
import { PointerFollower } from "../components/PointerFollower";
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

  return (
    <div className="app-shell">
      <div className="bg-blobs" aria-hidden="true">
        <span className="bg-blob blob-a" />
        <span className="bg-blob blob-b" />
        <span className="bg-blob blob-c" />
      </div>
      <div className="bg-grain" aria-hidden="true" />
      <div className="bg-vignette" aria-hidden="true" />
      <PointerFollower />
      <ValentineView
        screen={state.screen}
        askHeadline={askHeadline}
        isPsOpen={state.isPsOpen}
        onOpenEnvelope={() => dispatch({ type: "OPEN_ENVELOPE" })}
        onYes={() => dispatch({ type: "YES" })}
        onCelebrateDone={() => dispatch({ type: "CELEBRATE_DONE" })}
        onSelectChoice={(choiceId) => dispatch({ type: "SELECT_CHOICE", payload: { choiceId } })}
        onOpenPs={() => dispatch({ type: "OPEN_PS" })}
        onClosePs={() => dispatch({ type: "CLOSE_PS" })}
      />
    </div>
  );
}
