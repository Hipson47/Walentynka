---
name: accessibility-review
description: Fix accessibility issues. Use when adding or changing buttons, links, inputs, dialogs, modals, keyboard interactions, or focus behavior.
---

# Accessibility Review

Fix accessibility issues with minimal, targeted changes. Adapted from ibelick/ui-skills.

## How to Use

Apply these constraints to any UI work involving interactive elements. Do not rewrite large parts of the UI. Prefer minimal, targeted fixes.

## When to Apply

- Adding or changing buttons, links, inputs, menus, dialogs
- Building forms, validation, error states
- Implementing keyboard shortcuts or custom interactions
- Working on focus states, focus trapping, or modal behavior
- Rendering icon-only controls
- Adding hover-only interactions or hidden content

## Rules by Priority

### 1. Accessible Names (CRITICAL)

- Every interactive control must have an accessible name
- Icon-only buttons must have `aria-label` or `aria-labelledby`
- Every input, select, and textarea must be labeled
- Links must have meaningful text (no "click here")
- Decorative icons must be `aria-hidden`

### 2. Keyboard Access (CRITICAL)

- Do not use div or span as buttons without full keyboard support
- All interactive elements must be reachable by Tab
- Focus must be visible for keyboard users
- Do not use `tabindex` greater than 0
- Escape must close dialogs or overlays

### 3. Focus and Dialogs (CRITICAL)

- Modals must trap focus while open
- Restore focus to the trigger on close
- Set initial focus inside dialogs
- Opening a dialog should not scroll the page unexpectedly

### 4. Semantics (HIGH)

- Prefer native elements (`button`, `a`, `input`) over role-based hacks
- If a role is used, required aria attributes must be present
- Do not skip heading levels

### 5. Forms and Errors (HIGH)

- Errors must be linked to fields using `aria-describedby`
- Required fields must be announced
- Invalid fields must set `aria-invalid`

### 6. Announcements (MEDIUM-HIGH)

- Critical form errors should use `aria-live`
- Loading states should use `aria-busy` or status text
- Expandable controls must use `aria-expanded` and `aria-controls`

### 7. Contrast and States (MEDIUM)

- Ensure sufficient contrast for text and icons
- Hover-only interactions must have keyboard equivalents
- Disabled states must not rely on color alone
- Do not remove focus outlines without a visible replacement

### 8. Media and Motion (LOW-MEDIUM)

- Images must have correct alt text (meaningful or empty)
- Respect `prefers-reduced-motion` for non-essential motion
- Avoid autoplaying media with sound

### 9. Tool Boundaries (CRITICAL)

- Prefer minimal changes, do not refactor unrelated code
- Do not add aria when native semantics already solve the problem

## Project-Specific: Valentine's Modals

- Keep modal semantics: `role="dialog"` and `aria-modal="true"`
- Support close on Escape and backdrop click (overlay-only target)
- Move focus into modal on open, restore focus to opener on close
- Lock body scroll while open and restore it on cleanup
- Keep close controls keyboard-accessible with clear labels

## Review Guidance

- Fix critical issues first (names, keyboard, focus)
- Prefer native HTML before adding aria
- Quote the exact snippet, state the failure, propose a small fix
