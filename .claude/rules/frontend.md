---
paths: frontend/src/**
---

# Frontend (Angular 21)

- **Standalone components only** — no NgModules. Lazy-load feature pages with `loadComponent` in
  `app.routes.ts`. Register providers in `app.config.ts`.
- **Signals for local/reactive state**; use `computed` for derived values. Prefer the modern control
  flow (`@if`/`@for`) in templates.
- **Auth goes through `AuthService`** (`core/services/auth.service.ts`), which loads Clerk's
  `clerk.browser.js` from the CDN and exposes `user`/`isSignedIn`/`role` signals. Do **not** add
  `@clerk/angular` or `@clerk/clerk-js` npm packages — this project deliberately avoids them.
- **NgRx** holds `cart`, `products`, `orders`. Every effect must `catchError` → dispatch a
  `*Failure` action (and return `EMPTY`/`of(...)`), never swallow errors silently.
- **HTTP:** call the backend through the typed services in `core/services/*`. The `authInterceptor`
  attaches the Clerk JWT and `errorInterceptor` handles 401/403/500 globally — don't re-implement.
- **Never hardcode URLs.** Read `apiUrl`/`wsUrl`/`clerkPublishableKey` from `environments/environment`.
- **GSAP** lives in `core/services/animation.service.ts` (plugins registered once). Trigger DOM
  animations in `ngAfterViewInit`, never `ngOnInit`. Reusable Angular `@trigger`s are in
  `shared/animations.ts`.
- **Display money** with the `currency-inr` pipe (paise → ₹); never format currency inline.
