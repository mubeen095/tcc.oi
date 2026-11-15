/* ─────────────────────────────────────────────────────────────────────────
   tests/diagnostic.test.cjs

   The diagnostic is the site's main trust surface, so its scoring is tested
   rather than assumed. Runs with the built-in Node test runner:

     node --test tests/*.test.cjs
   ───────────────────────────────────────────────────────────────────────── */

const test = require('node:test');
const assert = require('node:assert');

const handler = require('../api/diagnostic.js');
const { QUESTIONS } = require('../api/diagnostic.js');

function call(method, body) {
  return new Promise((resolve, reject) => {
    const chunks = body ? [Buffer.from(JSON.stringify(body))] : [];
    const req = {
      method,
      headers: {},
      on(event, cb) {
        if (event === 'data') chunks.forEach((c) => cb(c));
        if (event === 'end') cb();
        if (event === 'error') cb(new Error('stream'));
      },
    };
    const res = {
      statusCode: 0,
      setHeader() {},
      end(payload) {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(payload) });
        } catch (e) {
          resolve({ status: res.statusCode, body: payload });
        }
      },
    };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}

test('GET returns the paper without the answer key', async () => {
  const res = await call('GET');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.questions.length, QUESTIONS.length);
  for (const q of res.body.questions) {
    assert.strictEqual(q.answer, undefined, `question ${q.id} leaked its answer`);
    assert.strictEqual(q.why, undefined, `question ${q.id} leaked its explanation`);
    assert.ok(Array.isArray(q.options) && q.options.length >= 2);
  }
});

test('a perfect paper scores full marks', async () => {
  const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.answer]));
  const res = await call('POST', { answers });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.score, QUESTIONS.length);
  assert.strictEqual(res.body.percent, 100);
  assert.strictEqual(res.body.review.length, 0);
  assert.strictEqual(res.body.band.key, 'ready');
});

test('an empty paper scores zero and explains every item', async () => {
  const res = await call('POST', { answers: {} });
  assert.strictEqual(res.body.score, 0);
  assert.strictEqual(res.body.percent, 0);
  assert.strictEqual(res.body.review.length, QUESTIONS.length);
  assert.strictEqual(res.body.band.key, 'start');
});

test('section totals add up to the paper', async () => {
  const res = await call('POST', { answers: {} });
  const total = res.body.sections.reduce((n, s) => n + s.total, 0);
  assert.strictEqual(total, QUESTIONS.length);
});

test('answers outside the option range are not counted as correct', async () => {
  const res = await call('POST', {
    answers: Object.fromEntries(QUESTIONS.map((q) => [q.id, 99])),
  });
  assert.strictEqual(res.body.score, 0);
  for (const item of res.body.review) assert.strictEqual(item.your, null);
});

test('one wrong answer produces exactly one review entry', async () => {
  const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.answer]));
  const first = QUESTIONS[0];
  answers[first.id] = (first.answer + 1) % first.options.length;
  const res = await call('POST', { answers });
  assert.strictEqual(res.body.score, QUESTIONS.length - 1);
  assert.strictEqual(res.body.review.length, 1);
  assert.strictEqual(res.body.review[0].id, first.id);
  assert.strictEqual(res.body.review[0].correct, first.options[first.answer]);
});

test('band boundaries are inclusive at the lower edge', async () => {
  const answersFor = (n) =>
    Object.fromEntries(
      QUESTIONS.map((q, i) => [q.id, i < n ? q.answer : (q.answer + 1) % q.options.length])
    );

  const thirteen = await call('POST', { answers: answersFor(13) });
  assert.strictEqual(thirteen.body.band.key, 'ready');

  const twelve = await call('POST', { answers: answersFor(12) });
  assert.strictEqual(twelve.body.band.key, 'close');

  const ten = await call('POST', { answers: answersFor(10) });
  assert.strictEqual(ten.body.band.key, 'close');

  const nine = await call('POST', { answers: answersFor(9) });
  assert.strictEqual(nine.body.band.key, 'foundation');

  const six = await call('POST', { answers: answersFor(6) });
  assert.strictEqual(six.body.band.key, 'foundation');

  const five = await call('POST', { answers: answersFor(5) });
  assert.strictEqual(five.body.band.key, 'start');
});

test('every question has a unique id and a valid answer index', () => {
  const ids = new Set();
  for (const q of QUESTIONS) {
    assert.ok(!ids.has(q.id), `duplicate id ${q.id}`);
    ids.add(q.id);
    assert.ok(Number.isInteger(q.answer));
    assert.ok(q.answer >= 0 && q.answer < q.options.length, `${q.id} answer index out of range`);
    assert.ok(q.why && q.why.length > 30, `${q.id} needs a real explanation`);
  }
});

test('rejects a non-POST/GET method', async () => {
  const res = await call('PUT');
  assert.strictEqual(res.status, 405);
});