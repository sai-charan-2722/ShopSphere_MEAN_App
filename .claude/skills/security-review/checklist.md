# ShopSphere security checklist

## Authentication & authorization
- [ ] Every mutating/sensitive route is behind `requireAuth`/`requireAuthFast`.
- [ ] Role-gated routes use `requireRole(...)` with the correct roles (buyer/seller/admin).
- [ ] **Object-level authorization (IDOR):** sellers can only read/modify their own products &
      orders; buyers only their own cart, orders, reviews, wishlist. Mongo queries are scoped by the
      current user, not just by the id in the URL.
- [ ] Role is read from Clerk `publicMetadata.role` and cannot be set by the client.

## Webhooks & payments
- [ ] `/api/payment/webhook` and `/api/auth/webhook` receive the **raw** body; the raw parsers still
      precede `express.json()` in `app.ts`.
- [ ] Stripe events verified with `stripe.webhooks.constructEvent`; Clerk events verified with svix.
- [ ] Order totals are recomputed server-side from the cart — never trusted from the client.
- [ ] Amounts are integer paise; shipping/tax computed server-side.
- [ ] Duplicate/replayed webhook events are handled idempotently; order state transitions are guarded.

## Input validation & injection
- [ ] Body/query/params validated with Zod before use.
- [ ] No unsanitized user input reaches Mongo query operators (`$`-injection) or a `RegExp`.
- [ ] Pagination `limit` is capped.

## Secrets & config
- [ ] No secret keys, signing secrets, or credentialed connection strings in tracked files or logs.
- [ ] Only the Clerk **publishable** key appears client-side.
- [ ] Config read via `env.ts` / `environment.ts`; `.env` is gitignored.

## Transport, headers & CORS
- [ ] `helmet` is applied; CORS origin is the `env.frontendUrl` allow-list (not `*` with credentials).
- [ ] Socket.io CORS matches the same allow-list.

## Uploads & data exposure
- [ ] Cloudinary uploads validate file type and size; multer memory limits enforced.
- [ ] Responses don't leak other users' PII or internal-only fields; population is scoped.
