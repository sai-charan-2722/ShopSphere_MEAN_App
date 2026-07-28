# 🛍️ ShopSphere — MEAN Stack Multi-Vendor Marketplace

A complete, production-grade multi-vendor e-commerce marketplace built with **MongoDB, Express, Angular 21, Node.js & TypeScript**. It showcases Clerk authentication, GSAP animations, Stripe payments (test mode), Socket.io real-time order tracking, Cloudinary image uploads, NgRx state management, and MongoDB aggregation-based analytics.

> Deploy-ready for **Render** (backend) + **Vercel** (frontend), both on free tiers.

---

## ✨ Features

- **Buyers** — browse, search & filter products, cart, Stripe checkout, order tracking with a live status timeline, reviews, and a wishlist.
- **Sellers** — product management, image uploads, order fulfilment, and an analytics dashboard (revenue, top products, animated counters).
- **Admins** — user/role management, category CRUD, all-orders management, featured products, and platform-wide analytics.
- **Real-time** — Socket.io pushes order status updates to buyers and new-order alerts to sellers.
- **Polished UX** — GSAP page transitions, fly-to-cart animation, staggered card reveals, skeleton loaders, and toast notifications.

## 📸 Screenshots

> _Placeholder — add screenshots of the Home, Product Detail, Cart, Seller Dashboard, and Admin pages here._

| Home | Product Detail | Seller Dashboard |
| ---- | -------------- | ---------------- |
| _tbd_ | _tbd_ | _tbd_ |

---

## 🧱 Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Angular 21 (standalone), TypeScript, NgRx 21, Angular Material, GSAP, socket.io-client, Clerk (clerk-js via CDN) |
| Backend | Node.js 20+, Express 4, TypeScript, Mongoose 8, Zod, Socket.io, Stripe, Cloudinary, Nodemailer, svix |
| Database | MongoDB Atlas (M0 free tier) |
| Services | Clerk (auth), Stripe (payments, test mode), Cloudinary (images), Gmail SMTP (email) |

---

## 📁 Monorepo Structure

```
shopsphere/
├── backend/     # Express + TypeScript API, Socket.io, Mongoose models
├── frontend/    # Angular 21 standalone app, NgRx store, GSAP animations
├── package.json # npm workspaces root
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js **20.x or newer** and npm 10+
- A MongoDB Atlas account (free)
- Clerk, Stripe (test), and Cloudinary accounts (all free)
- A Gmail account with an App Password (for email)

### 1. Clone & install

```bash
git clone <your-repo-url> shopsphere
cd shopsphere

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

> The repo is also configured as an npm workspace, so `npm install` at the root installs both.

### 2. Configure the backend environment

```bash
cd backend
cp .env.example .env
```

Fill in `.env` (see [Environment Variables](#-environment-variables) below).

### 3. Configure the frontend environment

Edit `frontend/src/environments/environment.ts` and set your Clerk **publishable** key and (for local dev) the API URL:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  wsUrl: 'http://localhost:5000',
  clerkPublishableKey: 'pk_test_...',
};
```

### 4. Run both apps

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:4200)
cd frontend && npm start
```

Optionally seed demo categories & products:

```bash
cd backend && npm run seed
```

---

## 🔑 Environment Variables

All backend variables live in `backend/.env` (never commit this file).

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `5000`; Render uses `10000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_test_…`) |
| `CLERK_SECRET_KEY` | Clerk secret key (`sk_test_…`) |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret (`whsec_…`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode, `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_…`) |
| `STRIPE_CURRENCY` | Currency code (`inr`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | Gmail SMTP settings |
| `FRONTEND_URL` | Frontend origin for CORS + Stripe redirect |

The frontend reads its config from `frontend/src/environments/environment.ts` (dev) and `environment.prod.ts` (production).

---

## 🛠️ Service Setup Guides

### Clerk (Authentication)

1. Create an account at [clerk.com](https://clerk.com) and create an **Application**.
2. Enable Email + your preferred social providers.
3. From **API Keys**, copy the **Publishable key** (frontend) and **Secret key** (backend).
4. **Webhook:** In Clerk → **Webhooks**, add an endpoint:
   - URL: `https://<your-backend>.onrender.com/api/auth/webhook`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** into `CLERK_WEBHOOK_SECRET`.
5. The frontend loads Clerk's pre-bundled `clerk.browser.js` **from your account's Frontend API host** (derived automatically from the publishable key). An app initializer injects the script, exposes `window.Clerk`, and mirrors auth state into signals. No npm package or extra setup is needed beyond the publishable key in `environment.ts`.

### MongoDB Atlas (Database)

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a **free M0 cluster**.
2. Create a **database user** and note the username/password.
3. Under **Network Access**, add `0.0.0.0/0` (required for Render's dynamic IPs).
4. Copy the connection string into `MONGODB_URI`, e.g.
   `mongodb+srv://user:pass@cluster.mongodb.net/shopsphere`.

### Cloudinary (Images)

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the **Dashboard**, copy **Cloud name**, **API Key**, and **API Secret** into the matching env vars.
3. Images are uploaded from memory (no disk writes) to the `shopsphere/*` folders.

### Stripe (Payments — Test Mode)

1. Create an account at [stripe.com](https://stripe.com) and stay in **Test mode**.
2. Copy the **Secret key** (`sk_test_…`) into `STRIPE_SECRET_KEY`.
3. **Webhook:** Stripe → **Developers → Webhooks → Add endpoint**:
   - URL: `https://<your-backend>.onrender.com/api/payment/webhook`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
4. **Local testing:** use the Stripe CLI to forward events:
   ```bash
   stripe listen --forward-to localhost:5000/api/payment/webhook
   ```
   (The success page also verifies the session directly, so orders confirm even without the CLI.)

### Gmail SMTP (Email)

1. Enable **2-Step Verification** on your Google account.
2. Create an **App Password** (Google Account → Security → App Passwords).
3. Use it as `EMAIL_PASS`, with `EMAIL_USER` set to your Gmail address.

---

## 💳 Stripe Test Cards

| Card Number | Result |
| --- | --- |
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

Use any future expiry date and any 3-digit CVC.

---

## 👑 Promoting a User to Seller / Admin

Roles are stored in **Clerk `publicMetadata`** and mirrored in MongoDB. Two ways to promote:

**A. Via the Admin Panel (recommended)**
1. Sign in as an admin, go to **/admin/users**.
2. Change a user's role in the dropdown — the backend updates both MongoDB and Clerk metadata.

**B. Via the Clerk Dashboard (bootstrap your first admin)**
1. Clerk → **Users** → select a user → **Metadata → Public**.
2. Set:
   ```json
   { "role": "admin" }
   ```
3. Save. The new role takes effect on the user's next request.

> Tip: promote your own account to `admin` this way first, then manage everyone else from the Admin Panel.

---

## ☁️ Deployment

### Backend → Render (Free Tier)

1. Push the repo to GitHub.
2. In Render, **New → Web Service**, point it at the `backend/` directory (or use the included `backend/render.yaml` Blueprint).
3. Build command: `npm install && npm run build` · Start command: `npm start`.
4. Add all environment variables in the Render **Environment** tab.
5. Set `FRONTEND_URL` to your Vercel URL once the frontend is deployed.

> **Free-tier note:** the service spins down after ~15 min of inactivity (cold start ~30s). Use a free [UptimeRobot](https://uptimerobot.com) monitor pinging `/health` to keep it warm during demos.

### Frontend → Vercel (Free Tier)

1. In Vercel, **Add New → Project**, import the repo, and set the **Root Directory** to `frontend`.
2. The included `frontend/vercel.json` sets the build command and SPA rewrites.
   - Build command: `npm run build`
   - Output directory: `dist/frontend/browser`
3. Set production values in `environment.prod.ts` (or wire Vercel env vars) — `apiUrl`, `wsUrl`, and `clerkPublishableKey` should point at your Render backend and Clerk app.

### Post-deploy checklist

- [ ] Update the Clerk webhook URL to the Render domain.
- [ ] Update the Stripe webhook URL to the Render domain.
- [ ] Set `FRONTEND_URL` on Render to the Vercel domain (CORS + Stripe redirects).
- [ ] Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access.

---

## 📜 Useful Scripts

**Backend**

| Command | Description |
| --- | --- |
| `npm run dev` | Start with hot reload (tsx) |
| `npm run build` | Compile TypeScript → `dist/` + copy email templates |
| `npm start` | Run the compiled server |
| `npm run typecheck` | Type-check without emitting |
| `npm run seed` | Seed demo categories, a demo seller, and sample products |

**Frontend**

| Command | Description |
| --- | --- |
| `npm start` | Dev server at `http://localhost:4200` |
| `npm run build` | Production build |
| `npm run typecheck` | Type-check the app |

---

## 🏗️ Architecture Notes

- **Prices are stored in paise** (INR × 100) as integers for Stripe compatibility; the frontend `inr` pipe divides by 100 for display.
- **Auth:** `@clerk/express` verifies session tokens on the backend; on the frontend a thin `AuthService` loads `clerk.browser.js` from the CDN, wraps the `window.Clerk` global, and feeds guards + the auth interceptor via signals.
- **Orders** are created as `pending` before Stripe redirect and confirmed to `paid` by the Stripe webhook (with a fallback verification on the success page).
- **Standard responses:** every endpoint returns `{ success, message, data?, meta? }` via the `ApiResponse` wrapper; all async handlers are wrapped in `asyncHandler`.
- **Validation:** all request bodies/queries are validated with Zod.

---

## 📄 License

MIT — provided for demonstration and portfolio purposes.
