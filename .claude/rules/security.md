# Security (always loaded)

- **Secrets:** `backend/.env` is gitignored and never edited by tools (the `block-secrets` hook
  enforces this). Only `.env.example` is committed. Frontend may contain the Clerk **publishable**
  key (`pk_*`) only — never a secret key.
- **Webhook signature verification is mandatory.** `/api/payment/webhook` (Stripe) and
  `/api/auth/webhook` (Clerk/svix) receive the **raw body** (registered before `express.json()` in
  `app.ts`). Never move those raw-body parsers, and never process a webhook without verifying its
  signature.
- **Every mutation is authenticated.** Protect routes with `requireAuth`/`requireAuthFast` and gate
  by role with `requireRole(...)`. Roles come from Clerk `publicMetadata.role`, mirrored to Mongo.
- **Validate all input with Zod** (`validators/index.ts`) before it touches the DB. Never trust
  `req.body`/`req.query`/`req.params` directly.
- **Authorization, not just authentication:** sellers may only touch their own products/orders;
  buyers only their own cart/orders. Always scope Mongo queries by the current user.
- Keep `helmet` and the CORS allow-list intact; CORS origin is driven by `env.frontendUrl`.
- Never log tokens, secret keys, or full connection strings.
