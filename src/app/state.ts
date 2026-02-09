export type ScreenState = "intro" | "ask" | "celebrate" | "choice" | "final";

export type AppState = {
  screen: ScreenState;
  selectedChoiceId: string | null;
  isPsOpen: boolean;
};

export type AppEvent =
  | { type: "OPEN_ENVELOPE" }
  | { type: "YES" }
  | { type: "CELEBRATE_DONE" }
  | { type: "SELECT_CHOICE"; payload: { choiceId: string } }
  | { type: "OPEN_PS" }
  | { type: "CLOSE_PS" };

export const initialState: AppState = {
  screen: "intro",
  selectedChoiceId: null,
  isPsOpen: false,
};

export function appReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case "OPEN_ENVELOPE":
      if (state.screen !== "intro") return state;
      return { ...state, screen: "ask" };
    case "YES":
      if (state.screen !== "ask") return state;
      return { ...state, screen: "celebrate" };
    case "CELEBRATE_DONE":
      if (state.screen !== "celebrate") return state;
      return { ...state, screen: "choice" };
    case "SELECT_CHOICE":
      if (state.screen !== "choice") return state;
      return {
        ...state,
        screen: "final",
        selectedChoiceId: event.payload.choiceId,
      };
    case "OPEN_PS":
      return { ...state, isPsOpen: true };
    case "CLOSE_PS":
      return { ...state, isPsOpen: false };
    default:
      return state;
  }
}
