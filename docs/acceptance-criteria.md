# Acceptance Criteria

## Flow

- App uses one reducer-driven state machine (`intro -> ask -> celebrate -> choice -> final`).
- Exactly one view is rendered at a time (no router).
- After `YES`, ask view unmounts completely (no lingering `NIE` button).

## Runaway `NIE`

- Starts as normal in-row button aligned with `TAK`.
- On first interaction switches to `position: fixed` at current rect.
- Moves inside viewport with edge padding.
- Avoids overlap with `TAK` area plus buffer.
- Works on desktop hover and mobile tap/pointer down.
- Move calls are throttled to avoid jitter loops.

## Celebrate + Hearts

- Celebrate screen lasts about 5-6 seconds.
- Canvas hearts render in overlay and auto-stop.
- Overlay cleans rAF/listeners/particles on unmount.
- Reduced motion disables or strongly reduces particle motion.

## TiltCard

- Pointer-based tilt on non-coarse pointer devices.
- Subtle moving highlight follows pointer.
- Motion is damped/smoothed with rAF.
- Reduced motion disables continuous tilt behavior.

## Accessibility + UX

- Modal uses `role="dialog"` and `aria-modal="true"`.
- Escape and backdrop close modal.
- Focus returns to previous element after modal close.
- Mobile layout is stable at narrow widths (360px target).

## Template Readiness

- Texts/GIFs/choices configured in `src/config/valentine.config.ts`.
- Assets expected under `public/assets/...`.
- Legacy static version preserved in `legacy-static/`.
