# ListBuyFly — Project Context for Claude Code

This file primes Claude Code on the codebase. Drop it at the repo root
(`~/listbuyfly/CLAUDE.md`) and Claude Code will read it on session start.

---

## Owner & one-line pitch

Lance Boehmer (cell 303.883.0777, listbuyfly@gmail.com) — Director of Enterprise
Sales at Motive, Traverse City Commissioner. ListBuyFly is an aircraft
marketplace at https://listbuyfly.com built solo for public launch in 2026.

Lance speaks pragmatically with a spartan tone. Match it.

## Stack

- **Framework**: Next.js 16.2.1 (App Router, Turbopack, React 19)
- **Auth**: Clerk (`@clerk/nextjs` v7) — server `auth()` helper, `userId` from session
- **DB**: Vercel Postgres (Neon under the hood) via `@vercel/postgres`
- **Storage**: Vercel Blob (`@vercel/blob`) for listing images
- **Payments**: Stripe (`stripe` v21) — checkout for paid tier upgrades, webhook for activation
- **Email**: Resend (`resend` v6) for lead notifications
- **Rate limit**: Upstash Redis (`@upstash/ratelimit`, `@upstash/redis`) over REST
- **CMS**: Notion API for `/guides` (ISR, 5min revalidate)
- **Hosting**: Vercel — production = `main` branch auto-deploy
- **CAPTCHA**: reCAPTCHA v3 on lead form
- **Sanitization**: `isomorphic-dompurify` for Notion-sourced HTML

## Repo layout

```
src/
  app/
    api/
      chat/         (does NOT exist yet — see handoff/ai-chatbot.patch if reviving)
      db/setup/     admin-gated DDL endpoint, idempotent CREATE TABLE IF NOT EXISTS
      db/seed/      admin-gated seed data
      geocode/      location lookups for listing creation
      leads/        public POST, IP rate-limited 5/10min, captcha-verified, sends email
      listings/     CRUD; auth required for POST/PATCH/DELETE; PII stripped on GET list
      stripe/checkout/   creates session for paid tier
      stripe/webhook/    activates listing on payment.success — verifies ownership
      upload/       Clerk-authed image upload to Vercel Blob, MIME and size enforced
    create/         new-listing form (multi-step)
    dashboard/      seller's own listings + leads (Clerk-authed)
    guides/[slug]/  Notion-sourced article pages, DOMPurify-sanitized
    listing/[id]/   ADP — Aircraft Detail Page
    privacy/, terms/   legal pages
    layout.tsx      root, ClerkProvider wraps {children}
    globals.css     Tailwind 4 + base styles
  components/
    ADPContactSidebar.tsx    seller contact card + lead form, click-to-reveal phone/email
    ADPImageGallery.tsx      lightbox image viewer
    FavoriteButton.tsx, CompareButton.tsx
    DescriptionBlock.tsx     truncated/expandable seller description
  data/
    listings.ts              seed/sample listings
    aircraftImages.ts        Unsplash fallback images by make
  lib/
    adminAuth.ts     requireAdminToken — gates /api/db/* on x-admin-token header
    db.ts            getListingById, createListing, updateListing, etc.
    guides.ts        Notion fetch + cache
    listingStore.ts  zustand-style client store for favorites/compare
    originCheck.ts   requireSameOrigin — defense-in-depth CSRF
    ratelimit.ts     enforceLeadRateLimit, enforceListingRateLimit
    stripe.ts        client init, lazy
    types.ts         Listing, Lead, etc.
vercel.json          full security header suite (CSP report-only, HSTS preload, etc.)
```

## Domain vocabulary

- **ADP** = Aircraft Detail Page (`/listing/[id]`)
- **SRP** = Search Results Page (the home page `/`)
- **Tier** = `'free'` or `'paid'` — paid listings show seller contact info via click-to-reveal
- **Listing status** = `'active' | 'inactive' | 'sold' | 'pending_payment'`
- **TTAF** = Total Time Airframe (hours)
- **SMOH** = Since Major Overhaul (hours)
- **TBO** = Time Between Overhauls (hours, manufacturer-specified)
- **N-number** = aircraft tail registration

## Conventions

### Git workflow

- `main` is production. Vercel deploys to listbuyfly.com on every commit to main.
- Feature branches use `fix/*` or `feat/*` prefix.
- **For UX-only changes**, push direct to main (Lance's stated preference).
- **For anything touching auth, payments, data flow, or third-party services**, open a PR.
- Commit messages explain the WHY, not just the what. Body wraps at ~72 cols.
- Always add `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
  to commits when Claude is the author.

### Code style

- TypeScript everywhere; `.tsx` for components.
- No emojis in code or commit messages unless Lance asks for them.
- Comments explain WHY a non-obvious choice was made, not what the code does.
  Rate limiter, origin check, and click-to-reveal patterns all have block comments
  explaining the threat model — match that style.
- Prefer Tailwind utility classes. Inline `style={{}}` only for dynamic values.
- Server-side state changes go through `NextResponse.json(...)` with proper status codes.
- Always validate input on the server. Client-side validation is UX only.

### Security conventions (already in place)

Patterns to PRESERVE — do not undo any of these without discussion:

- `auth()` from `@clerk/nextjs/server` resolves `userId`. Never trust a client-supplied userId.
- `requireSameOrigin(request)` at the top of every state-changing route.
- `requireAdminToken(request)` gates `/api/db/setup` and `/api/db/seed`.
- Rate limiters in `lib/ratelimit.ts` fail OPEN — broken Upstash must not take down the site.
- `/api/listings` GET strips seller PII (email, phone, userId) unless caller owns the listing.
- Listing detail page click-to-reveal hides seller contact in React state (not DOM) until user clicks.
- Stripe webhook verifies the listing's userId matches the checkout session metadata
  before activating — prevents one user's payment from activating another user's listing.
- Lead notification email content is HTML-escaped (XSS via lead message body).
- Notion-sourced guide HTML runs through DOMPurify before `dangerouslySetInnerHTML`.
- `vercel.json` has CSP (currently report-only, planned to enforce after ~1 week clean traffic),
  HSTS preload (listbuyfly.com is on the preload list), Permissions-Policy, X-Frame-Options DENY,
  Referrer-Policy strict-origin-when-cross-origin.

### Database conventions

- All tables use `CREATE TABLE IF NOT EXISTS` so `/api/db/setup` is idempotent.
- Indexes on every frequently-queried column. Add them in `/api/db/setup` not migrations.
- After any schema change to `/api/db/setup`, you must:
  ```
  curl -H "x-admin-token: $ADMIN_SETUP_SECRET" https://listbuyfly.com/api/db/setup
  ```
- Tables: `listings`, `leads`, plus indexes. (No `chat_logs` yet — chatbot is on hold.)

### Required env vars (all set in Vercel)

Production needs all of these. Preview deployments will also need most.

```
# Auth
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_WEBHOOK_SIGNING_SECRET

# DB
POSTGRES_URL                    (auto-set by Vercel Neon integration)

# Storage
BLOB_READ_WRITE_TOKEN           (auto-set by Vercel Blob integration)

# Payments
STRIPE_SECRET_KEY
STRIPE_PRICE_ID                 (price for paid tier)
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL             (https://listbuyfly.com in prod)

# Email
RESEND_API_KEY

# Rate limit / CAPTCHA
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
RECAPTCHA_SECRET_KEY
NEXT_PUBLIC_RECAPTCHA_SITE_KEY

# Notion CMS
NOTION_API_KEY
NOTION_GUIDES_DB_ID

# Admin
ADMIN_SETUP_SECRET              (random — gates /api/db/setup, /api/db/seed)

# Promo codes
PROMO_CODES                     (comma-separated list, e.g. LAUNCH2026,FRIENDS)
```

## What's deployed to production right now

Already live at listbuyfly.com as of April 19, 2026:

**Security hardening (5 CRITICAL + 4 HIGH + 6 MEDIUM)**
- All `/api/listings` mutations require Clerk auth + ownership check
- `/api/db/setup` and `/api/db/seed` gated by `ADMIN_SETUP_SECRET`
- Stripe checkout + webhook verify listing ownership
- Lead notification email HTML-escaped
- `/api/leads` rate limited 5/10min per IP
- `/api/listings` POST rate limited 10/hour per signed-in user
- `/api/upload` Clerk-authed, MIME + size validated
- CSRF posture: SameSite=Lax + `requireSameOrigin` on all writes
- CSP (report-only), Permissions-Policy, HSTS preload (on the list)
- Seller PII stripped from public `/api/listings` GET; click-to-reveal on ADP for paid listings
- Notion guides DOMPurify-sanitized
- DB indexes on `listings.user_id`, `listings.status`, `listings.listed_date`, `leads.listing_id`

**ADP UX polish**
- Quick stat cards hide when value is 0 (no more "Fuel Capacity: 0 Gallons")
- Aircraft Info: Prop, Prop Time, Interior Condition hide when empty/0
- JSON-LD `aggregateRating` only emitted when both ratings are positive numbers
- Header (Back to Listings + Favorite + Compare) is sticky on desktop only
  (`lg:sticky lg:top-0 lg:z-40`)
- Lead form sticky offset is `top-4 lg:top-24` so "Your Name" clears the sticky header

## What's NOT done yet

### Pending UX/UI work (Lance's next focus)
Lance is going to drive this with Claude Code. No spec yet — work from his
direction in-session. Patterns to keep matching:
- Tailwind utility classes
- amber-500 (#f59e0b) brand accent, slate-900 (#0f172a) navy primary, white background
- Header pattern: `<header className="bg-slate-900 text-white border-b border-slate-800 lg:sticky lg:top-0 lg:z-40">`
- Cards: `bg-slate-50 border border-gray-200 rounded-lg p-4`
- Form inputs: `border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500`
- CTA buttons: amber-500, slate-900 text — `bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold`

### LOW tier security audit items (not yet tackled)
Lance has the audit doc — `ListBuyFly_Pre_Launch_Audit.docx` lives in his
listbuyfly-workspace folder. None are launch-blockers.

### CSP enforcement flip
`vercel.json` currently has `Content-Security-Policy-Report-Only`. After ~1 week
of clean violation reports in production, rename to `Content-Security-Policy`
to enforce. Don't flip until you've confirmed no console errors from real traffic.

### AI chatbot (on hold)
Lance scratched the chatbot for now to focus on UI/UX. The complete patch is
saved at `handoff-for-claude-code/ai-chatbot.patch` if/when he revives it.
Includes the React component, `/api/chat` proxy with rate limit + PII scrub
+ aviation-only system prompt, `chat_logs` table migration, and privacy policy
updates. To revive:
```
git checkout -b feat/ai-chatbot
git am ~/path/to/ai-chatbot.patch
```
See the patch's commit message body for what env vars need to be added in Vercel
(`ANTHROPIC_API_KEY`, `IP_HASH_SALT`).

### Pre-launch checklist (not blocking, but should be done before public promotion)
- Production smoke tests: end-to-end create listing, submit lead, $1 paid upgrade with refund
- Sentry or equivalent runtime error monitoring
- Stripe webhook failure alerts
- Confirm `/og-aircraft.png` exists at 1200x630
- Seed 5-10 real listings before launch (SRP looks empty otherwise)
- Write 2-3 guides in Notion before launch (`/guides` is bare otherwise)
- Verify Google Search Console + sitemap.xml indexing

## Working with Lance

- He prefers PRs for security/data changes, direct-to-main for UX changes.
- He reviews and merges PRs himself on GitHub.
- He'll often paste screenshots of UX issues — match what's in the screenshot exactly.
- When he says "ADP" he means `/listing/[id]`. When he says "SRP" he means `/`.
- Patches handed off to him should be saved as `git format-patch main..HEAD --stdout > some-name.patch`,
  and he applies them on his Mac via `git am ~/Downloads/some-name.patch`.
- Vercel env vars: he manages these via the Vercel dashboard, not the CLI.
- Local dev: he runs `npm run dev`. Build verification can be done with env stubs:
  `STRIPE_SECRET_KEY=sk_test_dummy NEXT_PUBLIC_APP_URL=http://localhost:3000 STRIPE_PRICE_ID=price_dummy npm run build`
