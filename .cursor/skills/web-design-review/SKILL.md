---
name: web-design-review
description: Review UI code for web interface best practices. Use when asked to review UI, check design quality, audit UX, or check site against best practices.
---

# Web Design Review

Review files for compliance with web interface best practices. Inspired by Vercel Labs' web-design-guidelines skill.

## How It Works

1. Read the specified files (or prompt user for files/pattern)
2. Check against all rules below
3. Output findings in terse `file:line` format:
   - violation (quote the exact line or snippet)
   - why it matters (one short sentence)
   - a concrete fix (code-level suggestion)

## Guidelines

### Visual Hierarchy

- Headings must have clear size/weight progression
- Primary actions must be visually distinct from secondary
- Whitespace must create clear groupings
- Content should follow F-pattern or Z-pattern reading flow

### Responsiveness

- All layouts must work from 320px to 1440px+
- Touch targets must be at least 44×44px
- Text must be readable without horizontal scroll
- Images must be responsive (use `max-width: 100%`)

### Color and Contrast

- Text must have minimum 4.5:1 contrast ratio (WCAG AA)
- Large text (18px+) must have minimum 3:1 ratio
- Interactive elements must have visible focus indicators
- Don't rely on color alone to convey information

### Motion and Animation

- All motion must serve a purpose (feedback, orientation, delight)
- Respect `prefers-reduced-motion`
- Entrance animations should be subtle and fast (<300ms)
- Loading states should provide visual feedback

### Forms and Inputs

- Labels must be always visible (no placeholder-only labels)
- Error states must be clear and adjacent to the field
- Required fields must be indicated
- Submit buttons must indicate loading state

### Performance Indicators

- First paint should feel instant (<1s perceived)
- Interactive elements should respond within 100ms
- Scroll should be smooth (60fps)
- Avoid large layout shifts (CLS)

## Review Output Format

```
src/views/AskScreen.tsx:42 — button lacks visible focus state
  → add outline on :focus-visible

src/styles/global.css:15 — heading contrast ratio ~3.2:1
  → darken to meet 4.5:1 WCAG AA
```
