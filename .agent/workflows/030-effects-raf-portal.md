---
description: Rules for portal-based UI and animation lifecycle cleanup
---

# Effects, rAF, Portal

## What to do

- For fixed/fullscreen UI that must escape transforms/overflow, use Portal to `document.body`.
- Keep exactly one active `requestAnimationFrame` loop per effect path.
- Always cancel rAF ids and remove listeners/timers in cleanup.
- Throttle high-frequency pointer handlers and bound retry loops.
- Cap particle counts/spawn intensity for sustained animations.
- Support reduced motion with `usePrefersReducedMotion` and CSS fallback.

## Don't do

- Do not rely on fixed positioning inside transformed parents.
- Do not leak animation loops or window event listeners on unmount.
- Do not run unbounded pointer-driven loops or particle growth.
