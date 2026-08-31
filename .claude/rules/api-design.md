---
paths: backend/src/**
---

# Backend API design

- **Uniform response envelope.** Every endpoint returns `ApiResponse` (`utils/apiResponse.ts`) →
  `{ success, message, data?, meta? }`. List endpoints put pagination in `meta`.
- **Error handling.** Throw `HttpError(status, message)` (from `types/index.ts`) for expected
  failures; let the global `errorMiddleware` translate them (it also handles `ZodError`). Don't
  `res.status(...).json(...)` ad-hoc error shapes.
- **Async safety.** Route handlers either use the `asyncHandler` wrapper or are `async` functions
  whose throws reach the error middleware — never leave a rejected promise unhandled.
- **Validation at the edge.** Parse `req.body`/`req.query` with the matching Zod schema from
  `validators/index.ts` (controllers call `schema.parse(...)` inline). Add new schemas there.
- **Auth + roles.** Apply `requireAuth`/`requireRole(...)` in the route file. Use
  `getCurrentUser(req)` (`utils/currentUser.ts`) to resolve the Mongo `User` — it lazily creates the
  mirror doc if the Clerk webhook hasn't landed yet.
- **Pagination.** List endpoints accept `?page=1&limit=12` via the `utils/pagination.ts` helper;
  default 12, cap the max. Always return `meta { page, limit, total, totalPages }`.
- **New domains** get a `*.routes.ts` + `*.controller.ts`, mounted in `routes/index.ts` under
  `/api/<domain>`. Business logic that spans models goes in `services/`.
- **Socket emits** import the helpers from `sockets/order.socket.ts` (which use the `io` exported
  from `server.ts`). Emit to the buyer/seller rooms — don't broadcast globally.
