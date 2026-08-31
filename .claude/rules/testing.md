---
paths: "**/*.spec.ts"
---

# Testing

> ShopSphere has **no test runner configured yet**. The fast correctness gate is
> `npm run typecheck` in each project (also enforced by the Stop hook). Treat a clean typecheck
> + a successful `npm run build` as the baseline "green" before finishing.

When adding tests:

- **Backend:** use **Vitest** (fast, ESM/TS-friendly) or Jest + ts-jest. Name files `*.spec.ts`
  next to the unit under test or under `backend/src/**/__tests__/`. Add a `"test"` script to
  `backend/package.json`. Mock Mongo with `mongodb-memory-server`; mock Clerk/Stripe/Cloudinary
  network calls — never hit real services or the real DB.
- **Frontend:** prefer Angular's default test setup or Vitest via `@analogjs/vite-plugin-angular`.
  Test signals/services and NgRx reducers/selectors as pure functions; use `TestBed` for components.
- **Priorities:** money math (paise), pagination, Zod validation, role/authorization guards,
  order-status transitions, and webhook handlers (with signature verification mocked).
- Keep tests deterministic and independent — no shared mutable state, no real time/network.
