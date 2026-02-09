# Runaway NO (Portal) Playbook

## When to use

- Updating `RunawayNoButton` behavior.
- Fixing issues where escaped button is clipped or mispositioned.

## Implementation checklist

- Keep escaped button in `createPortal(..., document.body)`.
- Keep in-flow placeholder button for layout and semantics.
- Compute position from viewport bounds with edge padding.
- Avoid YES collisions using expanded rect checks.
- Throttle move triggers and keep bounded retry count.
- Cancel pending rAF work on unmount.

## Pitfalls

- Fixed positioning inside transformed/overflow parents.
- Unthrottled pointer enter/down causing jitter.
- Breaking keyboard fallback while switching to portal element.

## Validation steps

- Verify repeated escapes avoid YES on desktop.
- Verify pointerdown/click path works on touch devices.
- Verify no stuck portal button after view transitions.
