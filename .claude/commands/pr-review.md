---
description: Review a GitHub pull request for ShopSphere
argument-hint: <pr-number>
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*), Bash(git *), Read, Grep, Glob
---

Review pull request **#$1**. This is a read-only review — do not modify code.

1. Load it: `gh pr view $1` for title/description and `gh pr diff $1` for the diff.
2. Read the changed files (and enough surrounding code) to judge correctness, not just style.
3. Delegate the deep pass to the **code-reviewer** agent; for any change touching auth, payments,
   webhooks, or secrets, also run the **security-auditor** agent.
4. Evaluate against `.claude/rules/*`: auth + object-level authorization, Zod validation, webhook
   signature/raw-body integrity, money-in-paise, `ApiResponse`/`HttpError`/`asyncHandler`, NgRx
   `catchError`, standalone/signals, no hardcoded secrets or URLs, sensible indexes.

Output a review with a one-line verdict (**Approve / Approve with nits / Request changes**), then
findings grouped **Blocking / Should-fix / Nits**, each with `file:line` and a concrete suggestion.
