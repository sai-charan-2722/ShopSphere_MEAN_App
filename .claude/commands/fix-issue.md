---
description: Implement a fix for a GitHub issue by number
argument-hint: <issue-number>
allowed-tools: Bash(gh issue view:*), Bash(git *), Bash(npm --prefix * run typecheck), Read, Edit, Write, Grep, Glob
---

Fix GitHub issue **#$1** in ShopSphere.

1. Read the issue: run `gh issue view $1` (add `--comments`) and summarize the problem and acceptance
   criteria in one or two lines.
2. Create a branch off the current one: `git checkout -b fix/issue-$1-<short-slug>`.
3. Locate the relevant code (backend `routes/`+`controllers/`+`models/`, or frontend
   `features/`+`core/services/`+`store/`). Read enough context to be sure of the root cause.
4. Implement the fix, following `.claude/rules/*` (ApiResponse/HttpError/asyncHandler + Zod on the
   backend; standalone components + signals + NgRx `catchError` on the frontend; money in paise;
   config from `env.ts`/`environment.ts`).
5. Verify: `npm --prefix backend run typecheck` and/or `npm --prefix frontend run typecheck`.
6. Summarize what changed and why, referencing `file:line`. Do **not** push or open a PR unless I ask
   — end by proposing a commit message that closes the issue (`Fixes #$1`).
