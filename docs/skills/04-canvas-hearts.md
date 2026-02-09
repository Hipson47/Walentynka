# Canvas Hearts Playbook

## When to use

- Editing `HeartsCanvasOverlay` particle behavior.
- Adding new celebratory canvas overlays with lightweight animation.

## Implementation checklist

- Run animation in a single rAF loop with `dt` timing (`(ts - lastTs) / 1000`).
- Clamp `dt` (for tab wake-up spikes) before updating physics.
- Keep particle caps bounded by mode and reduced-motion preference.
- Use burst + sustain spawn strategy with explicit intervals and lifetime limits.
- Keep overlay fixed fullscreen with `pointer-events: none`.
- Cleanup all resources on unmount: cancel rAF, remove listeners, clear arrays/canvas.

## Pitfalls

- Unbounded particle growth that degrades FPS on low-end phones.
- Multiple active loops after rerenders or variant switches.
- Canvas size mismatch on resize or high-DPI devices.

## Validation steps

- Verify celebrate and ambient variants have different intensity and still stay smooth.
- Toggle reduced-motion and verify lower particle count / calmer behavior.
- Resize viewport and confirm crisp rendering (no blur/stretch artifacts).
