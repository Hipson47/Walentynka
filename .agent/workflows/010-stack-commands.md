---
description: Repository stack facts and canonical run commands
---

# Stack and Commands

## What to do

- Treat stack as verified: React 18, Vite 6, TypeScript 5.
- Assume strict TypeScript rules (`strict: true` in `tsconfig.app.json`).
- Use only scripts from `package.json`:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
- For lint/test mention explicitly: "not configured" when scripts are absent.

## Don't do

- Do not invent `npm run lint` or `npm test` flows when not defined.
- Do not assume Tailwind/ESLint/Prettier/PostCSS configs if files are absent.
