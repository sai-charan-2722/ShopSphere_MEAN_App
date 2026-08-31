# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ShopSphere is a MEAN-stack multi-vendor marketplace: an Express 4 + TypeScript API (`backend/`) and an Angular 21 standalone SPA (`frontend/`). `ShopSphere_PRD.md` is the original design spec — treat it as intent, not ground truth; the implementation has intentionally diverged in a few places noted below.

## Commands

The root `package.json` is **not** an npm workspace (despite the README's claim). It orchestrates the two sub-projects with `npm --prefix`. Install and run each project independently, or use the root scripts:

```bash
# From repo root
npm run install:all       # installs backend + frontend
npm run dev:backend        # tsx watch on :5000
npm run dev:frontend       # ng serve on :4200

# Backend (cd backend)
npm run dev                # hot-reload dev server (tsx)
npm run build              # tsc -> dist/ then copies email templates (scripts/copy-templates.mjs)
npm start                  # runs compiled dist/server.js
npm run typecheck          # tsc --noEmit
npm run seed               # seeds demo categories, a seller, and products (tsx src/utils/seed.ts)

# Frontend (cd frontend)
npm start                  # ng serve
npm run build              # ng build --configuration production
npm run typecheck          # tsc -p tsconfig.app.json --noEmit
```

There is **no test framework configured** in either project — no `test` script, no runner. Verify changes with `typecheck` and `build`.

### Version constraints (do not "upgrade" past these blindly)
- Angular 21 requires **TypeScript ≥ 5.9** and **NgRx 21**. Frontend pins `typescript ~5.9.2`.
- Backend is separate and pins `typescript ^5.6.3`, compiled as **CommonJS** (`module: commonjs`, extensionless imports — do not add `.js` extensions).

## Backend architecture

- **Entry flow:** `server.ts` builds the Express app via `createApp()` (`app.ts`), wraps it in an HTTP server, attaches Socket.io, connects Mongo, then listens. The `io` instance is **exported from `server.ts`** and imported by socket helpers in `sockets/order.socket.ts`.
- **Config:** all env access goes through `config/env.ts` (typed `env` object). It fails fast on missing vars in production but only warns in dev. Never read `process.env` directly elsewhere.
- **Request pipeline in `app.ts` (order matters):** helmet → cors → **raw body parsers for `/api/payment/webhook` and `/api/auth/webhook`** (Stripe/Clerk verify signatures against the raw body, so these are registered *before* `express.json()`) → json/urlencoded → `clerkMiddleware()` → `/health` → `/api` router → 404 → error handler.
- **Routing:** `routes/index.ts` mounts one router per domain under `/api/{auth,users,categories,products,cart,orders,payment,reviews,seller,admin}`.
- **Response & error conventions:**
  - Every response uses the `ApiResponse` wrapper (`utils/apiResponse.ts`) → `{ success, message, data?, meta? }`.
  - Controllers throw `HttpError(status, message)` (from `types/index.ts`) for expected failures; the global `errorMiddleware` translates them.
  - Async handlers are wrapped with `asyncHandler` (`utils/asyncHandler.ts`) so throws propagate to the error middleware. Keep this pattern for new routes.
- **Validation:** Zod schemas live in `validators/index.ts`. Controllers typically call `schema.parse(req.body)` **inline** (a `validate.middleware.ts` also exists for route-level use). ZodErrors are handled by the error middleware.
- **Auth:** `middlewares/auth.middleware.ts` exposes `requireAuth` (verifies Clerk session, fetches the Clerk user, attaches `req.userId/clerkUser/role`) and `requireAuthFast` (reads userId + role from session claims with no Clerk round-trip — use for high-frequency endpoints). `requireRole(...roles)` in `role.middleware.ts` gates by role.
- **User mirroring:** roles live in **Clerk `publicMetadata.role`**, mirrored into a MongoDB `User` doc keyed by `clerkId`. The Clerk webhook (`/api/auth/webhook`) creates/updates these, but `utils/currentUser.ts::getCurrentUser(req)` **lazily creates the mirror doc on first authenticated request** if the webhook hasn't landed. Use `getCurrentUser` in controllers to get the Mongo user.
- **Prices are stored in paise** (INR × 100) as integers everywhere, for Stripe compatibility. Never store rupees.
- **Payments:** Stripe-hosted Checkout (redirect flow, not embedded Elements). Order is created `pending` pre-redirect and confirmed `paid` by the `checkout.session.completed` webhook, with a fallback verification on the success endpoint. Payment logic in `controllers/payment.controller.ts` also emits socket events and sends email.
- **Uploads:** `multer` memory storage → streamed to Cloudinary (`services/cloudinary.service.ts`). No disk writes (Render's filesystem is ephemeral).
- **Email:** `services/email.service.ts` + Nodemailer/Gmail SMTP. Templates are `.html` files copied into `dist/` at build time by `scripts/copy-templates.mjs` — a plain `tsc` won't include them.

## Frontend architecture

- **Standalone Angular 21** (no NgModules), zone-based change detection, bootstrapped from `main.ts` with `app.config.ts`.
- **Clerk is loaded from a CDN, not via npm.** `@clerk/angular` is not used (it doesn't exist for this setup). `core/services/auth.service.ts` injects `clerk.browser.js` from the account's Frontend API host (derived by base64-decoding the publishable key), exposes `window.Clerk`, and mirrors auth state into **signals** (`user`, `isSignedIn`, `role`, `loaded`). It runs once via `provideAppInitializer` in `app.config.ts`. When no valid key is set it installs a no-op stub so guards never hang. If you touch auth, work through `AuthService` — don't reach for a Clerk Angular package.
- **Guards** (`core/guards/`) read `AuthService` signals: `authGuard`, `sellerGuard` (seller|admin), `adminGuard`.
- **Interceptors** (`core/interceptors/`): `authInterceptor` attaches the fresh Clerk JWT as `Authorization: Bearer`; `errorInterceptor` handles 401/403/500/network globally with toasts/redirects.
- **State:** NgRx `provideStore` with three feature slices — `cart`, `products`, `orders` (each has actions/reducer/effects/selectors under `store/`). Effects must `catchError` → dispatch a failure action. Store DevTools enabled.
- **Feature pages** live under `app/features/{home,auth,products,cart,checkout,orders,profile,seller,admin}`, lazy-loaded via `loadComponent` in `app.routes.ts`. Shared UI is in `app/shared/components`, pipes in `app/shared/pipes` (`currency-inr` divides paise by 100 for display).
- **Animations:** GSAP is centralized in `core/services/animation.service.ts` (registers `ScrollTrigger`/`MotionPathPlugin` once). Call GSAP in `ngAfterViewInit`, not `ngOnInit`. Angular `@trigger` animations live in `app/shared/animations.ts`.
- **Config:** `environments/environment.ts` (dev) / `environment.prod.ts` hold `apiUrl`, `wsUrl`, `clerkPublishableKey`. Never hardcode URLs — read from `environment`.
- **Real-time:** `core/services/socket.service.ts` wraps `socket.io-client`; buyers/sellers join personal rooms to receive `order:*` events.

## Project tooling (`.claude/`)

Detailed, path-scoped conventions live in `.claude/rules/` — `code-style.md` and `security.md` are
always loaded; `api-design.md`, `frontend.md`, `database.md`, and `testing.md` are scoped to their
areas. Also available: skills (`/security-review`, `/perf-audit`, `/release-notes`), slash commands
(`/fix-issue`, `/pr-review`, `/standup`), subagents (`code-reviewer`, `security-auditor`,
`test-writer`, `doc-writer`), and the `Code Review` output style. Hooks in `.claude/hooks/` block
secret leakage on every Edit/Write/Bash and run `typecheck` on both projects when a turn ends
(set `SHOPSPHERE_STOP_TYPECHECK=0` to skip).

## Deployment

Backend → Render (`backend/render.yaml`, build `npm install && npm run build`, start `npm start`). Frontend → Vercel (`frontend/vercel.json`, output `dist/frontend/browser`, SPA rewrite to `index.html`). After deploy, point the Clerk and Stripe webhook URLs at the Render domain and set `FRONTEND_URL` on Render for CORS + Stripe redirects.
