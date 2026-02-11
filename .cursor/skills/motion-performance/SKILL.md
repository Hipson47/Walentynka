---
name: motion-performance
description: Fix and review animation performance. Use when adding, changing, or debugging UI animations — CSS, WAAPI, rAF, or any motion work.
---

# Motion Performance

Fix animation performance issues. Adapted from ibelick/ui-skills for this animation-heavy project.

## How to Use

Apply these constraints to any UI animation work in this conversation. Do not migrate animation libraries unless explicitly requested.

## When to Apply

- Adding or changing UI animations (CSS, WAAPI, rAF)
- Refactoring janky interactions or transitions
- Implementing scroll-linked motion or reveal-on-scroll
- Animating layout, filters, masks, gradients, or CSS variables
- Reviewing components that use will-change, transforms, or measurement

## Rendering Steps Glossary

- **composite:** transform, opacity
- **paint:** color, borders, gradients, masks, images, filters
- **layout:** size, position, flow, grid, flex

## Rules by Priority

### 1. Never Patterns (CRITICAL)

- Do not interleave layout reads and writes in the same frame
- Do not animate layout continuously on large surfaces
- Do not drive animation from `scrollTop`, `scrollY`, or scroll events
- No `requestAnimationFrame` loops without a stop condition
- Do not mix multiple animation systems that each measure or mutate layout

### 2. Choose the Mechanism (CRITICAL)

- Default to `transform` and `opacity` for motion
- Use JS-driven animation only when interaction requires it
- Paint/layout animation acceptable only on small, isolated surfaces
- One-shot effects are acceptable more often than continuous motion
- Prefer downgrading technique over removing motion entirely

### 3. Measurement (HIGH)

- Measure once, then animate via transform/opacity
- Batch all DOM reads before writes
- Do not read layout repeatedly during an animation
- Prefer FLIP-style transitions for layout-like effects

### 4. Scroll (HIGH)

- Prefer Scroll/View Timelines for scroll-linked motion when available
- Use `IntersectionObserver` for visibility and pausing
- Do not poll scroll position for animation
- Pause or stop animations when off-screen

### 5. Paint (MEDIUM-HIGH)

- Paint-triggering animation allowed only on small, isolated elements
- Do not animate paint-heavy properties on large containers
- Do not animate CSS variables for transform, opacity, or position

### 6. Layers (MEDIUM)

- Compositor motion requires layer promotion, never assume it
- Use `will-change` temporarily and surgically
- Avoid many or large promoted layers

### 7. Blur and Filters (MEDIUM)

- Keep blur animation small (<=8px)
- Use blur only for short, one-time effects
- Never animate blur continuously or on large surfaces
- Prefer opacity and translate before blur

### 8. Project-Specific: Particle Systems

- Cap particle counts and spawn intervals explicitly
- Keep decorative fullscreen overlays non-interactive (`pointer-events: none`)
- Always cancel rAF ids and remove listeners/timers in cleanup
- Throttle high-frequency pointer handlers
- Support reduced motion with `usePrefersReducedMotion` and CSS fallback

## Review Guidance

- Enforce critical rules first (never patterns)
- Choose the least expensive rendering work that matches the intent
- For any non-default choice, state the constraint that justifies it
- Prefer actionable notes and concrete alternatives over theory
