/* ============================================================================
 * blog-meta.cjs — the single source of truth for blog metadata.
 *
 * Content lives in build-blog-articles.js. This file carries only what the
 * hub, category pages, RSS feed and structured data need, so all four surfaces
 * are generated from one list and can never drift apart.
 *
 * Newest first. `file` is relative to /blog/.
 * ==========================================================================*/
'use strict';

const SITE = 'https://thecodingcompany.io';

const ARTICLES = [
  {
    file: 'how-to-read-a-job-description.html',
    title: 'How to Read a Job Description Like a Hiring Manager',
    seoTitle: 'How to Read a Job Description Like a Hiring Manager | TCC',
    desc: 'A job description has three tiers of requirement and most candidates treat them as equal. Decode one in ten minutes and map your evidence to what gets screened.',
    tag: 'Interview',
    date: '2026-11-12',
    dateLabel: '12 November 2026',
    readTime: 8,
    image: 'hero-people-work.jpg',
    imageAlt: 'A candidate reading a job description before applying',
    category: 'interview',
  },
  {
    file: 'ai-tools-in-interviews.html',
    title: 'AI Tools in an Interview: What Is Allowed, and What Gets You Rejected',
    seoTitle: 'AI Tools in an Interview: What Is Allowed, What Gets You Rejected | TCC',
    desc: 'The three AI policies you will meet in interviews, the one behaviour that ends a process early, and how to disclose tool use in a way that earns marks.',
    tag: 'Interview',
    date: '2026-11-11',
    dateLabel: '11 November 2026',
    readTime: 9,
    image: 'hero-ai-abstract.jpg',
    imageAlt: 'An abstract visual representing AI assistance during an interview',
    category: 'interview',
  },
  {
    file: 'tcs-nqt-what-it-tests.html',
    title: 'What the TCS NQT Actually Tests, and What It Does Not',
    seoTitle: 'What the TCS NQT Actually Tests (And What It Does Not) | TCC',
    desc: 'A section-by-section breakdown of what the TCS NQT measures, the four places candidates lose marks, and how to spend three weeks preparing without wasting them.',
    tag: 'Placement',
    date: '2026-11-10',
    dateLabel: '10 November 2026',
    readTime: 10,
    image: 'hero-analytics.jpg',
    imageAlt: 'Analytics dashboard representing aptitude test performance',
    category: 'placement',
  },
  {
    file: 'ai-placement-programs.html',
    title: 'AI Placement Programs Explained: How to Get Placed After Learning AI',
    seoTitle: 'AI Placement Programs Explained: How to Get Placed After Learning AI | TCC',
    desc: 'What an AI placement program actually does, the red flags that separate a real one from marketing, and how TCC Placement Partner works in four phases.',
    tag: 'Placement',
    date: '2026-10-19',
    dateLabel: '19 October 2026',
    readTime: 9,
    image: 'hero-network.jpg',
    imageAlt: 'A network of connections representing employer introductions',
    category: 'placement',
  },
  {
    file: 'how-to-get-ai-internship-2026.html',
    title: 'How to Get an AI Internship in 2026',
    seoTitle: 'How to Get an AI Internship in 2026: A Practical Guide for Students | TCC',
    desc: 'A step-by-step roadmap from zero to your first AI internship — the skills that matter, the portfolio that convinces, and the outreach that gets replies.',
    tag: 'Internships',
    date: '2026-10-19',
    dateLabel: '19 October 2026',
    readTime: 8,
    image: 'hero-people-work.jpg',
    imageAlt: 'People collaborating on AI projects',
    category: 'internships',
  },
  {
    file: 'role-based-ai-certifications-vs-generic.html',
    title: 'Role-Based AI Certifications vs Generic AI Courses',
    seoTitle: 'Role-Based AI Certifications vs Generic AI Courses | TCC',
    desc: 'Why a credential that names your job title beats a general certificate in the hiring stack — and when a broad AI course is still the right call.',
    tag: 'AI Career',
    date: '2026-10-19',
    dateLabel: '19 October 2026',
    readTime: 7,
    image: 'hero-chip.jpg',
    imageAlt: 'Close-up of an AI processor chip',
    category: 'ai-career',
  },
];

/* Category descriptors used by build-blog-categories.js. `from` is an ordered
   list of article files; every file must exist in ARTICLES. */
const CATEGORIES = [
  {
    slug: 'ai-courses.html',
    name: 'AI Courses',
    crumb: 'AI Courses',
    image: 'hero-data.jpg',
    title: 'AI Courses &amp; <span class="accent">certification</span>',
    sub: 'How to choose AI training that actually changes what you can do — and how role-based certification compares with broad AI courses.',
    from: ['role-based-ai-certifications-vs-generic.html', 'ai-placement-programs.html', 'how-to-read-a-job-description.html', 'how-to-get-ai-internship-2026.html'],
    extra: {
      href: '/ai-courses-for/',
      tag: 'AI Courses',
      title: 'AI Courses for Your Exact Role &amp; Industry',
      desc: 'Browse AI certifications across 32 industries — from healthcare and finance to agriculture and defence — and find the tier that matches your experience.',
      meta: '32 industries',
      image: 'hero-analytics.jpg',
    },
  },
  {
    slug: 'internships.html',
    name: 'Internships',
    crumb: 'Internships',
    image: 'hero-people-work.jpg',
    title: 'AI <span class="accent">internships</span>',
    sub: 'Everything about landing your first AI internship: the portfolio that convinces, the outreach that gets replies, and what to do when nothing converts.',
    from: ['how-to-get-ai-internship-2026.html', 'how-to-read-a-job-description.html', 'ai-tools-in-interviews.html', 'role-based-ai-certifications-vs-generic.html'],
  },
  {
    slug: 'placement.html',
    name: 'Placement',
    crumb: 'Placement',
    image: 'hero-network.jpg',
    title: 'AI <span class="accent">placement</span>',
    sub: 'How AI placement programs work, how to judge one before you pay, and how portfolio-first positioning turns a credential into an offer letter.',
    from: ['ai-placement-programs.html', 'tcs-nqt-what-it-tests.html', 'how-to-read-a-job-description.html', 'how-to-get-ai-internship-2026.html'],
  },
  {
    slug: 'ai-career.html',
    name: 'AI Career',
    crumb: 'AI Career',
    image: 'hero-chip.jpg',
    title: 'AI <span class="accent">career</span>',
    sub: 'Certification, positioning and proof — the career-side guides for professionals moving into an AI-heavy version of the job they already do.',
    from: ['role-based-ai-certifications-vs-generic.html', 'how-to-read-a-job-description.html', 'ai-tools-in-interviews.html', 'ai-placement-programs.html'],
    extra: {
      href: '/placement/',
      tag: 'Placement',
      title: 'TCC Placement Partner',
      desc: 'Portfolio building, role-aligned positioning, interview readiness and employer connections — with a published goal of 10,000 offer letters per year.',
      meta: '10,000 offers / year',
      image: 'hero-network.jpg',
    },
  },
  {
    slug: 'interview.html',
    name: 'Interview',
    crumb: 'Interview',
    image: 'hero-ai-abstract.jpg',
    title: 'Interview <span class="accent">preparation</span>',
    sub: 'What interviewers screen for, how to disclose AI use without losing the room, and how to read a job description the way the person filtering it does.',
    from: ['how-to-read-a-job-description.html', 'ai-tools-in-interviews.html', 'tcs-nqt-what-it-tests.html', 'role-based-ai-certifications-vs-generic.html'],
    extra: {
      href: '/diagnostic/',
      tag: 'Practice',
      title: 'Sit a 15-Minute Diagnostic',
      desc: 'Fifteen questions, scored on submit, with the reasoning shown for everything you get wrong. Find out where you actually stand before an interview does.',
      meta: '15 minutes',
      image: 'hero-analytics.jpg',
    },
  },
];

module.exports = { SITE, ARTICLES, CATEGORIES };
