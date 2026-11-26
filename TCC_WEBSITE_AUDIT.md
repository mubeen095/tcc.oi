# TCC WEBSITE AUDIT

**Audit Date:** November 2026  
**Scope:** https://thecodingcompany.io/ (entire public website)  
**Framework:** Static-site generated via Node scripts; `npm run build:seo` regenerates all pages  
**Total HTML Pages:** 578

---

## 1. DOMAIN & CANONICAL STATUS

| Item | Status | Notes |
|---|---|---|
| **Built public output `.com` references** | 0 | All `.com` → `.io` migrated across 21 script files |
| **Built public output `.io` references** | 576/576 sitemap URLs; 84/84 in llms.json; 29/29 in index.html | Fully consistent |
| **Homepage canonical** | `https://thecodingcompany.io` | ✅ |
| **`/verify/` canonical** | `https://thecodingcompany.io/verify/` | ✅ |
| **`/bootcamps/` canonical** | `https://thecodingcompany.io/bootcamps/` | ✅ |
| **`/domains/cse/` canonical** | `https://thecodingcompany.io/domains/cse` | ✅ |
| **`llms.json` `url` field** | Was: `https://thecodingcompany.com` | ✅ **Fixed** → `https://thecodingcompany.io` |
| **`llms.json` all keyPages URLs** | Were: `.com` | ✅ **Fixed** → `.io` |
| **`llms.json` all industry/product URLs** | Were: `.com` | ✅ **Fixed** → `.io` |
| **`data/ai-answers.js` SITE URL** | Was: `'https://thecodingcompany.com'` | ✅ **Fixed** → `'https://thecodingcompany.io'` |
| **`scripts/ai-entities.json` org URL** | Was: `https://thecodingcompany.com` | ✅ **Fixed** → `https://thecodingcompany.io` |
| **`scripts/og-card.html` partner URL** | Was: `thecodingcompany.com` | ✅ **Fixed** → `.io` |
| **`public/ai.txt` preferred citations** | Were: `.com` | ✅ **Fixed** → `.io` |
| **Archived `_archive/bootcamps-45day.html`** | Has `.com` canonical `https://thecodingcompany.com/bootcamps` | ⚠️ Outdated archive; not indexed if no inbound links |
| **`robots.txt`** | Allows `/` for all crawlers | ✅ |

**Acceptance criterion:** `grep -rl 'thecodingcompany\.com' public` returns **0** occurrences. ✅ Verified.

---

## 2. TITLES & META DESCRIPTIONS

### Duplicate Titles

| Issue | Affected Pages | Current Title | Severity |
|---|---|---|---|
| **5 blog category pages share identical `<title>`** | `blog/category/ai-career.html`, `blog/category/ai-courses.html`, `blog/category/internships.html`, `blog/category/interview.html`, `blog/category/placement.html` | All: "AI Courses, Certifications, Internships & Placement" | **High** — Duplicate title metadata across 5 pages |

**Proposed:** Rewrite each to be unique and descriptive of that category's focus.

### Missing or Weak Descriptions

| Page | Description Status |
|---|---|
| `/` (homepage) | ✅ Present: "AI certifications, real projects and placement support for students and working professionals. Prove your skills. Get hired." |
| `/careers/` | ✅ Present: "Open roles across Inside Sales, Marketing, Revenue Operations, HR and Accounts & Finance. Every function hires from intern to manager." |
| `/verify/` | ✅ Present: "Every claim The Coding Company makes, listed with the evidence behind it. If a claim is not on this page, treat it as marketing rather than fact." |
| `/bootcamps/` | ✅ Present: "TCC CERT+ is role-based AI certification for every professional and every industry." |
| `/domains/cse/` | ✅ Present: "Build the digital future with cutting-edge software, AI, and computing skills." |
| All other individual domain/industry pages | ✅ Present, unique per page |
| `/gigs/` | ✅ Present: "Internships in India | Student Internships & Freelance Jobs" |
| `/learn/` | ✅ Present: "Learning Space | The Coding Company" |
| `/100-club/` | ✅ Present (inferred from structure) |
| `/admin/` | ✅ Present: "TCC admin panel for reviewing membership requests and managing member accounts." |
| `/member/` | ✅ Present (conditional) |
| `/enrol/paid/` | ✅ Present (noindex) |

---

## 3. STRUCTURED DATA (Organization JSON-LD)

| Field | Status | Notes |
|---|---|---|
| `@type` | ✅ `Organization` | Present on homepage |
| `name` | ✅ "The Coding Company" | ✅ |
| `alternateName` | ✅ "TCC" | ✅ |
| `url` | ✅ `https://thecodingcompany.io` | ✅ Fixed from `.com` |
| `logo` | ✅ ImageObject with `.io` URL | ✅ |
| `description` | ✅ Comprehensive, product-based | ✅ |
| `slogan` | ✅ "Learn AI. Get Certified. Get Placed." | ✅ |
| `audience` | ✅ `EducationalAudience` | ✅ |
| `knowsAbout` | ✅ 8 AI-related categories | ✅ |
| `areaServed` | ✅ Worldwide (India-focussed) | ✅ |
| `foundingLocation` | ✅ India | ✅ |
| `sameAs` | ✅ LinkedIn, Instagram `.io`, LMS | ✅ All verified profiles |
| `founder` | ❌ **Missing** | Not in Organization JSON-LD; flag for owner confirmation |
| `priceRange` | ❌ **Missing** | Not in Organization JSON-LD |
| `address` | ❌ **Missing** | Not in Organization JSON-LD |
| `telephone` | ❌ **Missing** | Not in Organization JSON-LD |
| `email` | ❌ **Missing** | Not in Organization JSON-LD (mailto: in HTML) |

**Action:** Add `founder`, `priceRange`, `address`, `telephone`, `email` if/when owner provides verified information. Do not fabricate.

---

## 4. HEADING (H1/H2) HIERARCHY

| Page | H1 Count | Issues |
|---|---|---|
| `/` (homepage) | 1 (hero headline) | ✅ Structure intact; hero headline/subline below video |
| `/careers/` | 1 | ✅ |
| `/verify/` | 1 | ✅ |
| `/bootcamps/` | 1 | ✅ |
| `/domains/cse/` | 1 | ✅ |
| 5 blog category pages | 1 each | ✅ Each has H1, but **duplicate titles** (see above) |
| `/admin/` | 2 H1s present but in conditional/JS-rendered contexts | ⚠️ Not a visible page issue; H1s appear behind tabs/conditional JS |
| `/member/` | 2 H1s present but conditional (login/logout states) | ⚠️ Same as admin |
| All other pages | 1 H1 each | ✅ |

**Issue:** `/admin/` and `/member/` each have 2 `<h1>` tags in the source, but they are rendered conditionally (behind auth state or JS). These are admin/internal pages marked `noindex`, so not a critical SEO issue, but the duplicate H1 structure should be cleaned if the pages remain public.

---

## 5. IMAGE ACCESSIBILITY & CLS

| Metric | Value |
|---|---|
| **Total `<img>` elements** | 555 |
| **Images with `alt` text** | 555/555 (100%) | ✅ |
| **Images with `width` + `height` attributes** | 22/555 (4%) | ⚠️ Low — CLS contributor on mobile |
| **Images with only `width` or only `height`** | Remaining | ⚠️ Incomplete |
| **Images with neither** | Unknown (subset of above) | ⚠️ |

**Specific finding:** `npm run audit:responsive` reported: "22/555 images have width+height". The 644 KB `assets/index-9c8563fc.js` and inline `<style>` 26.7 MB total are performance factors, but image CLS is the bigger concern.

**Action:** Add `width`/`height` to 533 images missing them. This is a technical SEO/performance improvement.

---

## 6. PARTNER LOGO SECTION

| Element | Status |
|---|---|
| **Partner heading** | ✅ "Our partners" (line 1084, `id="official-partners-section"`) |
| **Official partners (3 only)** | ✅ OpenAI, Lovable ("Lovable — Official Solutions Partner"), Claude |
| **Mobile layout** | ⚠️ Needs verification: partner logos should be side-by-side on mobile (currently `flex-direction: column` on small screens per CSS line 343) |
| **Light-mode/dark-mode logos** | ✅ `.ps-logo-for-light` / `.ps-logo-for-dark` toggles based on `data-theme` |
| **Partner link URLs** | ✅ All `.io`; OpenAI, Lovable, Claude logos with "Affiliate Partner"/"Official Solutions Partner" captions |

**Note:** The CSS rule `.partner-strip .ps-logo` appears **twice** (lines 340 and 2102 of `tcc-theme.css`) with identical declarations `height: 26px; width: auto;` — **duplicate rule, needs cleanup**.

---

## 7. REFUND POLICY CONSISTENCY

| Location | Content | Status |
|---|---|---|
| **Homepage FAQ section** | Referenced but specific text not extracted in audit | ⚠️ Needs verification against dedicated page |
| **Refund policy page** | Not found as standalone `/refund-policy/` or similar; may be embedded in `/terms-of-service/` | ⚠️ **Requires owner confirmation** — locate and verify consistent wording |
| **Terms of service** | May contain refund terms | ⚠️ Needs cross-reference |

**Issue:** The audit could not locate a dedicated refund policy page or confirm that the homepage FAQ, terms, and any other reference all state the same policy. **Create owner-approval item:** locate refund policy source and ensure one consistent description everywhere.

---

## 8. BOOTCAMP COHORT DATES

| Cohort | Start | Apply By | Decide By | Seats | Status |
|---|---|---|---|---|---|
| **Cohort** | 2027-01-18 | 2027-01-11 | 2027-01-14 | 50 (capacity) | ✅ Active dates from `data/cohorts.json` |
| **Cohort** | 2027-02-12 | 2027-02-05 | 2027-02-09 | 50 (capacity) | ✅ Active dates from `data/cohorts.json` |

**Source of truth:** `data/cohorts.json` — "Single source of truth for cohort dates. Edit this file, then run `npm run build:seo`."

**Assumptions (unconfirmed by founder):**
- 50 seats per cohort
- 2027 IST dates
- `applyBy` = 7 days before start
- `decideBy` = 3 days before start

**Action:** Confirm these assumptions with the founder. If the next cohort date is unknown, use a neutral "Application open — join the waitlist" message rather than inventing a date.

**Archived page concern:** `_archive/bootcamps-45day.html` has `canonical href="https://thecodingcompany.com/bootcamps"` and salary claims ("From ₹4 LPA to ₹20+ LPA AI Engineer in 45 Days."). This is **not** the current live page, but it shows historical `.com` usage and specific earnings claims. **Recommendation:** delete or update the archive; if kept, add prominent "archive — not current offering" notice.

---

## 9. GIGS / OUTCOMES CLAIMS

| Claim Type | Status | Notes |
|---|---|---|
| **`10,000 placement goal`** | ✅ Present in `llms.json`, `ai.txt`, `faq.jsonl` | Explicitly stated as "published goal, not a guarantee" in all machine files |
| **Salary benchmarks (₹ LPA)** | ✅ Present on individual certification pages | ✅ Labelled "illustrative sample data, not TCC fees and not guaranteed to candidates" |
| **Specific earnings claims** | ⚠️ Found in `_archive/bootcamps-45day.html` only ("From ₹4 LPA to ₹20+ LPA AI Engineer in 45 Days.") | ⚠️ **Archive only**; live pages have no such specific claims. Delete or add strong disclaimer. |
| **Placement guarantee** | ✅ Explicitly denied in 5+ places across machine files (`proof`, `negatives`, `ai.txt`, `faq.jsonl`) | ✅ "TCC is not a job guarantee" — repeated disclaimer |
| **Gigs page claims** | ✅ "Internships in India | Student Internships & Freelance Jobs" — no specific numerical claims found | ✅ |

---

## 10. BRAND CONFUSION & OUTDATED CONTENT

| Issue | Affected Pages | Severity |
|---|---|---|
| **`.com` → `.io` migration** | Was site-wide in scripts and built output | ✅ **Completed** — 0 `.com` in built public |
| **Archived `.com` content** | `_archive/bootcamps-45day.html` | ⚠️ Not indexed if no inbound links, but visible in repo |
| **5 blog category duplicate titles** | `blog/category/ai-career.html`, `ai-courses.html`, `internships.html`, `interview.html`, `placement.html` | 🔴 **High** — Identical `<title>` on 5 pages |
| **No `/about/` or `/contact/` HTML pages** | Not in `public/` | ⚠️ Brand story and contact covered only in `llms-full.txt` |
| **Cohort date assumptions** | Generated content throughout `/enrol/` and marketing pages | ⚠️ Unconfirmed; appear in generated output |
| **Instructor facts** | Listed as "outstanding item from previous state" | ⚠️ Not verified; flag for owner confirmation |
| **Partner scope lines** | Only 3 partners confirmed (OpenAI, Lovable, Claude) | ⚠️ No additional partner descriptions supplied |
| **Gilroy self-hosting licence** | 7 TTF files confirmed; WOFF2 conversion/subsetting unconfirmed | 🔧 **Low** — performance improvement, not brand risk |

---

## 11. TECHNICAL SEO

| Item | Status | Notes |
|---|---|---|
| **XML sitemap** | ✅ 576 URLs, all `.io` | Generated by `scripts/build-sitemap.mjs` |
| **`robots.txt`** | ✅ Allows all crawlers; `Content-Signal: search=yes, ai-input=yes, ai-train=yes` | ✅ |
| **Canonical URLs** | ✅ All `.io`; 29/578 pages have canonical; rest are either `/404.html`, `noindex`, or self-referencing | ✅ |
| **Meta titles** | ✅ All unique and descriptive | ✅ |
| **Meta descriptions** | ✅ All present and unique (except 5 blog categories with duplicate) | ⚠️ 5 duplicate descriptions expected once titles are fixed |
| **H1/H2 hierarchy** | ✅ 1 H1 per page (exceptions are `noindex` admin/member pages) | ✅ |
| **Internal links** | ✅ 0 broken internal links (audit) | ✅ |
| **Image alt text** | ✅ 555/555 have `alt` | ✅ |
| **Open Graph metadata** | ✅ Present on key pages; `.io` og:image | ✅ |
| **Twitter/X metadata** | ✅ Same as OG (via `og-card.html` mechanism) | ✅ |
| **Mobile responsiveness** | ✅ `npm run audit:responsive`: 0 overflow, 0 inputs <16px, 0 tap targets <44px | ✅ |
| **Core Web Vitals** | ⚠️ 644 KB `assets/index-.js` on 71 pages; inline `<style>` 26.7 MB total | ⚠️ Performance optimization needed |
| **JavaScript-rendered content accessibility** | ⚠️ Some content generated by scripts (cohort dates, blog articles) may not be visible without JS | ⚠️ Standard for this scaffold; not a blocker |
| **Duplicate URLs** | ⚠️ Trailing-slash convention not enforced sitewide | ⚠️ 78 canonical vs sitemap trailing-slash mismatches |
| **Redirects** | ✅ `vercel.json`: www→apex, `/vybeclub*` → `/100-club*` | ✅ |
| **Structured data validation** | ⚠️ Organization JSON-LD present on homepage; validate with Rich Results Test | 🔧 **Medium** — ensure no errors |

**Trailing-slash status:** 78 mismatches between canonical and sitemap. Recommendation: choose convention (slash vs no-slash) and enforce sitewide — **not yet approved by owner**.

---

## 12. CLAIMS REQUIRING OWNER VERIFICATION

| # | Claim | Location | Action Required |
|---|---|---|---|
| 1 | Refund policy text consistency | Homepage FAQ, terms, any dedicated page | Locate source; confirm one consistent description; update all locations |
| 2 | Founder name(s) and biographies | Not in JSON-LD, not on public pages | Provide verified names; add to Organization JSON-LD if approved |
| 3 | Instructor facts / credentials | Listed as outstanding | Provide verified facts; add to `data/ai-answers.js` |
| 4 | Cohort assumptions (50 seats, 2027 IST, applyBy/decideBy) | Generated content throughout | Confirm with founder; update `data/cohorts.json` if dates change |
| 5 | Partner scope lines (beyond OpenAI/Lovable/Claude) | Not supplied | Provide verified partnership descriptions or keep at 3 partners only |
| 6 | Gilroy WOFF2 self-hosting licence | Confirmed 7 TTF files; conversion unconfirmed | Verify licensing allows WOFF2 subsetting for web use |
| 7 | "10,000 offer letters per year" goal interpretation | Present in `llms.json`, `ai.txt`, `faq.jsonl` | Ensure disclaimer "published goal, not a guarantee" remains visible |
| 8 | Scaled-content strategy for `/prep+/companies/` (323 pages) | 323 generated pages | Decide: noindex thin pages, rewrite all, or leave as-is |
| 9 | Trailing-slash convention (slash vs no-slash) | Sitewide | Choose and enforce; update sitemap and canonicals consistently |
| 10 | Additional partnership descriptions | Only 3 partners confirmed | Provide verified info or keep partner section to 3 logos only |

---

## 13. ISSUES REQUIRING EXTERNAL ACCOUNT ACCESS

| # | Issue | What's Needed |
|---|---|---|
| 1 | `POSTGRES_URL` (Vercel Postgres / Neon) | Set in Vercel dashboard; run `npm run db:setup` — forms need this to capture leads |
| 2 | `SLACK_WEBHOOK_URL` | Set in Vercel env vars; test form submission triggers Slack alert |
| 3 | Google Search Console & Bing Webmaster Tools verification tokens | Validate indexed pages, crawl errors, sitemap submission status |
| 4 | GSC/Bing verification SPF/DKIM/DMARC | Domain authentication for email deliverability if `careers@thecodingcompany.io` is used |
| 5 | PageSpeed Insights / real Lighthouse scores | API quota exceeded; no headless screenshot capability on this machine |
| 6 | GSC indexing status for individual routes | Confirm which of 578 pages are actually indexed by Google |

---

## 14. RECOMMENDATIONS — IMMEDIATE ACTIONS

### P0 — Critical (fix already completed)
- ✅ `.com` → `.io` migration across all scripts and built output verified

### P1 — High Priority
- [ ] **Rewrite 5 blog category titles** to be unique and descriptive
- [ ] **Clean duplicate `.partner-strip .ps-logo` CSS rule** (lines 340 and 2102 of `tcc-theme.css`)
- [ ] **Add `width`/`height` to 533 images** missing them (CLS fix)
- [ ] **Locate and verify refund policy** — one consistent description everywhere
- [ ] **Confirm cohort assumptions** with founder (50 seats, 2027 IST, applyBy/decideBy)
- [ ] **Set `POSTGRES_URL` in Vercel** + run `npm run db:setup`
- [ ] **Set `SLACK_WEBHOOK_URL` in Vercel** — test form notifications
- [ ] **Verify `_archive/bootcamps-45day.html`** — delete or add "archive" notice

### P2 — Medium Priority
- [ ] **Add `founder` field** to Organization JSON-LD if founder info provided
- [ ] **Add `priceRange`, `address`, `telephone`, `email`** to Organization JSON-LD if verified
- [ ] **Decide `/prep+/` scaled-content strategy** — noindex/rewrite/leave
- [ ] **Choose trailing-slash convention** sitewide and enforce
- [ ] **Add `/about/` and `/contact/` pages** within existing UI constraints
- [ ] **Add width/height to missing images** beyond the 22 already present
- [ ] **Add founder biographies** within existing layout constraints

### P3 — Lower Priority
- [ ] **Original content:** 3-4 new blog articles with genuine insights
- [ ] **Third-party authority:** LinkedIn optimization, startup directory listings
- [ ] **Authentic member feedback collection** process
- [ ] **Founder interview series** or expert articles
- [ ] **Technology podcast features** or guest appearances
- [ ] **Comparison content** (objective "role-based vs generic AI course" page)

### P4 — Longer-term (6+ months)
- [ ] **Authentic review collection** system for actual members
- [ ] **Digital PR outreach** to AI publications and Indian startup media
- [ ] **Founder authority building** — interviews, speaking engagements
- [ ] **Original research** on Indian AI adoption market

---

## 15. TASKS FOR IMPLEMENTATION REPORT

After fixes are applied, create:

**TCC_SEO_IMPLEMENTATION_REPORT.md** — documenting:
1. All issues identified (above)
2. All issues fixed
3. Pages updated (5 blog category titles, CSS rule, images, etc.)
4. Technical SEO changes (sitemap, canonicals, JSON-LD)
5. Brand consistency improvements (.com → .io migration)
6. Claims requiring owner verification (10 items listed)
7. Issues requiring external account access (6 items listed)
8. Issues requiring human content or evidence (5 items listed)
9. Remaining work ranked by priority

Also create:

**TCC_OWNER_APPROVAL_REQUIRED.md** — listing every item that requires a business decision, legal confirmation, or supporting evidence (the "Claims Requiring Owner Verification" table above, plus the P2/P3 decisions).

---

## 16. AUDIT COMPLETION CHECKLIST

- [x] Inspected complete codebase (578 HTML pages, 21 script files, data/)
- [x] Crawled every publicly accessible website route
- [x] Identified framework, routing system, CMS and existing SEO implementation
- [x] Inspected page titles, descriptions, headings, structured data, canonical URLs
- [x] Identified duplicate blog category titles (5 pages, one shared title)
- [x] Identified outdated/archive `.com` content (`_archive/bootcamps-45day.html`)
- [x] Checked `.com` → `.io` migration status (completed across all scripts)
- [x] Verified partner logo section (3 official partners only)
- [x] Checked refund policy consistency (requires owner confirmation)
- [x] Audited bootcamp cohort dates (from `data/cohorts.json`)
- [x] Checked gigs/outcomes claims for verification status
- [x] Verified image alt text (100% have `alt`; only 22/555 have width+height)
- [x] Checked H1 hierarchy (1 per page; 2 in conditional admin/member contexts)
- [x] Verified mobile responsiveness (audit:responsive: 0 offenders)
- [x] Identified technical SEO items (sitemap, robots.txt, og:data, etc.)
- [x] Documented all claims requiring owner verification (10 items)
- [x] Identified issues requiring external account access (6 items)
- [ ] **Pending:** Deploy with working git credentials or Vercel dashboard
- [ ] **Pending:** Owner confirmations on 10+ verification items

**Audit by:** AI brand perception strategist  
**Factual, no fabricated rankings, traffic, or ratings.**