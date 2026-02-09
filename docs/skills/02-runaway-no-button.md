# Runaway NO Button Playbook

## When to use

- Updating `RunawayNoButton` movement behavior.
- Adding similar evasive/floating controls that must escape card bounds.

## Implementation checklist

- Keep escaped button in a Portal (`createPortal` to `document.body`) so fixed positioning is not trapped by transforms/overflow.
- Keep original placeholder button for layout and semantics; disable interaction once escaped version is active.
- Compute candidate positions using viewport size + edge padding.
- Avoid collisions with the YES button using expanded rect checks (`inflateRect` + `intersects`).
- Throttle escape moves (`MOVE_THROTTLE_MS`) and support pointer + click fallback.
- Cancel pending rAF callbacks on unmount.

## Pitfalls

- Rendering escaped button inside transformed parent (`.tilt-card`) and expecting true viewport-fixed behavior.
- Running unthrottled pointer handlers that cause jitter/jank.
- Breaking keyboard access by removing the non-portal fallback semantics.

## Validation steps

- Confirm NO escapes on hover and pointerdown on desktop and mobile.
- Confirm NO avoids overlapping YES area in repeated attempts.
- Confirm no stuck/frozen portal button after route/screen changes.
