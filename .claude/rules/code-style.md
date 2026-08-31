# Code style (always loaded)

- **TypeScript strict everywhere.** No `any` — model data with interfaces/types. Both projects
  compile under `strict: true`. Backend is **CommonJS** (extensionless imports, no `.js` suffixes);
  frontend is Angular 21 ESM.
- **Match surrounding code.** Files are formatted with 2-space indent, single quotes, semicolons,
  trailing commas. Keep the existing box-comment section headers (`// ── Section ──`) where present.
- **Naming:** backend files are `name.type.ts` (`product.controller.ts`, `Order.model.ts`);
  Angular files are `name.component.ts` / `name.service.ts` / `name.guard.ts`.
- **No new dependencies** without a clear need — prefer what's already installed. Respect the pinned
  versions (Angular 21 ⇒ TS ≥ 5.9 & NgRx 21; backend TS 5.6 / CommonJS). Don't "upgrade" past these.
- **Money is always paise** (INR × 100) as integers across backend, DB, and API. Only the frontend
  `currency-inr` pipe divides by 100 for display. Never introduce float rupees.
- **No secrets in code.** Read config from `backend/src/config/env.ts` (backend) or
  `environment.ts` (frontend). Never `process.env.X` directly outside `env.ts`.
- Prefer small, focused diffs. Don't reformat untouched code.
