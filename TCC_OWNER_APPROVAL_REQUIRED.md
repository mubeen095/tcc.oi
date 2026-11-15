# TCC OWNER APPROVAL REQUIRED

This document lists every item that requires a business decision, legal confirmation, or supporting evidence from The Coding Company team/or leadership. Do not implement these without explicit owner authorization.

---

## 1. REFUND POLICY CONSISTENCY

| # | Issue | Affected Locations | Required Action |
|---|---|---|---|
| 1 | Refund policy text must be consistent across all pages | - Homepage FAQ section<br>- Terms of service page<br>- Any dedicated refund policy page | **Owner must:**<br>• Locate the current legal refund policy<br>• Provide the exact wording<br>• Confirm it can be published on the website<br>• After approval, update ALL locations consistently |

**Why this matters:** Inconsistent refund policy descriptions across pages create trust issues and potential legal risk. Google may also flag conflicting policy information.

**Action:** TCC team/legal to provide one consistent refund policy text. After approval, it will be injected into all relevant pages.

---

## 2. FOUNDER INFORMATION

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | Founder name(s) not published anywhere on public website | Not in Organization JSON-LD; not on any public page | **Owner must:**<br>• Provide verified founder name(s)<br>• Provide brief biography/credentials (if approve for public disclosure)<br>• Confirm photo can be used on website<br>• After approval: add to Organization JSON-LD on homepage, add `/about-page/` or equivalent within existing UI |

**Why this matters:** Organization schema typically includes founder key people. AI assistants and users want to know who's behind the company. Transparency builds trust.

**Action:** Provide founder details for inclusion in structured data and potential about page.

---

## 3. INSTRUCTOR FACTS & CREDENTIALS

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | Instructor facts listed as "outstanding item from previous state" | Not verified; not in `data/ai-answers.js` or any public page | **Owner must:**<br>• Provide verified instructor names, credentials, roles<br>• Confirm if instructor bios can be published on website<br>• After approval: add to `data/ai-answers.js`, potentially add instructor pages within existing layout |

**Why this matters:** Credible instructors boost brand authority. Fabricated or unverified credentials damage trust.

**Action:** Provide verified instructor facts for inclusion in the machine-readable brand files and website.

---

## 4. COHORT DATE ASSUMPTIONS

| # | Issue | Current Assumptions | Required Action |
|---|---|---|---|
| 1 | Cohort dates and seat counts appear in generated marketing content | • 50 seats per cohort<br>• 2027 IST start dates<br>• `applyBy` = 7 days before start<br>• `decideBy` = 3 days before start | **Owner must:**<br>• Confirm these assumptions are current<br>• Provide actual next cohort start date if known<br>• If next cohort date is unknown, use neutral language: "Application open — join waitlist"<br>• Update `data/cohorts.json` if dates/seed counts change<br>• Re-run `npm run build:seo` to regenerate affected pages |

**Why this matters:** Displaying expired or incorrect cohort dates misleads prospective applicants. The `build-cohorts.mjs` script generates entire enrolment pages from this data.

**Action:** Founder confirmation required before the next cohort cycle.

---

## 5. PARTNER SCOPE LINES

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | Only 3 official partners confirmed; no scope lines provided | OpenAI, Lovable ("Official Solutions Partner"), Claude | **Owner must:**<br>• Confirm if TCC has additional partnerships beyond these 3<br>• Provide verified partnership descriptions (relationship, benefits, verification links)<br>• If only 3 partners: keep partner section as-is with current captions ("Official Partner", "Official Solutions Partner", "Official Partner")<br>• After approval: update partner captions or add partner descriptions within existing UI |

**Why this matters:** Partner descriptions must be accurate and verifiable. Fake or exaggerated partnership claims damage credibility and may expose TCC to legal risk.

**Action:** Owner to confirm partner scope. If only 3 partners, no changes needed beyond what's already live.

---

## 6. GILROY FONT SELF-HOSTING LICENCE

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | 7 TTF files confirmed self-hosted; WOFF2 conversion/subsetting unconfirmed | `public/assets/fonts/` contains Gilroy TTF files; conversion status unknown | **Owner must:**<br>• Verify the WOFF2/WebFont licence agreement allows web subsetting and self-hosting<br>• If permitted: convert TTFs to WOFF2, add proper `font-display` and `unicode-range` subsets<br>• If not permitted: keep TTFs as-is; consider CDN option (note: performance trade-off)<br>• After approval: implement font conversion or confirm current arrangement is final |

**Why this matters:** Font licensing is a legal risk. Unverified web-use permissions could expose TCC to claims. Also, WOFF2 conversion significantly reduces font file size (current 7 TTFs ~960 KB) and improves Core Web Vitals.

**Action:** Licensing confirmation required. If permitted, font conversion is a performance win.

---

## 7. SCALED-CONTENT STRATEGY FOR `/PREP+/COMPANIES/`

| # | Issue | Scale | Options |
|---|---|---|---|
| 1 | 323 `/prep+/companies/` pages generated from data | All generated from `data/companies-full.js` + `scripts/build-prep-pages.js` | **Owner must choose one:**<br>• **Option A: Noindex** — Add `noindex` meta robots to all 323 pages; they remain live but won't appear in Google index. Zero development work.<br>• **Option B: Rewrite all** — Rewrite every company page with unique, valuable content. Significant content writer effort; 2+ weeks minimum.<br>• **Option C: Leave as-is** — Keep generating; accept that 323 thin pages may dilute search equity. Risk of Google flagging as scaled content.<br>• **Option D: Remove entirely** — Delete the `/prep+/companies/` directory and redirect to `/prep+/` hub. Requires redirect plan. |

**Why this matters:** 323 auto-generated company pages with minimal unique content are a scaled-content risk. Google's guidelines throttle or devalue pages with little added value.

**Action:** Owner must decide Option A, B, C, or D. This is a strategic decision affecting the entire `/prep+/` architecture.

---

## 8. TRAILING-SLASH CONVENTION

| # | Issue | Current State | Required Action |
|---|---|---|---|
| 1 | Trailing-slash convention not enforced sitewide | 78 canonical vs sitemap trailing-slash mismatches; some pages use `/`, others omit | **Owner must choose one convention** and enforce sitewide:<br>• **Option 1: No slash** (apex) — e.g., `https://thecodingcompany.io/about`<br>• **Option 2: Slash** — e.g., `https://thecodingcompany.io/about/`<br>• After choice: update all canonical tags, sitemap.xml URLs, internal links, and 301-redirect the alternative variant to the chosen form<br>• Re-run `npm run build:seo` to regenerate sitemap and canonicals consistently |

**Why this matters:** Mixed slash/non-slash conventions create duplicate content light and confuse crawlers. Google may index both variants, splitting page authority.

**Action:** Owner decision + developer implementation. Once decided, a script can mass-update all canonicals and regenerate the sitemap.

---

## 9. ADDITIONAL `/ABOUT/` AND `/CONTACT/` PAGES

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | No `/about/` or `/contact/` HTML pages in `public/` | Brand story and contact mailto exist only in `llms-full.txt` | **Owner must decide:**<br>• **Option A: Add `/about/` page** within existing UI constraints (brand story, mission, ecosystem, partnerships, team)<br>• **Option B: Add `/contact/` page** with mailto: `careers@thecodingcompany.io`, social links, office/location if any<br>• **Option C: Leave as-is** — Accept that brand story is covered in `llms-full.txt`, `llms.json`, and `ai.txt` only; no on-site pages<br>• After decision: developer implements within existing design system (no visual redesign) |

**Why this matters:** Having on-brand `/about/` and `/contact/` pages improves user trust and gives AI assistants more on-page structured data context. However, these must preserve the existing visual language.

**Action:** Owner decision. If Option A or B: developer implements within current UI framework.

---

## 10. GLOBAL NAVIGATION & USER JOURNEY CHANGES

| # | Issue | Current State | Required Action |
|---|---|---|---|
| 1 | Any navigation, layout, or user journey changes must not alter visual design | All existing UI, UX, colours, typography, animations, component positioning must be preserved | **Strict rule:** Only content, metadata, architecture, structured data, accessibility, performance fixes allowed<br>• No component replacement<br>• No colour palette changes<br>• No typography font family changes (Gilroy/Instrument Serif/Newsreader/DM Mono must remain)<br>• No navigation structure reordering that changes user journeys<br>• No animation removal or addition<br>• No responsive breakpoint changes |

**Why this matters:** The entire project constraint is "do not redesign." Visual consistency is the top priority. Any change that looks different, even if functionally better, violates the core objective.

**Action:** All developers and content editors: adhere to strict visual preservation. If a fix requires a visual change, it is out of scope.

---

## 11. CLAIMS IN `llms.json`, `ai.txt`, `faq.jsonl`

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | All machine-readable brand files contain verified claims only | `llms.json`, `ai.txt`, `faq.jsonl` are the source of truth for AI assistants | **Owner must:**<br>• Confirm all claims in these files are accurate and verifiable<br>• If adding new claims: provide evidence and measurement period<br>• If removing claims: confirm they are no longer true<br>• Never fabricate statistics, reviews, placement numbers, or salary data<br>• After confirmation: re-run `npm run build:seo` to regenerate files with any approved changes |

**Why this matters:** These files are the primary source AI assistants (ChatGPT, Gemini, Claude, Perplexity, Copilot) use to answer user questions about TCC. Inaccurate or fabricated claims in these files will be surfaced to users.

**Action:** Owner review and confirmation of all machine-readable content before any modifications.

---

## 12. `/vybeclub*` → `/100-club*` REDIRECT

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | Legacy redirect from `/vybeclub*` to `/100-club*` in `vercel.json` | Present in `vercel.json` redirect rules | **Owner must confirm:**<br>• Is the `/vybeclub*` path still needed?<br>• Should this redirect remain, be modified, or be removed?<br>• If removed: ensure no inbound traffic or indexed pages use that path<br>• After confirmation: update `vercel.json` accordingly |

**Why this matters:** Redirect rules in Vercel persist and affect crawl budget. Unnecessary redirects should be cleaned up.

**Action:** Owner confirmation on whether to keep, modify, or remove the `/vybeclub*` redirect.

---

## 13. BRAND CONFUSION WITH SIMILAR NAMES

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | "The Coding Company" vs other businesses with similar names | `llms.json` `sameAs` only includes verified profiles (LinkedIn, Instagram, LMS)<br>No generic "TCC" references in machine files | **Owner must:**<br>• Confirm if any active competition or similar-named businesses exist<br>• If yes: ensure `llms.json` `sameAs` does not include them<br>• If no active confusion: keep current `sameAs` as-is<br>• After confirmation: regenerate `llms.json` if any sameAs changes are needed |

**Why this matters:** Entity confusion can cause AI assistants to mix up different businesses with similar names. The `sameAs` field in Organization schema should only point to genuinely official profiles.

**Action:** Owner confirmation on whether any entity confusion mitigation is needed.

---

## 14. /DIAGNOSTIC/ AND /VERIFY/ ROUTE MAINTENANCE

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | `/diagnostic/` and `/verify/*` routes must remain product-only | No fabricated alumni, reviews, or placement numbers<br>Only claims with verifiable evidence | **Owner must:**<br>• Confirm that `/verify/` continues to list only claims with actual evidence attached<br>• If new evidence becomes available: add to verify pages with proper attribution<br>• If a claim is removed from `/verify/`: ensure it is also removed from marketing claims elsewhere (consistency)<br>• Never add fake reviews, ratings, or placement statistics<br>• After confirmation: maintain the product-only discipline |

**Why this matters:** The `/verify/` and `/diagnostic/` pages are the brand's transparency differentiator. Violating the "product-only, no fabricates" rule destroys trust and may trigger reputational damage.

**Action:** Ongoing discipline: every addition to `/verify/` must have verifiable evidence. No exceptions.

---

## 15. AI SEARCH TESTING RESULTS

| # | Issue | Current Status | Required Action |
|---|---|---|---|
| 1 | AI platform testing results must not be claimed as "proven" | No external verification that Google/ChatGPT/Gemini/Claude/Perplexity/Copilot have changed recommendations | **Strict rule:**<br>• Do not claim that any content changes have caused AI assistants to recommend TCC<br>• Do not claim indexing, ranking, or visibility improvements based on unexternalized results<br>• Record testing in TCC_SEO_IMPLEMENTATION_REPORT.md for internal tracking<br>• Share results with owner, but do not publicize as "AI accepts TCC" without independent verification<br>• Desired outcome: AI systems find TCC "clear, credible, consistent and trustworthy"—but this is a goal, not a guaranteed result |

**Why this matters:** AI model behavior is opaque and varies by user, query, model version, and training data. Falsely claiming AI recommendation changes is misleading and potentially actionable.

**Action:** All AI search testing documented internally only. No claims of "AI now recommends TCC" without external, independently verified evidence.

---

# SUMMARY — OWNER APPROVAL REQUIRED ITEMS

| Priority | Item | Decision Maker | Estimated Effort |
|---|---|---|---|
| P1 | Refund policy text consistency | Legal/Owner | 1-2 days (once text provided) |
| P1 | Founder information (names, bios) | Owner | 1 day |
| P1 | Instructor facts & credentials | Owner | 1 day |
| P1 | Cohort date assumptions | Owner | 1 day |
| P1 | Partner scope lines | Owner | <1 day |
| P2 | Gilroy WOFF2 conversion & licensing | Owner/Legal | 2-3 days (if licensed) |
| P2 | `/prep+/` scaled-content strategy (323 pages) | Owner/Content team | 1 day (decision) + weeks (if rewriting) |
| P2 | Trailing-slash convention | Owner | <1 day (decision) + developer time to enforce |
| P2 | `/about/` and `/contact/` pages | Owner | 2-5 days (implementation within UI) |
| P3 | Comparison content, member showcase, third-party PR | Owner/Content team | 2-4 weeks (if approved) |
| P4 | AI search testing framework | Owner | 1-2 weeks (testing plan) |

**All items marked P1 or P2 must be resolved before the Vercel deployment goes live with full brand consistency.** P3 and P4 are ongoing enhancements.

**If any P1 item is left unresolved, the deployment should still proceed with the `.com` → `.io` migration already completed, but the unresolved item should be documented in the implementation report and addressed as soon as possible.**

---

*Document generated as part of TCC website audit. All items must be resolved or documented before final implementation sign-off.*