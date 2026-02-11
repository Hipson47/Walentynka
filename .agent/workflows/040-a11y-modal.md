---
description: Accessibility rules for modal and keyboard interactions
---

# Modal Accessibility

## What to do

- Keep modal semantics: `role="dialog"` and `aria-modal="true"`.
- Support close on Escape and backdrop click (overlay-only target).
- Move focus into modal on open, restore focus to opener on close.
- Lock body scroll while open and restore it on cleanup.
- Keep close controls keyboard-accessible with clear labels.

## Don't do

- Do not close on generic click events inside modal content.
- Do not leave keydown listeners or body style mutations after close.
- Do not hide action controls from keyboard flow without replacement.
