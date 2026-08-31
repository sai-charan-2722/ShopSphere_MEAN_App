---
name: security-review
description: Security review tailored to ShopSphere — auth/authorization, Stripe & Clerk webhooks, payment integrity, secret handling, input validation, and data exposure. Use before merging changes that touch these areas, or for a periodic full-app audit.
---

# ShopSphere security review

Run a focused security pass over the requested scope (a diff, a subsystem, or the whole app). Work
through `checklist.md` and report findings by severity.

## How to run it

1. **Scope.** Default to the working diff (`git diff` / `git diff <base>...HEAD`). If asked for a
   full audit, cover the backend surface systematically.
2. **Delegate the heavy analysis** to the `security-auditor` agent when the scope is large; use this
   skill's checklist as the rubric.
3. **Gather evidence** with grep before concluding — e.g.
   - routes & guards: `requireAuth`, `requireAuthFast`, `requireRole`, `getAuth`
   - validation: `.parse(` and the schemas in `validators/index.ts`
   - webhooks: `constructEvent`, `svix`, the raw-body parsers in `app.ts`
   - secrets: `process.env`, `sk_`, `whsec_`, `mongodb+srv://`
   Then read the files the greps point to.
4. **Verify, don't assume.** For each control, confirm it's actually applied on the path in question
   (especially object-level authorization / IDOR).

## Output

- Findings as **Critical / High / Medium / Low**, each with `file:line`, the concrete exploit
  scenario, and the fix.
- A ranked list of the top risks.
- Explicitly note anything you could not verify.

See `checklist.md` for the full item-by-item list.
