/*
 * SiteForge Host - self-hosted static site hosting (mini Netlify).
 * Single-user dashboard for deploying ZIP'd static sites and serving them
 * over the local network. All management routes require login; deployed
 * sites are publicly served at /s/<slug>/.
 */

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const AdmZip = require('adm-zip');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3000', 10);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const SECURE_COOKIES = String(process.env.SECURE_COOKIES || '').toLowerCase() === 'true';
const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || '500', 10);
const SESSION_SECRET = process.env.SESSION_SECRET
  || crypto.randomBytes(48).toString('hex'); // dev fallback; sessions reset on restart

const ROOT = __dirname;
const SITES_DIR = path.join(ROOT, 'sites');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
const PUBLIC_DIR = path.join(ROOT, 'public');
const METADATA_FILE = path.join(ROOT, 'sites.json');

for (const dir of [SITES_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
if (!fs.existsSync(METADATA_FILE)) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify({ sites: [] }, null, 2));
}

// ─── helpers ────────────────────────────────────────────────────────────────

function loadMetadata() {
  try {
    return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
  } catch {
    return { sites: [] };
  }
}

function saveMetadata(data) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2));
}

function isValidSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9][a-z0-9-]{0,62}$/.test(slug);
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(p);
    else count += 1;
  }
  return count;
}

function safeJoin(base, rel) {
  const resolvedBase = path.resolve(base);
  const target = path.resolve(resolvedBase, rel);
  if (target !== resolvedBase && !target.startsWith(resolvedBase + path.sep)) {
    return null;
  }
  return target;
}

function extractZip(zipPath, destDir) {
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  if (entries.length === 0) {
    throw new Error('ZIP is empty');
  }

  // If every entry sits under a single top-level folder, strip it so the
  // user gets /index.html at the root rather than /MySite/index.html.
  const topLevels = new Set();
  for (const e of entries) {
    const parts = e.entryName.split('/').filter(Boolean);
    if (parts.length > 0) topLevels.add(parts[0]);
  }
  let strip = null;
  if (topLevels.size === 1) {
    const only = [...topLevels][0];
    const allUnder = entries.every(
      e => e.entryName === only
        || e.entryName === only + '/'
        || e.entryName.startsWith(only + '/')
    );
    const hasIndexAtRoot = entries.some(
      e => !e.isDirectory && (e.entryName === 'index.html' || e.entryName === 'index.htm')
    );
    if (allUnder && !hasIndexAtRoot) strip = only;
  }

  const resolvedDest = path.resolve(destDir);
  let written = 0;
  for (const e of entries) {
    let rel = e.entryName.replace(/\\/g, '/');
    if (strip) {
      if (rel === strip || rel === strip + '/') continue;
      rel = rel.substring(strip.length + 1);
    }
    if (!rel) continue;
    if (rel.split('/').some(p => p === '..')) continue;

    const target = safeJoin(resolvedDest, rel);
    if (!target) continue;

    if (e.isDirectory) {
      fs.mkdirSync(target, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, e.getData());
      written += 1;
    }
  }

  if (written === 0) throw new Error('ZIP contained no usable files');
}

// ─── app setup ──────────────────────────────────────────────────────────────

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// JSON parser is intentionally NOT applied globally; multipart routes mount
// their own multer middleware and JSON routes opt in below.
const json = express.json({ limit: '1mb' });

app.use(session({
  name: 'siteforge.sid',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: SECURE_COOKIES,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.redirect('/login');
}

// ─── public: serve deployed sites ───────────────────────────────────────────

app.use('/s/:slug', (req, res, next) => {
  const { slug } = req.params;
  if (!isValidSlug(slug)) return res.status(404).send('Not found');
  const meta = loadMetadata();
  const site = meta.sites.find(s => s.slug === slug);
  if (!site) return res.status(404).send('Site not found');
  if (site.status !== 'active') {
    return res.status(503).send('This site is currently stopped.');
  }
  const dir = path.join(SITES_DIR, slug);
  return express.static(dir, {
    fallthrough: true,
    index: ['index.html', 'index.htm'],
    extensions: ['html'],
  })(req, res, next);
}, (req, res) => {
  // SPA-style fallback: if a single-page-app, serve its index.html for unknown paths.
  const { slug } = req.params;
  const indexFile = path.join(SITES_DIR, slug, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.status(404).send('Not found');
});

// ─── auth routes ────────────────────────────────────────────────────────────

app.get('/login', (req, res) => {
  if (req.session && req.session.user) return res.redirect('/');
  res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});

app.post('/api/login', json, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
    return res.status(500).json({
      error: 'Server not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH in .env.',
    });
  }
  // Constant-ish-time check: always run bcrypt so timing doesn't leak which
  // field was wrong.
  const usernameOk = username === ADMIN_USERNAME;
  const passwordOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!usernameOk || !passwordOk) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: 'Session error' });
    req.session.user = { username };
    res.json({ ok: true });
  });
});

app.post('/api/logout', json, (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => {
    res.clearCookie('siteforge.sid');
    res.json({ ok: true });
  });
});

app.get('/api/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  res.json({ authenticated: false });
});

// ─── multer (ZIP and single-file uploads) ───────────────────────────────────

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
});

function zipOnly(req, file, cb) {
  const ok =
    file.mimetype === 'application/zip' ||
    file.mimetype === 'application/x-zip-compressed' ||
    file.mimetype === 'application/octet-stream' ||
    file.originalname.toLowerCase().endsWith('.zip');
  cb(ok ? null : new Error('Only ZIP files are allowed'), ok);
}
const uploadZip = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: zipOnly,
});

// ─── sites API ──────────────────────────────────────────────────────────────

app.get('/api/sites', requireAuth, (req, res) => {
  const meta = loadMetadata();
  const sites = meta.sites.map(s => ({
    ...s,
    fileCount: countFiles(path.join(SITES_DIR, s.slug)),
    url: `/s/${s.slug}/`,
  }));
  res.json({ sites });
});

app.get('/api/sites/:id', requireAuth, (req, res) => {
  const meta = loadMetadata();
  const site = meta.sites.find(s => s.id === req.params.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });
  res.json({
    ...site,
    fileCount: countFiles(path.join(SITES_DIR, site.slug)),
    url: `/s/${site.slug}/`,
  });
});

app.post('/api/sites', requireAuth, uploadZip.single('zip'), (req, res) => {
  const zipPath = req.file && req.file.path;
  try {
    if (!zipPath) return res.status(400).json({ error: 'ZIP file required' });
    const name = String(req.body.name || '').trim();
    let slug = String(req.body.slug || '').trim().toLowerCase();
    if (!slug) slug = slugify(name);
    if (!isValidSlug(slug)) {
      return res.status(400).json({
        error: 'Invalid slug. Use lowercase letters, digits, and hyphens (max 63 chars).',
      });
    }

    const meta = loadMetadata();
    if (meta.sites.find(s => s.slug === slug)) {
      return res.status(409).json({ error: 'A site with that slug already exists' });
    }

    const destDir = path.join(SITES_DIR, slug);
    fs.mkdirSync(destDir, { recursive: true });
    try {
      extractZip(zipPath, destDir);
    } catch (err) {
      fs.rmSync(destDir, { recursive: true, force: true });
      throw err;
    }

    const now = new Date().toISOString();
    const site = {
      id: crypto.randomUUID(),
      slug,
      name: name || slug,
      status: 'active',
      createdAt: now,
      lastDeployed: now,
    };
    meta.sites.push(site);
    saveMetadata(meta);

    res.json({
      ok: true,
      site: {
        ...site,
        fileCount: countFiles(destDir),
        url: `/s/${slug}/`,
      },
    });
  } catch (err) {
    console.error('Deploy error:', err);
    res.status(400).json({ error: err.message || 'Deploy failed' });
  } finally {
    if (zipPath) { try { fs.unlinkSync(zipPath); } catch {} }
  }
});

app.post('/api/sites/:id/redeploy', requireAuth, uploadZip.single('zip'), (req, res) => {
  const zipPath = req.file && req.file.path;
  try {
    const meta = loadMetadata();
    const site = meta.sites.find(s => s.id === req.params.id);
    if (!site) return res.status(404).json({ error: 'Site not found' });
    if (!zipPath) return res.status(400).json({ error: 'ZIP file required' });

    const destDir = path.join(SITES_DIR, site.slug);
    fs.rmSync(destDir, { recursive: true, force: true });
    fs.mkdirSync(destDir, { recursive: true });
    extractZip(zipPath, destDir);

    site.lastDeployed = new Date().toISOString();
    saveMetadata(meta);

    res.json({
      ok: true,
      site: {
        ...site,
        fileCount: countFiles(destDir),
        url: `/s/${site.slug}/`,
      },
    });
  } catch (err) {
    console.error('Redeploy error:', err);
    res.status(400).json({ error: err.message || 'Redeploy failed' });
  } finally {
    if (zipPath) { try { fs.unlinkSync(zipPath); } catch {} }
  }
});

app.post('/api/sites/:id/stop', requireAuth, json, (req, res) => {
  const meta = loadMetadata();
  const site = meta.sites.find(s => s.id === req.params.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });
  site.status = 'stopped';
  saveMetadata(meta);
  res.json({ ok: true });
});

app.post('/api/sites/:id/start', requireAuth, json, (req, res) => {
  const meta = loadMetadata();
  const site = meta.sites.find(s => s.id === req.params.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });
  site.status = 'active';
  saveMetadata(meta);
  res.json({ ok: true });
});

app.post('/api/sites/:id/restart', requireAuth, json, (req, res) => {
  const meta = loadMetadata();
  const site = meta.sites.find(s => s.id === req.params.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });
  site.status = 'active';
  saveMetadata(meta);
  res.json({ ok: true });
});

app.delete('/api/sites/:id', requireAuth, (req, res) => {
  const meta = loadMetadata();
  const idx = meta.sites.findIndex(s => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Site not found' });
  const site = meta.sites[idx];
  fs.rmSync(path.join(SITES_DIR, site.slug), { recursive: true, force: true });
  meta.sites.splice(idx, 1);
  saveMetadata(meta);
  res.json({ ok: true });
});

// ─── file manager ───────────────────────────────────────────────────────────

function siteOr404(id, res) {
  const meta = loadMetadata();
  const site = meta.sites.find(s => s.id === id);
  if (!site) {
    res.status(404).json({ error: 'Site not found' });
    return null;
  }
  return { meta, site };
}

app.get('/api/sites/:id/files', requireAuth, (req, res) => {
  const ctx = siteOr404(req.params.id, res);
  if (!ctx) return;
  const base = path.join(SITES_DIR, ctx.site.slug);

  function tree(dir, rel = '') {
    const out = [];
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push({ type: 'dir', name: entry.name, path: childRel, children: tree(full, childRel) });
      } else {
        const stat = fs.statSync(full);
        out.push({ type: 'file', name: entry.name, path: childRel, size: stat.size });
      }
    }
    out.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return out;
  }

  res.json({ files: tree(base) });
});

app.delete('/api/sites/:id/files', requireAuth, (req, res) => {
  const ctx = siteOr404(req.params.id, res);
  if (!ctx) return;
  const rel = String(req.query.path || '');
  if (!rel) return res.status(400).json({ error: 'path query param required' });
  const base = path.join(SITES_DIR, ctx.site.slug);
  const target = safeJoin(base, rel);
  if (!target || target === path.resolve(base)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  if (!fs.existsSync(target)) return res.status(404).json({ error: 'File not found' });
  const stat = fs.statSync(target);
  if (stat.isDirectory()) fs.rmSync(target, { recursive: true, force: true });
  else fs.unlinkSync(target);
  res.json({ ok: true });
});

app.post('/api/sites/:id/files', requireAuth, upload.single('file'), (req, res) => {
  const tmp = req.file && req.file.path;
  try {
    const ctx = siteOr404(req.params.id, res);
    if (!ctx) return;
    if (!tmp) return res.status(400).json({ error: 'file field required' });
    const rel = String(req.body.path || req.file.originalname || '').trim();
    if (!rel) return res.status(400).json({ error: 'path required' });

    const base = path.join(SITES_DIR, ctx.site.slug);
    const target = safeJoin(base, rel);
    if (!target) return res.status(400).json({ error: 'Invalid path' });

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(tmp, target);

    ctx.site.lastDeployed = new Date().toISOString();
    saveMetadata(ctx.meta);
    res.json({ ok: true });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  } finally {
    if (tmp) { try { fs.unlinkSync(tmp); } catch {} }
  }
});

// ─── dashboard ──────────────────────────────────────────────────────────────

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.use('/static', express.static(PUBLIC_DIR, { index: false }));

// ─── multer error handler ───────────────────────────────────────────────────

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err && err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// ─── start ──────────────────────────────────────────────────────────────────

if (!process.env.SESSION_SECRET) {
  console.warn('[warn] SESSION_SECRET not set; using an ephemeral secret (sessions reset on restart).');
}
if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
  console.warn('[warn] ADMIN_USERNAME / ADMIN_PASSWORD_HASH not set; login will fail.');
  console.warn('       Generate a hash with:  npm run hash -- \'your-password\'');
}

app.listen(PORT, () => {
  console.log(`SiteForge Host listening on http://localhost:${PORT}`);
  console.log(`Dashboard:  http://localhost:${PORT}/`);
  console.log(`Sites are served at  http://localhost:${PORT}/s/<slug>/`);
});
