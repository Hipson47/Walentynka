# Modal Accessibility Playbook

## When to use

- Editing `Modal` behavior or introducing additional dialogs.
- Reviewing keyboard and focus UX for overlay interactions.

## Implementation checklist

- Use semantic dialog container: `role="dialog"`, `aria-modal="true"`, labeled heading.
- Capture active element before open and restore focus on close.
- Move initial focus to a safe control (usually close button).
- Close on `Escape` and overlay click (only when target is backdrop).
- Lock document scroll while open; restore lock state on cleanup.
- Ensure close control is keyboard reachable and has accessible name.

## Pitfalls

- Leaving focus behind modal content or not restoring it after close.
- Forgetting to unregister global keydown listeners.
- Closing on any click inside modal content instead of backdrop-only.

## Validation steps

- Keyboard-only test: open, tab through, close with Escape, focus returns correctly.
- Screen reader spot check for dialog title/role announcement.
- Confirm body scroll is locked only while modal is open.
