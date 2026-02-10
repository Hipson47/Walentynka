# Acceptance Criteria

## Flow

- App uses one reducer-driven state machine (`intro -> ask -> celebrate -> choice -> final`).
- Exactly one view is rendered at a time (no router).
- After `YES`, ask view unmounts completely (no lingering `NIE` button).
- Intro-only enhancements do not alter reducer events or screen order.

## Intro Scroll Stage + Hero

- Intro uses an internal scroll container with two snap sections (`HeroSnap`, `LandingSnap`).
- Window/body scrolling is not hijacked; wheel/touch behavior remains native and passive.
- Hero image comes from `valentineConfig.assets.heroImage`.
- Distortion responds to **scroll velocity** smoothing (not raw position), with dt-aware damping and decay.
- `MotionMode` toggle (`Full`, `Lite`, `Off`) is visible on Intro and persisted in localStorage.
- `prefers-reduced-motion: reduce` defaults mode to `Off` unless user has a stored choice.
- Intro provides a focusable `Skip intro animation` control with an accessible label.

## Intro Trigger + Envelope

- Envelope fly-in triggers exactly once when either:
  - C1: `vNorm >= 0.12` held for at least `60ms`, or
  - C2: landing section intersection ratio reaches `>= 0.65`.
- Fly-in follows spiral-to-center path (`loopsCount` default `2.25`, duration `1800ms`).
- Open CTA fades in after landing (`80ms` delay + `240ms` fade) and enables after fade.
- Envelope remains a semantic `<button>` and keeps existing open timing (`620ms` before `onOpen`).
- `MotionMode=Off` starts with landed envelope (no loops, no WebGL animation).
- Skip control moves directly to landed state and reveals/enables CTA without spiral loops.

## Intro Fallback + Performance

- Fallback chain is explicit: `WebGPU (optional flag) -> WebGL2 -> CSS fallback -> static`.
- CSS fallback uses static hero image and mild velocity scale (`<= +1.5%`).
- If hero image preload exceeds `1200ms`, Intro falls back to CSS/static background while envelope/CTA remain functional.
- WebGL context loss switches immediately to CSS fallback.
- Render tiering is deterministic (`high/medium/low`) with DPR/renderScale caps.
- On mobile low battery (`<20%`), max tier is capped to `medium` (when Battery API is available).
- Sustained FPS drops degrade tier and eventually force CSS fallback at low tier.
- Tier recovery requires `>=10s` of good FPS and does not occur during active scrolling (`vNorm >= 0.08`).
- RAF loop pauses when tab hidden, Intro visibility is below `0.25`, or mode is `Off`.

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
