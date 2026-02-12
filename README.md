# Valentine Card (React + Vite + TypeScript)

Interaktywna kartka walentynkowa jako single-page state machine:

1. Intro (koperta)
2. Pytanie (`TAK` + uciekające `NIE`)
3. Celebracja (canvas hearts)
4. Wybór randki (3 opcje)
5. Finał + modal `PS...`

## Prerequisites

- Node.js 18+ (LTS recommended)

## Quick start

```bash
npm install
npm run dev
```

Build i preview:

```bash
npm run build
npm run preview
```

## Testing

- `npm test` — Vitest (unit tests)
- `npm run test:e2e` — Playwright (starts preview server, runs E2E)
- `npm run test:all` — unit + E2E

Playwright generates `playwright-report/` i `test-results/` — są w `.gitignore`; uruchom `npm run test:e2e` aby je wygenerować lokalnie.

## Lint

ESLint nie jest skonfigurowany. Dodaj `npm run lint` w razie potrzeby.

## Customize in 3 minutes

1. Edytuj `src/config/valentine.config.ts`
   - teksty
   - opcje randki
   - ścieżki do GIF-ów
2. Podmień pliki w `public/assets/gif/`
   - `ask.gif`
   - `yay.gif`
   - `final.gif` (opcjonalnie)
3. Użyj `?to=Imię` w URL, np. `http://localhost:5173/?to=Ola`

## Struktura

- `src/app` - reducer i stan flow
- `src/views` - widoki ekranu 1:1
- `src/components` - `TiltCard`, `RunawayNoButton`, `Modal`, `ShareButton`
- `src/effects` - `HeartsCanvasOverlay` (canvas + rAF)
- `src/hooks` - `usePrefersReducedMotion`
- `src/config` - konfiguracja template

## Deploy (Vercel)

1. Import repo do Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy

## Screenshots / GIF preview

Dodaj własne podglądy do `docs/` i podlinkuj je tutaj, np.:

- `docs/preview-mobile.png`
- `docs/preview-flow.gif`

## Developer Playbooks

Krotkie playbooki dla powtarzalnych zadan dev znajdziesz w `docs/skills/`:

- `docs/skills/01-state-machine.md`
- `docs/skills/02-runaway-no-button.md`
- `docs/skills/02-runaway-no-portal.md`
- `docs/skills/03-tilt-card.md`
- `docs/skills/04-canvas-hearts.md`
- `docs/skills/05-background-layers.md`
- `docs/skills/06-modal-a11y.md`

## Cursor Rules

Repo uzywa modularnych regul w `.cursor/rules/*.mdc`. Reguly wymuszaja:

- minimalne, addytywne zmiany i workflow Plan -> Execute -> Verify
- brak sekretow, trackerow i commitowania `node_modules`
- zasady dla efektow (`Portal` dla fixed UI, cleanup `requestAnimationFrame`, reduced-motion)
- bazowe wymagania a11y i mobile-first performance

## Repo hygiene

Ignorowane artefakty: `node_modules/`, `dist/`, `playwright-report/`, `test-results/`, `*.tsbuildinfo`, `.agent/`, `.cursor/`. Regeneruj lokalnie: `npm run build` (dist), `npm run test:e2e` (raporty Playwright).

## License

MIT - patrz `LICENSE`.
