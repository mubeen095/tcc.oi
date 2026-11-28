# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Students and job seekers (co-primary):** College students and early-career people coming to thecodingcompany.io to build AI skills, earn role-relevant credentials, practice for interviews/exams, and pursue internships or placement support.
- **Working professionals (co-primary):** Employed professionals coming to upskill or reskill with role-based AI certifications for career growth and job-role relevance.

## Product Purpose

The Coding Company (TCC) is an AI education and placement company. The website helps learners discover TCC's offerings, choose role-relevant AI learning/certification paths, practice for hiring processes, and connect to placement support. Success means a visitor can understand the right path for their situation and take a concrete next step (explore certifications, prepare with Prep+, or engage placement/enrolment flows).

## Positioning

TCC's differentiating mechanism is the end-to-end pathway from certification to interview preparation to placement support: role-based AI credentials (TCC CERT+), practice/prep resources (Prep+), and career placement support (TCC Placement Partner) connected as one progression rather than isolated offerings.

## Operating Context

- Public marketing/education website at `https://thecodingcompany.io`, with static/generated pages under `tcc-site/public/` and build scripts in `tcc-site/scripts/`.
- Key product surfaces include CERT+ (`/bootcamps/`), Prep+ (`/prep+/`), Placement Partner (`/placement/`), 100 Club, gigs, webinars, domains, and enrolment/member flows.
- AI-discovery surfaces are maintained as first-class artifacts (`llms.txt`, `llms-full.txt`, `llms.json`, `ai.txt`, `faq.jsonl`, sitemap/feed).
- Deployment/build context is Vercel-oriented (`tcc-site/vercel.json`, `npm run build:seo`), with Postgres-backed API routes for forms/auth/exam flows when configured.

## Capabilities and Constraints

- **Confirmed capabilities (from repo):** TCC CERT+ role-based AI certification catalog; Prep+ interview/placement preparation library (aptitude, programming, DSA, technical MCQs, company papers, mock tests); TCC Placement Partner program; 100 Club; gigs; webinars; member/login/admin flows; lead capture and exam/OTP API endpoints.
- **Confirmed brand/product names to preserve:** The Coding Company / TCC, TCC CERT+, TCC Placement Partner, Prep+, 100 Club.
- **Confirmed published facts currently represented in repo:** 1,048 role-based AI credentials; 262 validated job roles; 32 industries; 4 tiers (Foundation, Practitioner, Strategist, Executive); 3-year credential validity; 10,000 offer letters/year placement goal framed as a published goal, not a guarantee. Changes to these require verified source updates across product/data/machine-readable surfaces.
- **Constraints:** Future work must not fabricate testimonials, reviews, placement guarantees, customer logos/partnership claims, pricing, or outcome evidence beyond verified sources. Existing generated/scaled-content and SEO architecture should be handled carefully to avoid regressions.
- **Open/undecided (needs owner confirmation):** Refund policy canonical text; founder/instructor verified facts; cohort assumptions/dates beyond current `data/cohorts.json`; partner scope beyond currently confirmed partners; Gilroy font webfont licensing/subsetting; `/prep+/companies/` scaled-content strategy; trailing-slash convention; whether to add `/about/` and `/contact/` pages; VybeClub redirect retention.

## Brand Commitments

- Preserve existing product/brand naming: The Coding Company / TCC, TCC CERT+, Placement Partner, Prep+, 100 Club.
- Maintain factual, verifiable claims in user-facing and machine-readable content; placement goal must remain framed as a goal, not a guarantee.
- Existing visual/system assets and tone are present in the codebase, but no new visual direction was established during init.

## Evidence on Hand

- `TCC_WEBSITE_AUDIT.md` — site audit, SEO/brand findings, and owner-approval items.
- `TCC_OWNER_APPROVAL_REQUIRED.md` — unresolved business/legal/content decisions.
- `tcc-site/SETUP.md` — architecture, build/deploy, data, and operational setup.
- `tcc-site/data/ai-answers.js`, `tcc-site/public/llms*.txt`, `tcc-site/public/ai.txt`, `tcc-site/public/faq.jsonl` — machine-readable brand/product facts.
- `tcc-site/data/cohorts.json` — cohort schedule source of truth.
- `tcc-site/public/` and `tcc-site/scripts/` — live/generated site surfaces and build pipeline.

## Product Principles

- **Be verifiable:** Publish only claims that can be traced to confirmed product data or owner-approved evidence; label goals, benchmarks, and sample data clearly.
- **Serve both audiences clearly:** Students/job seekers and working professionals should quickly find the path relevant to their situation without diluting the other's journey.
- **Connect the pathway:** Present CERT+, Prep+, and Placement Partner as a coherent progression where relevant, not disconnected pages.
- **Preserve trust through consistency:** Keep names, numbers, policies, and machine-readable facts aligned across pages, data files, and generated artifacts.
- **Prefer careful evolution:** Improve clarity and structure without inventing facts or disrupting established product surfaces and workflows.

## Accessibility & Inclusion

No product-specific accessibility or inclusion requirement was established during init beyond existing site practices; treat accessibility as a quality bar in future UI work.
