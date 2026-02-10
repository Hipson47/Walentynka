import { describe, expect, it } from "vitest";
import { appReducer, initialState, type AppState } from "../app/state";

describe("appReducer", () => {
  it("starts with intro screen", () => {
    expect(initialState.screen).toBe("intro");
    expect(initialState.selectedChoiceId).toBeNull();
    expect(initialState.isPsOpen).toBe(false);
  });

  describe("OPEN_ENVELOPE", () => {
    it("moves from intro to ask", () => {
      const next = appReducer(initialState, { type: "OPEN_ENVELOPE" });
      expect(next.screen).toBe("ask");
    });

    it("ignores event when not on intro screen", () => {
      const state: AppState = { ...initialState, screen: "ask" };
      const next = appReducer(state, { type: "OPEN_ENVELOPE" });
      expect(next).toBe(state);
    });
  });

  describe("YES", () => {
    it("moves from ask to celebrate", () => {
      const state: AppState = { ...initialState, screen: "ask" };
      const next = appReducer(state, { type: "YES" });
      expect(next.screen).toBe("celebrate");
    });

    it("ignores event when not on ask screen", () => {
      const state: AppState = { ...initialState, screen: "intro" };
      const next = appReducer(state, { type: "YES" });
      expect(next).toBe(state);
    });
  });

  describe("CELEBRATE_DONE", () => {
    it("moves from celebrate to choice", () => {
      const state: AppState = { ...initialState, screen: "celebrate" };
      const next = appReducer(state, { type: "CELEBRATE_DONE" });
      expect(next.screen).toBe("choice");
    });

    it("ignores event when not on celebrate screen", () => {
      const state: AppState = { ...initialState, screen: "ask" };
      const next = appReducer(state, { type: "CELEBRATE_DONE" });
      expect(next).toBe(state);
    });
  });

  describe("SELECT_CHOICE", () => {
    it("moves from choice to final and stores choice id", () => {
      const state: AppState = { ...initialState, screen: "choice" };
      const next = appReducer(state, { type: "SELECT_CHOICE", payload: { choiceId: "dinner" } });
      expect(next.screen).toBe("final");
      expect(next.selectedChoiceId).toBe("dinner");
    });

    it("ignores event when not on choice screen", () => {
      const state: AppState = { ...initialState, screen: "celebrate" };
      const next = appReducer(state, { type: "SELECT_CHOICE", payload: { choiceId: "movie" } });
      expect(next).toBe(state);
    });
  });

  describe("OPEN_PS / CLOSE_PS", () => {
    it("opens PS modal", () => {
      const next = appReducer(initialState, { type: "OPEN_PS" });
      expect(next.isPsOpen).toBe(true);
    });

    it("closes PS modal", () => {
      const state: AppState = { ...initialState, isPsOpen: true };
      const next = appReducer(state, { type: "CLOSE_PS" });
      expect(next.isPsOpen).toBe(false);
    });
  });

  describe("full happy path", () => {
    it("traverses all screens in order", () => {
      let state = initialState;
      expect(state.screen).toBe("intro");

      state = appReducer(state, { type: "OPEN_ENVELOPE" });
      expect(state.screen).toBe("ask");

      state = appReducer(state, { type: "YES" });
      expect(state.screen).toBe("celebrate");

      state = appReducer(state, { type: "CELEBRATE_DONE" });
      expect(state.screen).toBe("choice");

      state = appReducer(state, { type: "SELECT_CHOICE", payload: { choiceId: "walk" } });
      expect(state.screen).toBe("final");
      expect(state.selectedChoiceId).toBe("walk");

      state = appReducer(state, { type: "OPEN_PS" });
      expect(state.isPsOpen).toBe(true);

      state = appReducer(state, { type: "CLOSE_PS" });
      expect(state.isPsOpen).toBe(false);
    });
  });
});
