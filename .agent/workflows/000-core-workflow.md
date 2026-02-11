---
description: Core workflow, safety, and reporting standards for all tasks
---

# Core Workflow

## What to do

- Use Plan -> Execute -> Verify for non-trivial tasks.
- Keep diffs minimal, additive, and request-scoped.
- Preserve unrelated local changes already present in the worktree.
- End with a file-by-file summary plus validation status.
- Ask for approval before destructive actions (deletes, moves, history rewrites, cached mass removals).

## Don't do

- Do not commit secrets (`.env*`, tokens, keys).
- Do not add trackers/analytics scripts without explicit approval.
- Do not commit `node_modules`, `dist`, or other generated artifacts.
