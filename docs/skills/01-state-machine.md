# State Machine Playbook

## When to use

- Adding a new screen step to the flow (`intro -> ask -> celebrate -> choice -> final`).
- Extending user events handled by `appReducer`.
- Changing transition timing or side effects around screen switches.

## Implementation checklist

- Add/adjust union types in `src/app/state.ts` (`ScreenState`, `AppEvent`).
- Keep reducer transitions explicit and guard invalid transitions by returning current state.
- Keep side effects in views/components (`useEffect`), not inside reducer logic.
- If a new view is introduced, wire it in `src/app/App.tsx` with clear branch handling.
- Ensure data needed by later views is stored in state before transition.

## Pitfalls

- Mutating state or embedding side effects in reducer branches.
- Allowing events from wrong screen to transition unexpectedly.
- Forgetting cleanup of timers/rAF when moving between screens.

## Validation steps

- Click through full happy path from intro to final.
- Trigger events out of order (e.g., "YES" outside ask) and verify no transition.
- Confirm all temporary effects stop after leaving a screen.
