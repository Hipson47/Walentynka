---
name: ui-baseline
description: Enforces UI quality baseline to prevent sloppy interfaces. Use when building or reviewing any UI component, layout, or visual element.
---

# UI Baseline

Enforces an opinionated UI baseline to prevent AI-generated interface slop. Adapted from ibelick/baseline-ui for this vanilla CSS + React project.

## Stack (Project-Specific)

- MUST use vanilla CSS (files in `src/styles/`)
- MUST NOT use Tailwind CSS
- MUST use vanilla `requestAnimationFrame` or CSS animations/transitions for motion
- MUST use the project's existing component primitives first

## Components

- MUST use accessible component primitives for anything with keyboard/focus behavior
- MUST add an `aria-label` to icon-only buttons
- NEVER rebuild keyboard or focus behavior by hand unless explicitly requested
- NEVER mix primitive systems within the same interaction surface

## Interaction

- MUST use a confirmation dialog for destructive or irreversible actions
- SHOULD use structural skeletons for loading states
- NEVER use `height: 100vh`, use `height: 100dvh`
- MUST respect `safe-area-inset` for fixed elements
- MUST show errors next to where the action happens
- NEVER block paste in input or textarea elements

## Animation

- MUST animate only compositor props (`transform`, `opacity`) by default
- NEVER animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`) on large surfaces
- SHOULD use `ease-out` on entrance
- NEVER exceed `200ms` for interaction feedback
- MUST pause looping animations when off-screen
- MUST respect `prefers-reduced-motion`
- SHOULD avoid animating large images or full-screen surfaces

## Typography

- MUST use `text-wrap: balance` for headings and `text-wrap: pretty` for body
- MUST use `font-variant-numeric: tabular-nums` for data

## Layout

- MUST use a fixed z-index scale (no arbitrary z-index values)
- SHOULD use `aspect-ratio` for square/ratio-locked elements

## Performance

- NEVER animate large `blur()` or `backdrop-filter` surfaces
- NEVER apply `will-change` outside an active animation
- NEVER use `useEffect` for anything that can be expressed as render logic

## Design

- MUST give empty states one clear next action
- SHOULD limit accent color usage to one per view
- SHOULD use existing CSS custom properties before introducing new ones
- Keep decorative fullscreen overlays non-interactive (`pointer-events: none`)
