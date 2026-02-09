# Tilt Card Playbook

## When to use

- Tweaking `TiltCard` motion feel or highlight behavior.
- Introducing pointer-driven parallax/tilt on card-like surfaces.

## Implementation checklist

- Use normalized pointer coordinates from `getBoundingClientRect()` and clamp to `[0, 1]`.
- Map normalized values to target tilt axes, then smooth with rAF + lerp.
- Keep one active rAF loop at a time (guard via `rafRef`).
- Update only CSS variables (`--tilt-x`, `--tilt-y`, `--mx`, `--my`) to avoid re-render loops.
- Disable or reduce tilt for coarse pointers and `prefers-reduced-motion`.

## Pitfalls

- Starting a new rAF on every pointer event without loop guards.
- Applying tilt on touch-first devices where intent is scroll, not hover.
- Forgetting to return to neutral tilt on pointer leave.

## Validation steps

- Desktop: smooth tilt follows cursor and settles back to neutral.
- Mobile/coarse pointer: tilt is effectively disabled.
- Reduced-motion mode: no perceptible tilt animation.
