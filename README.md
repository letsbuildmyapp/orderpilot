# OrderPilot

> B2B specialty coffee ordering & product configurator. A letsbuildmyapp.com agency portfolio demo.

OrderPilot is a B2B ordering platform demo built around a fictional specialty coffee roastery. It showcases:

- **Catalog + product configurator** with constraint logic (e.g. "dark roast not available in 5lb bags")
- **Declarative pricing engine** — base + option modifiers (flat & percent) + volume breaks
- **Customer-specific pricing tiers** — retail, cafe, restaurant, wholesale (12 / 18 / 28% off list)
- **Live recompute** as the configuration changes
- **Saved quotes** with shareable URLs
- **Stripe Checkout (test mode) + Net-30 invoice flow**
- **Per-customer order history**
- **Admin dashboard** to view/edit quotes and orders, change status

Stack: React 18 + TS + Vite, Tailwind, React Router v6, TanStack Query, Zustand (cart), Firebase (Auth/Firestore/Functions/Storage), Stripe (test). Designed against the **Firebase Emulator Suite** — no live Firebase project needed for local dev.

## Visual archetype

**Editorial / magazine.** Fraunces (display) + Inter (body). Cream/off-white base, deep terracotta accent. `rounded-none` / `rounded-md` only. Asymmetric grid, generous whitespace, big confident product photography. Light mode primary.

## Quickstart (local dev with Firebase emulator)

Requires Node 20+ and the Firebase CLI (`npm i -g firebase-tools`).

```bash
# 1. Install
npm install

# 2. Start the Firebase emulator suite (Auth, Firestore, Functions, Storage)
#    in a separate terminal
firebase emulators:start

# 3. Start the Vite dev server
npm run dev
```

Open <http://localhost:5173>.

The app auto-detects the emulator (when `VITE_FIREBASE_API_KEY` is unset) and seeds 4 demo accounts, products, and sample quotes the first time it loads.

### Demo accounts

| Email                          | Password   | Tier        | Admin |
| ------------------------------ | ---------- | ----------- | ----- |
| `cafe@orderpilot.test`         | `demo1234` | Cafe        | no    |
| `restaurant@orderpilot.test`   | `demo1234` | Restaurant  | no    |
| `wholesale@orderpilot.test`    | `demo1234` | Wholesale   | no    |
| `admin@orderpilot.test`        | `demo1234` | Wholesale   | **yes** |

## Project layout

```
src/
  components/        Layout, header, configurator, loading/empty/error states
  pages/             Home, Catalog, Product, Cart, Checkout, Quotes, Quote,
                     Orders, Account, NotFound, Error, admin/*
  lib/
    firebase.ts      Firebase init + emulator wiring
    pricing.ts       Pricing engine + constraint engine (declarative)
    quotes.ts        Firestore data access (quotes & orders)
    tiers.ts         Pricing tier definitions
    utils.ts         cn() and money formatting
  store/             Zustand stores (auth, cart with persistence)
  seed/
    products.ts      5 seed products with attributes + constraints + pricing rules
    runSeed.ts       Idempotent seeding for the emulator
  types/             Shared TypeScript types
functions/           Cloud Functions (TS, Node 20) — Stripe + email stubs
firestore.rules      Owner-only writes; admin override; share-token reads
firebase.json        Hosting (staging+prod targets), emulator ports
```

## Pricing engine

`src/lib/pricing.ts` is the heart of the demo. Pricing rules are **declarative** on each product:

```ts
pricing: [
  { kind: "base", cents: 2200 },
  { kind: "optionModifier", attr: "grind" },        // flat $/unit per option
  { kind: "optionPercent", attr: "pack" },          // % multiplier per option
  { kind: "volumeBreak", attr: "quantity",
    tiers: [{ min: 25, discount: 0.05 }, { min: 50, discount: 0.10 }] },
]
```

Constraints are similarly declarative — `disable` (remove options) or `min` (minimum quantity). The engine "heals" any config that becomes invalid when an upstream attribute changes.

Customer pricing tiers (`retail` / `cafe` / `restaurant` / `wholesale`) apply as a final percent discount on each line, so the same product card shows different prices depending on who's signed in.

## Handoff to a real Firebase project

When you (Alex) are ready to ship:

1. **Create the Firebase project** in the console — name it `orderpilot` (or update `.firebaserc`).
2. Enable **Auth** (Email/Password + Google), **Firestore** (in any region), **Storage**, **Hosting**, **Functions** (Blaze plan).
3. In Hosting, create two sites: `orderpilot-staging` and `orderpilot`. The targets are already wired in `.firebaserc`.
4. Copy `.env.local.example` → `.env.local` and fill in your Firebase web config (Project Settings → Your apps → Web). Leave `VITE_USE_EMULATOR` blank/unset for prod.
5. Add server-only secrets via `firebase functions:config:set` or Secret Manager:
   ```
   firebase functions:secrets:set STRIPE_SECRET_KEY
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   firebase functions:secrets:set RESEND_API_KEY
   ```
6. **Deploy rules + functions + hosting (staging first):**
   ```bash
   firebase deploy --only firestore:rules,storage,functions
   npm run build && firebase deploy --only hosting:staging
   # confirm at https://orderpilot-staging.web.app
   firebase deploy --only hosting:prod
   ```
7. **Promote a user to admin**: in Firestore console, edit the doc at `accounts/{uid}` and set `isAdmin: true`. (Or seed `admin@orderpilot.test` once.)
8. **Stripe**: implement the `createCheckoutSession` callable in `functions/src/index.ts` to actually call `stripe.checkout.sessions.create({...})`, then point the frontend `Checkout.tsx` at it via `httpsCallable(functions, 'createCheckoutSession')` and `window.location = url`.

## Decisions worth revisiting (post-handoff)

- **Niche**: I picked specialty coffee. Easy to swap to signage, packaging, or anything else — the engine doesn't care.
- **Tier discounts**: 12 / 18 / 28% is plausible for coffee but arbitrary. Worth a real conversation per niche.
- **Stripe is stubbed**: the checkout flow simulates a redirect. Wire it up to a real Stripe test account when you have one.
- **Emails are stubbed**: Resend isn't wired. The Functions file shows where to plug it in.
- **Sentry/PostHog**: omitted for the demo; add when going to prod.
- **Tests**: not included for this scope. Add Vitest for `pricing.ts` (highest-value target) and Playwright for the catalog → cart → checkout golden path.

## Scripts

```bash
npm run dev        # Vite dev server
npm run build      # tsc + production build to dist/
npm run preview    # serve the production build locally
npm run lint       # eslint
```
