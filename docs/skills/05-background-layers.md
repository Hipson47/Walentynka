# Background Layers Playbook

## When to use

- Iterating on atmospheric background visuals (`.app-shell`, blobs, grain).
- Adding subtle depth without expensive runtime effects.

## Implementation checklist

- Build base look from layered gradients in CSS, not runtime JS.
- Keep blobs as fixed-position, blurred elements with low opacity.
- Keep decorative layers non-interactive (`pointer-events: none`) and behind content (`z-index`).
- Keep grain/noise subtle to avoid readability loss and compression artifacts.
- If adding micro-parallax, keep amplitude tiny and disable under reduced-motion.

## Pitfalls

- Heavy blur + large repaint areas causing mobile frame drops.
- Decorative layers intercepting input events.
- Contrast drops that reduce legibility of card text/buttons.

## Validation steps

- Check readability over backgrounds in both light and darker displays.
- Validate smooth scrolling/input on mid-range mobile.
- Verify reduced-motion media query hides or simplifies decorative motion.
