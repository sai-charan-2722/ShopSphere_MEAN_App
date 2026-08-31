---
name: perf-audit
description: Performance audit for ShopSphere — MongoDB query/index efficiency, N+1 population, pagination, aggregation pipelines, Angular bundle size & lazy loading, change detection, and image delivery. Use when pages/APIs feel slow or before a perf-sensitive release.
---

# ShopSphere performance audit

Audit the requested scope for performance problems and propose concrete, low-risk fixes.

## Backend (MongoDB / Express / Socket.io)
- **Indexes:** every list/filter/sort path is backed by an index (product text + compound indexes,
  `buyer/createdAt`, `items.seller/orderStatus`, unique `clerkId`/`email`). Flag hot queries doing
  collection scans.
- **N+1 & population:** look for per-item queries inside loops; use a single `populate`/`$lookup` or
  batched `$in` instead. Populate only needed fields.
- **`.lean()`** on read-only queries; avoid loading full docs when a projection suffices.
- **Pagination:** all list endpoints paginate with a capped `limit`; no unbounded `find()`.
- **Aggregations:** analytics pipelines `$match` early, project narrowly, and are index-aware.
- **Payload size:** responses aren't over-fetching; `express.json` limit is sane.

## Frontend (Angular 21)
- **Lazy loading:** every feature route uses `loadComponent`; nothing heavy in the initial bundle.
- **Bundle:** run `npm --prefix frontend run build` and read the reported bundle sizes; flag large
  deps and budget overruns (target initial < ~200KB gzipped per the PRD).
- **Change detection / signals:** prefer signals + `computed`; avoid heavy work in templates and
  repeated getter calls in `@for`.
- **Network:** dedupe redundant API calls; leverage NgRx state instead of refetching; use skeleton
  loaders rather than blocking.
- **Images:** Cloudinary URLs use `f_auto,q_auto`; product lists request appropriately sized images.
- **GSAP:** animations run in `ngAfterViewInit`, are cleaned up, and ScrollTriggers are killed on
  destroy to avoid leaks.

## Method & output
Measure or read evidence before claiming a win (index definitions, `explain()` if available, actual
bundle output). Report each issue with impact (high/med/low), `file:line`, and the specific change.
Prefer the highest-impact, lowest-risk fixes first.
