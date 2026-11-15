/* ─────────────────────────────────────────────────────────────────────────
   /api/diagnostic — the free placement-readiness diagnostic.

   The point of this endpoint is credibility, so the answer key never leaves
   the server:
     GET  → the question set, with `answer` and `why` stripped
     POST → score, per-section breakdown, and explanations for wrong answers

   It works with no database configured. If a database is present and the
   candidate leaves an email, the result is stored as a lead; a storage
   failure must never cost the candidate their score.
   ───────────────────────────────────────────────────────────────────────── */

const { sql, json, readJson } = require('./_db');
const { notifySlack } = require('./_notify');

const TIME_LIMIT_SECONDS = 15 * 60;
const MAX_BODY = 32 * 1024;

const SECTIONS = [
  { id: 'quant', name: 'Quantitative' },
  { id: 'reasoning', name: 'Reasoning' },
  { id: 'technical', name: 'Technical' },
  { id: 'data', name: 'Data interpretation' },
];

/* Questions are written in the shape Indian placement tests actually use:
   one unambiguous correct option, no trick wording, no negative marking. */
const QUESTIONS = [
  {
    id: 'q1',
    section: 'quant',
    prompt: 'A product is priced at ₹2,000. The price is raised by 25%, then the new price is reduced by 20%. What is the final price?',
    options: ['₹1,900', '₹2,000', '₹2,100', '₹2,400'],
    answer: 1,
    why: '₹2,000 × 1.25 = ₹2,500. Then ₹2,500 × 0.80 = ₹2,000. A 25% rise and a 20% fall cancel out exactly, because they act on different bases.',
  },
  {
    id: 'q2',
    section: 'quant',
    prompt: 'Four engineers ship 3 features in 12 days. At the same rate, how many days do six engineers need to ship 9 features?',
    options: ['18 days', '24 days', '27 days', '36 days'],
    answer: 1,
    why: 'Output per engineer per day is 3 ÷ (4 × 12) = 0.0625 features. Six engineers produce 0.375 features per day, so 9 features take 9 ÷ 0.375 = 24 days.',
  },
  {
    id: 'q3',
    section: 'quant',
    prompt: '250 candidates take round one. 40% clear it, and 30% of those who clear round one also clear round two. How many reach round three?',
    options: ['25', '30', '40', '75'],
    answer: 1,
    why: '250 × 0.40 = 100 clear round one. 100 × 0.30 = 30 clear round two. Percentages of a percentage compound — they do not add.',
  },
  {
    id: 'q4',
    section: 'quant',
    prompt: 'The average of five numbers is 18. One number, 30, is removed and replaced with 10. What is the new average?',
    options: ['10', '12', '14', '16'],
    answer: 2,
    why: 'The original total was 5 × 18 = 90. Removing 30 and adding 10 leaves 70, and 70 ÷ 5 = 14.',
  },
  {
    id: 'q5',
    section: 'reasoning',
    prompt: 'What comes next: 2, 6, 12, 20, 30, ?',
    options: ['36', '40', '42', '46'],
    answer: 2,
    why: 'The gaps are 4, 6, 8, 10 — rising by 2 each time. The next gap is 12, so 30 + 12 = 42.',
  },
  {
    id: 'q6',
    section: 'reasoning',
    prompt: 'In a batch of 60 students, 30 play cricket, 20 play football, and 10 play both. How many play at least one of the two?',
    options: ['30', '40', '50', '60'],
    answer: 1,
    why: 'Inclusion–exclusion: 30 + 20 − 10 = 40. The 10 who play both are counted twice, so they must be subtracted once.',
  },
  {
    id: 'q7',
    section: 'reasoning',
    prompt: 'No engineer is a manager. Some managers are designers. Which statement must be true?',
    options: [
      'Some engineers are designers',
      'Some designers are not engineers',
      'All designers are managers',
      'No designer is an engineer',
    ],
    answer: 1,
    why: 'The managers who are designers cannot be engineers, because no engineer is a manager. So at least some designers are not engineers. The others go further than the premises allow.',
  },
  {
    id: 'q8',
    section: 'reasoning',
    prompt: 'A survey of 1,200 engineering graduates found that 62% could not explain how a hash table handles collisions, and 48% had never used version control in a team. The authors concluded that curricula lag industry practice. Which claim is best supported by the survey?',
    options: [
      'Most graduates are unemployable',
      'A majority of those surveyed lacked one specific data-structures concept',
      'Version control matters more than data structures',
      'Bootcamps teach better than degree programmes',
    ],
    answer: 1,
    why: 'Only this option restates what was measured: 62% is a majority, and the missing concept is collision handling. The others generalise beyond the data.',
  },
  {
    id: 'q9',
    section: 'reasoning',
    prompt: 'Meticulous is to Careless as Candid is to…',
    options: ['Honest', 'Evasive', 'Blunt', 'Open'],
    answer: 1,
    why: 'The relationship is antonym, not synonym. Meticulous and careless are opposites, so candid pairs with evasive — not with honest, blunt or open, which are all close in meaning.',
  },
  {
    id: 'q10',
    section: 'technical',
    prompt: 'What is the time complexity of binary search on a sorted array of n elements?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    answer: 1,
    why: 'Each comparison halves the search space, so the number of steps is logarithmic in n. Linear search is O(n); sorting first would cost O(n log n).',
  },
  {
    id: 'q11',
    section: 'technical',
    prompt: 'What does this print?\n\nlet a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);',
    options: ['3', '4', '5', 'It throws an error'],
    answer: 1,
    why: '`const b = a` copies the reference, not the array. Both names point at the same array, so pushing through `b` changes what `a` sees. Length becomes 4.',
  },
  {
    id: 'q12',
    section: 'technical',
    prompt: 'A table has 10 order rows. Three rows have a NULL status. What do these return?\n\nSELECT COUNT(*) FROM orders;\nSELECT COUNT(status) FROM orders;',
    options: ['10 and 10', '10 and 7', '7 and 7', '7 and 10'],
    answer: 1,
    why: 'COUNT(*) counts rows. COUNT(column) skips NULLs in that column. This is the single most common SQL question in analyst interviews.',
  },
  {
    id: 'q13',
    section: 'technical',
    prompt: 'An API request succeeds and creates a new record. Which status code is correct?',
    options: ['200 OK', '201 Created', '204 No Content', '202 Accepted'],
    answer: 1,
    why: '201 signals that the request succeeded and a resource now exists. 204 is for success with nothing to return; 202 means accepted but not finished.',
  },
  {
    id: 'q14',
    section: 'data',
    prompt: 'Offers were 40 in January and 60 in March. What is the percentage increase from January to March?',
    options: ['20%', '33%', '50%', '66%'],
    answer: 2,
    why: 'The increase is 20 offers on a base of 40, so 20 ÷ 40 = 50%. Dividing by the later figure gives 33%, which is the most common mistake here.',
  },
  {
    id: 'q15',
    section: 'data',
    prompt: 'A page gets 4,000 views, 800 form starts, 200 submissions and 50 interviews. Where is the largest absolute drop-off?',
    options: [
      'Views to form starts',
      'Form starts to submissions',
      'Submissions to interviews',
      'All drops are equal',
    ],
    answer: 0,
    why: 'The drops are 3,200, 600 and 150. Views to form starts loses the most people in absolute terms — which is why the page itself, not the form, is usually the first thing to fix.',
  },
];

const TOTAL = QUESTIONS.length;

const BANDS = [
  {
    min: 13,
    key: 'ready',
    title: 'Tier-1 ready',
    line: 'You would clear most aptitude rounds today. The work left is speed and interview polish, not fundamentals.',
  },
  {
    min: 10,
    key: 'close',
    title: 'Close, with named gaps',
    line: 'The foundation is real. Two or three specific topics are costing you marks, and they are fixable in weeks.',
  },
  {
    min: 6,
    key: 'foundation',
    title: 'Foundation needs structured work',
    line: 'You know more than you can currently execute under time pressure. This is the most common profile — and the most improvable.',
  },
  {
    min: 0,
    key: 'start',
    title: 'Start from the mechanics',
    line: 'Begin with the underlying rules rather than practice papers. Practising a shaky foundation locks the errors in.',
  },
];

function bandFor(score) {
  return BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];
}

function publicQuestion(q) {
  const { answer, why, ...rest } = q;
  return rest;
}

module.exports = async function (req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return json(res, 200, {
      timeLimitSeconds: TIME_LIMIT_SECONDS,
      sections: SECTIONS,
      questions: QUESTIONS.map(publicQuestion),
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    return json(res, 400, { error: 'Invalid JSON' });
  }

  if (JSON.stringify(body || {}).length > MAX_BODY) {
    return json(res, 413, { error: 'Payload too large' });
  }

  const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const startedAt = Number(body.started_at || 0);
  const submittedAt = Number(body.submitted_at || 0);
  const elapsedMs =
    startedAt > 0 && submittedAt > startedAt ? submittedAt - startedAt : 0;

  const sectionStats = new Map(
    SECTIONS.map((s) => [s.id, { id: s.id, name: s.name, correct: 0, total: 0 }])
  );

  let score = 0;
  const review = [];

  for (const q of QUESTIONS) {
    const stat = sectionStats.get(q.section);
    stat.total += 1;

    const raw = answers[q.id];
    const given = Number.isInteger(raw) ? raw : Number(raw);
    const isCorrect = given === q.answer;

    if (isCorrect) {
      score += 1;
      stat.correct += 1;
    } else {
      review.push({
        id: q.id,
        prompt: q.prompt,
        your: Number.isInteger(given) && q.options[given] !== undefined ? q.options[given] : null,
        correct: q.options[q.answer],
        why: q.why,
      });
    }
  }

  const percent = Math.round((score / TOTAL) * 100);
  const band = bandFor(score);

  /* Storage is best-effort: the score is the product, the lead is a bonus. */
  const email = String(body.email || '').trim().toLowerCase();
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    const payload = {
      score,
      total: TOTAL,
      percent,
      band: band.key,
      sections: [...sectionStats.values()],
      elapsed_seconds: Math.round(elapsedMs / 1000),
      source: 'diagnostic',
      page_url: '/diagnostic/',
      _t: submittedAt || Date.now(),
    };
    try {
      const { rows } = await sql`
        INSERT INTO submissions (form_type, email, payload)
        VALUES ('diagnostic', ${email}, ${JSON.stringify(payload)}::jsonb)
        RETURNING id
      `;
      notifySlack({
        title: 'New lead — diagnostic',
        fields: {
          id: rows[0] && rows[0].id,
          name: body.name,
          email,
          score: `${score}/${TOTAL} (${percent}%)`,
          band: band.title,
          time: payload.elapsed_seconds ? `${payload.elapsed_seconds}s` : '',
        },
        url: '/diagnostic/',
      }).catch(() => {});
    } catch (e) {
      /* No database yet? The candidate still gets their report. */
    }
  }

  return json(res, 200, {
    ok: true,
    score,
    total: TOTAL,
    percent,
    band,
    sections: [...sectionStats.values()],
    review,
    elapsedSeconds: Math.round(elapsedMs / 1000),
  });
};

module.exports.QUESTIONS = QUESTIONS;
module.exports.SECTIONS = SECTIONS;