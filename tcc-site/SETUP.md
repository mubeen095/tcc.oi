# The Coding Company — Vercel + Postgres Setup

## What this project has

- **Static site** in `public/` (SPA shell + growthx-style pages).
- **Serverless API** in `api/` (Node, `@vercel/postgres`):
  - `/api/register`, `/api/login`, `/api/logout`, `/api/me` — members auth (scrypt passkey, session cookie).
  - `/api/forms` — stores form submissions (become-a-member, 100-club-apply, bootcamps, gigs, prep-plus-lead, exam-lead, etc.).
  - `/api/otp/send`, `/api/otp/verify` — phone/email verification for the Prep+ practice-plan form.
  - `/api/exam-score` — stores a completed company-paper attempt and forwards one row to Google Sheets.
  - `/api/admin` — admin-only view of members/submissions (`?scope=members|submissions`).
- **Static pages**: `/login`, `/member`, `/admin`, `/100-club-apply`.
- **`scripts/schema.js`** — creates the Postgres tables + optional admin promotion.

## 1. Connect Vercel Postgres

1. Push this repo to GitHub and import it into Vercel (`vercel.com` → Add New Project).
2. In Vercel: **Storage → Create Database → Postgres** (any name, e.g. `tcc-db`).
3. In the database's **Env Variables** tab, click *Connect Project* and select your project.
   This injects `POSTGRES_URL`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE` into the project.

No code changes needed — `api/_db.js` reads `POSTGRES_URL`.

## 2. Run the schema

```bash
npm install
npm run db:setup
```

Creates tables: `members`, `sessions`, `submissions`, `otp_challenges`.

### Promote yourself to admin

```bash
ADMIN_EMAIL=you@example.com npm run db:setup
```

Re-running the schema is idempotent — it creates tables if missing and promotes the
`ADMIN_EMAIL` account to `role='admin'` if it exists. Run it again whenever a new
admin needs promoting.

## 3. Local development

```bash
npm run dev        # or: node server.js  → http://localhost:3000
```

`server.js` includes an in-memory mock API (`/api/*`) so forms, signup, login, and the
admin dashboard all work locally **without** a database.

To make a local account an admin, start the server with:
```bash
MOCK_ADMIN_EMAIL=you@example.com node server.js
```

## 3a. Verification codes (Prep+ lead form)

The homepage practice-plan form (`prep-plus-lead`) only accepts a submission
after the number has been verified through `/api/otp/send` →
`/api/otp/verify`. Codes are stored as HMAC-SHA256 hashes, expire after 5
minutes, allow 5 attempts, and are rate limited to one send per 30 seconds /
six per hour per recipient.

The company-paper signup gate (`exam-lead`) does **not** use a code. It collects
name, email, phone, college and year of study and admits the candidate
immediately; the lead row is the record and the score is keyed to its `lead_id`.

### Delivery channel

The Prep+ form asks for a phone number, but the code is delivered **by email**
until SMS is live (real SMS to Indian numbers needs TRAI DLT registration). Send
returns which channel was used so the UI can say "sent to your email" vs
"sent by SMS".

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. When set, codes go out as email. |
| `OTP_FROM_EMAIL` | Verified sender, e.g. `TCC Prep+ <codes@thecodingcompany.com>`. Defaults to Resend's sandbox `onboarding@resend.dev`, which only delivers to the account owner. |

`RESEND_API_KEY` must come from a domain verified in Resend, and
`OTP_FROM_EMAIL` must be on that domain, or real users will not receive mail.
With no key, production falls back to SMS if a provider is configured, then to
`503`.

### SMS (optional, later)

Set **one** provider in Vercel → Project → Settings → Environment Variables:

| Variable | Provider | Notes |
| --- | --- | --- |
| `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID` | MSG91 | Template must contain an `##OTP##`-style variable; the code is posted as `{ "otp": "123456" }`. |
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM` | Twilio | `TWILIO_FROM` is an E.164 sender, e.g. `+12025550123`. |

Also set:

| Variable | Purpose |
| --- | --- |
| `OTP_SECRET` | Random string used to HMAC the codes. **Required in production.** |
| `OTP_DEV_MODE` | `1` returns `devCode` in the send response instead of sending. Never set this in production. |

With no channel configured, non-production environments automatically fall back
to `OTP_DEV_MODE` and return `devCode`; production returns `503` until email or
SMS is configured. The local mock server (`node server.js`) always returns
`devCode` and prints it in the form's "Dev preview" note.

## 3b. Company-paper exam flow (signup gate → score sheet)

Each `/prep+/companies/<company>/<year>/` page runs a timed multi-round paper
(aptitude → technical → coding). The first paper is gated: after the first
section the candidate must sign up before continuing.

### What happens

1. The candidate answers the first section (Numerical Ability, 8 questions).
2. The gate asks for name, email, phone, college and year of study, then admits
   them on submit — no code, no second step. The clock pauses while the gate is
   open.
3. The lead is saved to `submissions` as `exam-lead` and a `lead_id` is issued.
   The candidate resumes at the exact question they left.
4. Progress is mirrored to `localStorage` under
   `tcc_exam_<company>_<year>` (attempt counter in
   `tcc_exam_attempts_<company>_<year>`), so refresh, tab close and resume all
   work. A retake keeps the captured profile and increments the attempt.
5. On "See final result" the page POSTs to `/api/exam-score`. The attempt is
   stored in Postgres and one row is appended to the exam Google Sheet.

### Moving the gate

The boundary lives in `scripts/build-prep-pages-v2.js` as
`GATE = { round: 0, section: 0 }` — round index and section index. Set
`section` to move it to a later section, or `-1` to disable it. If the section
is empty or spans the whole round, the gate falls back to the end of round 0.
Rebuild with `node scripts/build-prep-pages-v2.js` after changing it.

### Google Sheet

`google-sheets-exam-appscript.gs` appends one row per attempt to the
`Exam Attempts` tab (created on first use) and updates the existing row on a
retry, keyed on Lead ID + Attempt.

1. Open the target spreadsheet → **Extensions → Apps Script**.
2. Paste the whole file over `Code.gs`, set `SECRET` to a long random string,
   and save.
3. **Deploy → New deployment → Web app**, *Execute as: Me*, *Who has access:
   Anyone*. Authorize and copy the `/exec` URL.
4. Set in Vercel:

| Variable | Purpose |
| --- | --- |
| `SHEETS_URL` | The Apps Script `/exec` URL. |
| `SHEETS_SECRET` | The same string as `SECRET` in the script. |

5. Smoke test: open `<SHEETS_URL>?action=ping&secret=<SHEETS_SECRET>` — it must
   return `{"ok":true,"sheet":"Exam Attempts"}`.

Without `SHEETS_URL` the attempt is still stored in Postgres and the API returns
`sheet: "skipped"`; with it, a good write returns `sheet: "ok"`.

### Data collected

`Exam Attempts` has 21 columns: timestamp (IST), lead ID, name, email, phone,
college, year of study, company, paper year, aptitude %, technical %, coding %,
overall %, band, duration (min), attempt, page URL, UTM source/medium/campaign,
device.


## 4. Deploy

Push to the repo / deploy in Vercel. `vercel.json` rewrites:
- `/become-a-member`, `/bootcamps`, `/bootcamps-loading`, `/100-club-apply`,
  `/login`, `/member`, `/admin` → their static pages
- `/api/(.*)` → serverless functions
- everything else → `spa.html` (SPA fallback)

## 4a. Cohort dates (single source of truth)

Every cohort date, deadline and seat count on the site comes from
`data/cohorts.json`. Do not hardcode a date in page HTML.

```json
{
  "capacity": 50,
  "cohorts": [
    { "id": "2027-01", "label": "Cohort 01", "start": "2027-01-18",
      "applyBy": "2027-01-11", "decideBy": "2027-01-14",
      "seatsLeft": null, "seatsUpdated": null }
  ]
}
```

- Dates are IST, `YYYY-MM-DD`.
- The build publishes the next cohort whose `applyBy` has not passed. When
  that deadline passes, the site rolls to the following cohort automatically —
  no page edits needed.
- `/enrol/` shows the next cohort that actually **starts**, because the reader
  has already been accepted.
- After `applyBy` and before `start`, marketing pages advertise the following
  cohort and `/enrol/` still shows the upcoming start date.
- To show live scarcity, set `seatsLeft` and `seatsUpdated`. A `seatsUpdated`
  older than 7 days is ignored and the site falls back to total capacity, so a
  forgotten number can never become a false claim.
- Add the next cohort to the array before the last one starts, or the site
  falls back to "Next cohort dates are being announced soon".

Rebuild and preview any date:

```bash
npm run cohorts
COHORT_TODAY=2027-01-20 node scripts/build-cohorts.mjs
```

`npm run build:seo` runs the cohort build after page generation and before the
sitemap. `npm run preflight` fails if the homepage marker is empty or no
upcoming cohort exists.

## 4b. Careers pages (single source of truth)

`scripts/build-careers.mjs` generates:

- `/careers/` — the hub, with all five functions and the hiring process.
- `/careers/inside-sales/`
- `/careers/marketing/`
- `/careers/revenue-operations/`
- `/careers/human-resources/`
- `/careers/accounts-finance/`

Every function publishes the same five-level ladder — Intern, Associate,
Executive, Senior, Manager — so each page carries five `JobPosting` blocks.
Role copy, levels and requirements live in the `FUNCTIONS` array in that
script; the pages are generated, so edit the script rather than the HTML.

Two constants need attention when the hiring plan changes:

```js
const DATE_POSTED = '2026-11-14';
const VALID_THROUGH = '2027-05-31T23:59:59+05:30';
```

Update `DATE_POSTED` when the roles are genuinely refreshed, and move
`VALID_THROUGH` forward only while the roles are still open. Applications go to
`careers@thecodingcompany.io` with the role title prefilled, so the page keeps
working before Postgres is provisioned.

`scripts/inject-careers-links.js` adds a Careers link to the Company column of
every existing footer. It is idempotent and runs after page generation in
`build:seo`, so generated pages keep the link without editing each template.

## 4c. Blog pipeline

Article content lives in `scripts/build-blog-articles.js`. Shared metadata —
title, description, date, tag, image, category — lives in
`scripts/blog-meta.cjs` and drives three generated surfaces:

- `scripts/build-blog-hub.mjs` — the /blog/ grid, topic pills and Blog JSON-LD
- `scripts/build-blog-categories.js` — the five category pages
- `scripts/build-blog-feed.mjs` — `public/feed.xml`

To publish a new article: add the body to `build-blog-articles.js` **and** the
metadata entry to `blog-meta.cjs`, then run `npm run build:blog`. The hub,
categories, feed and sitemap will all include it on the next build.

## 5. Notes

- Passkeys are hashed with scrypt (`salt:hash` format) — never stored in plaintext.
- Session cookie: `tcc_session`, HttpOnly, 30-day expiry.
- The SPA bundle's old `/login` route now redirects to the static `/login` page.
- All Google Apps Script form URLs were removed; every form now posts to `/api/forms`.
- `prep-plus-lead` submissions are rejected unless `challenge_id` belongs to a challenge
  verified in the last 30 minutes and its phone matches `verified_phone`.

## 6. Theme system (dark default + light mode)

Every page ships both themes. Dark is the untouched baseline; light is opt-in and
resolved before first paint.

### Behaviour

- First visit follows `prefers-color-scheme`.
- The sun/moon toggle stores a manual choice in `localStorage["tcc.theme.v1"]`
  (`"light"` or `"dark"`). Once set, system changes are ignored.
- `window.tccTheme.clear()` removes the override and returns to system mode.
- Tabs stay in sync through the `storage` event; `tcc:themechange` fires on change.
- Toggles live in the sidebar footer and mobile header. The home screen also gets a
  tiny icon-only switch pinned to the top-right of the hero so the theme is reachable
  without scrolling.
- Cinematic panels (hero video/photo/overlay sections) and simulated code editors
  stay dark with white text in both themes. Code blocks are intentionally dark.

### Files

| File | Role |
| --- | --- |
| `public/assets/css/tcc-theme.css` | Hand-authored tokens, shell chrome, Tailwind/React remaps, diagrams (`.rmg-*`, `.tpr-*`), career panels (`.cs-*`), toggle. |
| `public/assets/css/tcc-theme-pages.css` | Generated per-page content overrides. Do not edit by hand. |
| `public/assets/js/tcc-theme.js` | Resolution, toggle injection, persistence, cross-tab sync, meta `theme-color`. |
| `scripts/theme-tags.cjs` | Shared head/body markup and `withTheme(html)` used by every generator. |
| `scripts/inject-theme.mjs` | Idempotent codemod that wires existing pages. |
| `scripts/build-theme-css.mjs` | Derives `tcc-theme-pages.css` from the real page CSS. |
| `scripts/audit-theme.mjs` | Full-site wiring, contrast, overflow, toggle and dark-surface audit. |
| `scripts/verify-theme.mjs` | System-follow, toggle, persistence and cross-tab behaviour suite. |
| `scripts/diff-dark.mjs` | Dark-mode computed-style diff against the original site snapshot. |

### Commands

```bash
npm run inject:theme                 # wire any new/regenerated page (idempotent)
node scripts/build-theme-css.mjs     # rebuild tcc-theme-pages.css
npm run audit:theme                  # light-mode audit (570 pages)
npm run audit:theme:both             # light + dark structural audit
node scripts/verify-theme.mjs        # theme behaviour suite
node scripts/diff-dark.mjs           # dark-mode pixel baseline diff
```

### Adding or changing a component

1. Add light overrides for the new component to `tcc-theme.css` (scoped under
   `html[data-theme="light"]`), keeping dark rules untouched.
2. Run `node scripts/build-theme-css.mjs` so page-level colours are regenerated.
3. Run `npm run audit:theme` and check contrast, overflow and toggle presence.
4. If you regenerate pages, wrap the output with `withTheme()` from
   `scripts/theme-tags.cjs` (already done in the page generators) or run
   `npm run inject:theme` afterwards.

`color-scheme` is pinned to `light` in both themes so native form controls render
exactly as they did before the theme work.

## 7. WorkSim (pilot)

WorkSim lives at `/worksim/` and is deliberately **not** in the main navigation.
It is linked as “WorkSim (pilot)” from the site footer. The link is injected by
`scripts/add-worksim-footer-link.js` (idempotent, safe to re-run after adding pages).

### Catalogue data

- `scripts/build-worksim.js` reads the CERT+ role inventory (`public/certs-data.js`)
  and writes one Beginner shift per role into `data/worksim/`:
  - `catalog.json` — the catalogue (262 generated + the hand-authored SDR shift).
  - `packs.json` — the generated packs (~1.4 MB, never served as a static file).
- Rebuild after changing roles: `node scripts/build-worksim.js`
  (restart `server.js` afterwards so the in-memory store reloads).
- Generated shifts are linear drafts: 10 moments, 3 options each, max 100 / min 10.
  Use `/worksim/studio/` to add branching and export a hand-authored pack.

### Routes

| Route | Served by |
| --- | --- |
| `GET /api/worksim/manifest` | `server.js` locally, `api/worksim/manifest.js` on Vercel |
| `GET /api/worksim/pack/:id` | `server.js` locally, `api/worksim/pack/[id].js` on Vercel |

Both routes read from `worksim-store.js`, which loads `data/worksim/` on first use.
`vercel.json` includes `data/worksim/**` in those function bundles. The public site
keeps only the static SDR pack and the 4-entry `packs/manifest.json` fallback; if the
API is unavailable, the runner falls back to that static manifest.

## 8. Keeping "free" out of the copy

The word "free" is not used as a marketing claim anywhere on the site. The
generators (`scripts/build-prep-pages.js`, `scripts/build-prep-pages-v2.js`,
`scripts/build-ai-artifacts.js`, `data/ai-answers.js`, `data/prep-papers.js`)
already avoid it; a codemod and a verifier guard the built output.

```bash
node scripts/remove-free-word.js           # dry run: report what would change
npm run copy:clean                         # apply, then verify
npm run verify:copy                        # verify only
```

Run `npm run copy:clean` **after** any build that regenerates pages, e.g.:

```bash
npm run build:seo && npm run copy:clean
```

`verify-no-free.mjs` scans every `.html`, `.js`, `.txt`, `.json` and `.jsonl` under
`public`. It allows the word where it is a real term rather than a
claim: `freelance*`, `free memory`/`free RAM`, `free()`, `error-free`, `bug-free`,
`code-free`, `collision-free`, `clash-free`, `free-text`, and the memory roadmap's
`free` node.

## 9. Lead capture coverage

Every marketing page has at least one route into a lead form. Most get it from the
shared top bar ("Become a member"), the site footer, an inline form, or a Prep+
CTA. To confirm after adding pages:

```bash
npm run audit:leads
```

It counts pages with a lead path and fails if any marketing page has none. Redirect
stubs, `/admin/`, `/login/`, `/worksim/**` and the SPA shell are excluded on
purpose and reported separately.


## 10. Responsive / mobile checks

The site is built phone-first, then checked at every width a real device hits.
Three pieces are automatic:

1. **`viewport-fit=cover`** on every page, added by `scripts/fix-viewport.mjs`
   (wired into `build:seo`). This is what makes `env(safe-area-inset-*)` report
   the iPhone notch and home indicator instead of always returning 0.
2. **A `vh` fallback before every `dvh`** in inline CSS, from the same script,
   so iOS 15.3 and older still get a full-height app shell.
3. **Global mobile rules** in `public/assets/css/tcc-theme.css`:
   - form controls are 16px at ≤1024px, so Safari never zooms on focus
   - header controls, buttons, footer links and pagers are at least 44px tall
   - `overflow-wrap: break-word`, so long emails and URLs cannot widen the page
   - `scroll-padding-top`, so anchor links clear the fixed header
   - `touch-action: manipulation`, removing the 300ms tap delay
   - `text-size-adjust: 100%`, stopping Android font boosting

### Run the audit

```bash
npm run audit:responsive                 # 43 templates × 7 widths
npm run audit:responsive -- --all        # every page at 390px
npm run audit:responsive -- --all --widths=360
npm run audit:responsive -- --widths=844 --height=390   # phone landscape
npm run audit:responsive -- --path=/bootcamps/ --widths=320
```

It renders in headless Chrome and fails on:

- horizontal overflow, or any element sticking out past the viewport
- form controls under 16px (iOS focus zoom)
- tap targets under 44px on phone widths (inline prose links are exempt, per
  WCAG 2.5.8)

Marquees, decorative glows and intentionally clipped strips are ignored. The
`body { overflow-x: hidden }` mask is deliberately not treated as a pass — the
offender list is the real result.

Widths in use: **320** (iPhone SE 1st gen / small Android), **360** (most
Android), **390/393** (iPhone 13–16), **430** (iPhone Pro Max), **768** (iPad
portrait), **1024** (iPad landscape), **1440** (desktop), plus **844×390**
(phone landscape). The layout switches from bottom-nav + fixed header to the
desktop sidebar at 768px.
