const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const worksim = require('./worksim-store');

const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  /* ── machine-readable facts for AI assistants / crawlers ── */
  '.txt': 'text/plain; charset=utf-8',
  '.jsonl': 'application/jsonl; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const COMPRESSABLE = new Set(['.html', '.js', '.css', '.json', '.jsonl', '.xml', '.svg', '.txt', '.md']);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Access-Control-Allow-Origin': '*',
};

/* ── Permanent redirects (kept in sync with vercel.json) ──
   Keys are paths without a trailing slash. Legacy brand routes and the old
   "Moved" stubs both land here so local dev matches production. */
const REDIRECTS = new Map([
  ['/vybeclub', '/100-club/'],
  ['/vybing', '/100-club/app/'],
  ['/architecture', '/domains/architecture/'],
  ['/bba', '/domains/bba/'],
  ['/biotech', '/domains/biotech/'],
  ['/civil', '/domains/civil/'],
  ['/commerce', '/domains/commerce/'],
  ['/cse', '/domains/cse/'],
  ['/data-science', '/domains/data-science/'],
  ['/design', '/domains/design/'],
  ['/ece', '/domains/ece/'],
  ['/eee', '/domains/eee/'],
  ['/it', '/domains/it/'],
  ['/mba', '/domains/mba/'],
  ['/mechanical', '/domains/mechanical/'],
  ['/learn/1-on-1', '/bootcamps/'],
  ['/learn/custom-course', '/bootcamps/'],
  ['/spa.html', '/'],
]);

/* ── Local dev mock API (replaced by real Vercel functions in prod) ── */
const MOCK = { members: [], sessions: {}, submissions: [], otps: {}, nextId: 1 };
const crypto = require('crypto');

function mockJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
  res.end(JSON.stringify(body));
}

/* WorkSim payloads are large and read-only: gzip them when the client allows it. */
function worksimJson(req, res, status, body) {
  const json = JSON.stringify(body);
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    ...SECURITY_HEADERS,
  };

  if ((req.headers['accept-encoding'] || '').includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(status, headers);
    res.end(zlib.gzipSync(json));
    return;
  }

  res.writeHead(status, headers);
  res.end(json);
}

function mockPromote(m) {
  if (process.env.MOCK_ADMIN_EMAIL && m.email === String(process.env.MOCK_ADMIN_EMAIL).toLowerCase()) m.role = 'admin';
  return m;
}

function mockBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); } });
  });
}

function mockPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return '+91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return '+91' + digits.slice(2);
  return null;
}

function mockSessionToken(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/(?:^|;\s*)tcc_session=([^;]+)/);
  return m ? m[1] : null;
}

function mockCurrentMember(req) {
  const token = mockSessionToken(req);
  if (!token || !MOCK.sessions[token]) return null;
  const m = MOCK.sessions[token];
  return { id: m.id, name: m.name, email: m.email, role: m.role };
}

const PASS = (pass, salt) => crypto.scryptSync(String(pass), salt, 64).toString('hex');

async function serveMockApi(req, res, url) {
  const route = url.split('?')[0].replace('/api/', '');
  const method = req.method;
  const setCookie = (token) => res.setHeader('Set-Cookie', `tcc_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);

  /* The diagnostic handler needs no database, so local dev runs the real
     code path instead of a mock. Same questions, same scoring. */
  if (route === 'diagnostic') {
    try {
      return require('./api/diagnostic')(req, res);
    } catch (err) {
      return mockJson(res, 500, { error: 'Diagnostic unavailable' });
    }
  }

  if (route === 'register' && method === 'POST') {
    const b = await mockBody(req);
    const email = String(b.email || '').trim().toLowerCase();
    if (MOCK.members.some((m) => m.email === email)) return mockJson(res, 409, { error: 'An account with that email already exists' });
    const member = { id: MOCK.nextId++, name: b.name, email, passkey_hash: PASS(b.passkey, 'mock'), role: 'member', created_at: new Date() };
    MOCK.members.push(mockPromote(member));
    const token = crypto.randomBytes(16).toString('hex');
    MOCK.sessions[token] = member;
    setCookie(token);
    return mockJson(res, 201, { member: { id: member.id, name: member.name, email: member.email, role: member.role } });
  }

  if (route === 'login' && method === 'POST') {
    const b = await mockBody(req);
    const email = String(b.email || '').trim().toLowerCase();
    const m = MOCK.members.find((x) => x.email === email && x.passkey_hash === PASS(b.passkey, 'mock'));
    if (!m) return mockJson(res, 401, { error: 'Invalid email or passkey' });
    const token = crypto.randomBytes(16).toString('hex');
    MOCK.sessions[token] = mockPromote(m);
    setCookie(token);
    return mockJson(res, 200, { member: { id: m.id, name: m.name, email: m.email, role: m.role } });
  }

  if (route === 'logout' && method === 'POST') {
    const token = mockSessionToken(req);
    if (token) delete MOCK.sessions[token];
    res.setHeader('Set-Cookie', 'tcc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    return mockJson(res, 200, { ok: true });
  }

  if (route === 'me' && method === 'GET') {
    const m = mockCurrentMember(req);
    return m ? mockJson(res, 200, { member: m }) : mockJson(res, 401, { error: 'Not signed in' });
  }

  if (route === 'otp/send' && method === 'POST') {
    const b = await mockBody(req);
    const phone = mockPhone(b.phone);
    if (!phone) return mockJson(res, 400, { error: 'Enter a valid 10-digit Indian mobile number.' });
    const now = Date.now();
    const previous = Object.values(MOCK.otps).find((c) => c.phone === phone && now - c.created < 30000);
    if (previous) return mockJson(res, 429, { error: 'Wait a few seconds before requesting another code.' });
    const id = crypto.randomUUID();
    const code = String(crypto.randomInt(100000, 1000000));
    MOCK.otps[id] = { phone, code, attempts: 0, verified: false, created: now, expires: now + 300000 };
    return mockJson(res, 201, { challengeId: id, expiresIn: 300, resendIn: 30, devCode: code });
  }

  if (route === 'otp/verify' && method === 'POST') {
    const b = await mockBody(req);
    const c = MOCK.otps[String(b.challengeId || b.challenge_id || '')];
    if (!c) return mockJson(res, 400, { error: 'That code has expired. Send a new one.' });
    if (c.verified) return mockJson(res, 200, { ok: true });
    if (Date.now() > c.expires) return mockJson(res, 410, { error: 'That code has expired. Send a new one.' });
    if (c.attempts >= 5) return mockJson(res, 429, { error: 'Too many attempts. Send a new code.' });
    if (String(b.code || '').replace(/\D/g, '') !== c.code) {
      c.attempts += 1;
      return mockJson(res, 400, { error: 'That code is incorrect. Check and try again.' });
    }
    c.verified = true;
    return mockJson(res, 200, { ok: true });
  }

  if (route === 'forms' && method === 'POST') {
    const b = await mockBody(req);
    const formType = b.form_type || b.source || 'contact';
    if (formType === 'prep-plus-lead') {
      const c = MOCK.otps[String(b.challenge_id || '')];
      const phone = String(b.verified_phone || b.phone || '');
      if (!c || !c.verified || c.phone !== phone) return mockJson(res, 403, { error: 'Phone not verified' });
    }
    if (formType === 'exam-lead') {
      const missing = ['name', 'email', 'phone', 'college', 'study_year'].filter(
        (k) => !String(b[k] || '').trim()
      );
      if (missing.length) return mockJson(res, 400, { error: `Missing: ${missing.join(', ')}` });
    }
    const row = { id: MOCK.nextId++, form_type: formType, email: b.email || null, payload: b, created_at: new Date() };
    MOCK.submissions.push(row);
    return mockJson(res, 201, { id: row.id, ok: true });
  }

  if (route === 'exam-score' && method === 'POST') {
    const b = await mockBody(req);
    const lead = MOCK.submissions.find((s) => s.id === Number(b.lead_id) && s.form_type === 'exam-lead');
    if (!lead) return mockJson(res, 403, { error: 'Unknown lead' });
    const attempt = Math.max(1, Math.trunc(Number(b.attempt) || 1));
    const existing = MOCK.submissions.find(
      (s) => s.form_type === 'exam-score' && Number(s.payload.lead_id) === Number(b.lead_id) && Number(s.payload.attempt) === attempt
    );
    if (existing) {
      existing.payload = { ...b, submitted_at: new Date().toISOString() };
      return mockJson(res, 200, { ok: true, id: existing.id, sheet: 'skipped' });
    }
    const row = {
      id: MOCK.nextId++,
      form_type: 'exam-score',
      email: lead.email || null,
      payload: { ...b, submitted_at: new Date().toISOString() },
      created_at: new Date(),
    };
    MOCK.submissions.push(row);
    return mockJson(res, 200, { ok: true, id: row.id, sheet: 'skipped' });
  }

  /* WorkSim — read-only catalogue, served from the server-side store */
  if (route === 'worksim/manifest' && method === 'GET') {
    return worksimJson(req, res, 200, worksim.manifest());
  }

  if (route.startsWith('worksim/pack/') && method === 'GET') {
    const id = route.slice('worksim/pack/'.length);
    const pack = worksim.pack(id);
    if (!pack) return worksimJson(req, res, 404, { error: 'Unknown shift' });
    return worksimJson(req, res, 200, pack);
  }

  if (route === 'admin' && method === 'GET') {
    const m = mockCurrentMember(req);
    if (!m) return mockJson(res, 401, { error: 'Not signed in' });
    if (m.role !== 'admin') return mockJson(res, 403, { error: 'Admin only' });
    const scope = new URL('http://x' + url).searchParams.get('scope') || 'submissions';
    if (scope === 'members') return mockJson(res, 200, { members: MOCK.members.map(({ id, name, email, role, created_at }) => ({ id, name, email, role, created_at })) });
    return mockJson(res, 200, { submissions: MOCK.submissions.map(({ id, form_type, email, payload, created_at }) => ({ id, form_type, email, payload, created_at })) });
  }

  return mockJson(res, 404, { error: 'Not found' });
}

function serveFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const acceptEncoding = (res.req.headers['accept-encoding'] || '');
  const useGzip = COMPRESSABLE.has(ext) && acceptEncoding.includes('gzip');

  const headers = {
    'Content-Type': contentType,
    'Vary': 'Accept-Encoding',
    ...SECURITY_HEADERS,
  };
  /* HTML revalidates every load. Only fingerprinted assets (name-<hash>.ext)
   * may be cached immutably — unversioned CSS/JS must revalidate, otherwise a
   * font or layout fix never reaches anyone who already loaded the site. */
  const fingerprinted = /-[0-9a-f]{8,}\.[a-z0-9]+$/i.test(filePath);
  if (ext === '.html') headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
  else if (filePath.includes(`${path.sep}assets${path.sep}`) && fingerprinted) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  else if (['.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.mp3'].includes(ext)) headers['Cache-Control'] = 'no-cache';
  if (useGzip) headers['Content-Encoding'] = 'gzip';

  res.writeHead(statusCode, headers);

  if (res.req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.destroy();
  });

  if (useGzip) {
    stream.pipe(zlib.createGzip()).pipe(res);
  } else {
    stream.pipe(res);
  }
}

function serve404(res) {
  const fallback = path.join(PUBLIC, '404.html');
  if (fs.existsSync(fallback)) {
    const ext = path.extname(fallback).toLowerCase();
    const contentType = MIME[ext] || 'text/html; charset=utf-8';
    res.writeHead(404, {
      'Content-Type': contentType,
      ...SECURITY_HEADERS,
    });
    fs.createReadStream(fallback).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS });
    res.end('<h1>404 Not Found</h1>');
  }
}

const server = http.createServer((req, res) => {
  res.req = req;

  let url;
  try {
    url = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400, SECURITY_HEADERS);
    res.end('Bad request');
    return;
  }

  if (url.startsWith('/api/')) {
    serveMockApi(req, res, req.url);
    return;
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { 'Allow': 'GET, HEAD', ...SECURITY_HEADERS });
    res.end('Method not allowed');
    return;
  }

  /* Permanent redirects for retired routes (see REDIRECTS above). */
  const redirectTo = REDIRECTS.get(url.replace(/\/+$/, '') || '/');
  if (redirectTo) {
    res.writeHead(301, { Location: redirectTo, ...SECURITY_HEADERS });
    res.end();
    return;
  }

  if (url.includes('\0')) {
    res.writeHead(400, SECURITY_HEADERS);
    res.end('Bad request');
    return;
  }

  const resolved = path.resolve(PUBLIC, `.${url.endsWith('/') ? url + 'index.html' : url}`);

  const isDirectory = fs.existsSync(resolved) && fs.statSync(resolved).isDirectory();
  const filePath = isDirectory ? path.join(resolved, 'index.html') : resolved;

  if (!filePath.startsWith(`${PUBLIC}${path.sep}`)) {
    serve404(res);
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(res, filePath, 200);
  } else {
    serve404(res);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
