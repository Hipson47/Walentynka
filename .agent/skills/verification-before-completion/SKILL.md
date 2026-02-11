---
name: verification-before-completion
description: Use before claiming work is complete, fixed, or passing. Requires running verification commands and confirming output before making any success claims.
---

# Verification Before Completion

## Overview

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Build succeeds | `npm run build`: exit 0 | "Linter passed", "logs look good" |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Dev server works | `npm run dev`: no errors | "Should work" |

## Red Flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Done!")
- About to commit/push without verification
- Relying on partial verification
- **ANY wording implying success without having run verification**

## Verification Commands for This Project

```bash
# Build check
npm run build

# Dev server
npm run dev

# Playwright e2e (if configured)
npx playwright test

# TypeScript check
npx tsc --noEmit
```

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.
