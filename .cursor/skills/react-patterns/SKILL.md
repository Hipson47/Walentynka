---
name: react-patterns
description: React best practices for this project. Use when writing or reviewing React components, hooks, state management, or performance optimization.
---

# React Patterns

React best practices tailored for this React 18 + Vite 6 + TypeScript 5 project. Inspired by Vercel Engineering team's react-best-practices skill.

## Project Architecture

- **State:** Reducer flow in `src/app/state.ts` + `useReducer` in `src/app/App.tsx`
- **Views:** Screen-level rendering in `src/views/`
- **Components:** Reusable building blocks in `src/components/`
- **Effects:** Animation/effect logic in `src/effects/`
- **Hooks:** Custom hooks in `src/hooks/`
- **Config:** Copy/asset paths in `src/config/valentine.config.ts`

## Rules by Priority

### 1. Component Design (CRITICAL)

- Keep components focused on a single responsibility
- Separate data/logic from presentation
- Use TypeScript interfaces for all props
- Avoid prop drilling — lift state or use context sparingly
- Do not move reducer transitions into view components

### 2. State Management (HIGH)

- All screen transitions go through the reducer in `src/app/state.ts`
- No local state for cross-screen concerns
- Keep state shape minimal and flat
- Derive computed values from state instead of duplicating

### 3. Hooks (HIGH)

- Extract reusable logic into custom hooks in `src/hooks/`
- Minimize dependencies in `useEffect` dependency arrays
- Do not use `useEffect` for anything that can be expressed as render logic
- Always clean up effects: cancel rAF, remove listeners, clear timers

### 4. Performance (MEDIUM)

- Prefer `transform`/`opacity` for animations over layout properties
- Use `React.memo` only when profiling shows re-render waste
- Avoid creating objects/arrays inline in JSX (stable references)
- Lazy load routes/screens only if bundle grows large

### 5. TypeScript (MEDIUM)

- Strict mode is enabled — no `any` types
- Use `as const` for literal types
- Prefer discriminated unions for state variants
- Export types alongside components when consumers need them

### 6. Separation of Concerns (MEDIUM)

- Do not mix screen orchestration with low-level effect implementation
- Do not duplicate config text/assets across multiple files
- Keep animation logic in `src/effects/`, not in views
- Styles in `src/styles/` — use vanilla CSS, not Tailwind

## Anti-Patterns

- Do not put business logic in event handlers directly
- Do not use `useEffect` as a state synchronization mechanism
- Do not catch errors silently — log or display them
- Do not use index as key for lists that can reorder
