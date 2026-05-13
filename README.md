# SiteForge Host

A small, self-hosted static site host — a personal mini Netlify. Single-user
login, drag-and-drop ZIP deploys, dark-mode dashboard, served entirely by a
single Node/Express process.

Designed to host static sites produced by the SiteForge desktop builder, but
it works for any folder of `.html` / `.css` / `.js`.

## Features

- Single-user session login (credentials live in `.env`, password bcrypt-hashed)
- Dashboard listing every site (URL, status, file count, last deploy)
- Deploy a site by uploading a ZIP — drag and drop or click
- Stop / start / restart / redeploy / delete each site
- Browse and edit individual files of a deployed site (upload to replace, delete to remove)
- Each site served at `http://localhost:<PORT>/s/<slug>/` (publicly reachable; only the dashboard is auth-gated)
- JSON metadata file — no database to run

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Generate a bcrypt hash for your admin password
npm run hash -- 'choose-a-strong-password'
#   -> prints:  ADMIN_PASSWORD_HASH=$2a$12$....

# 3. Create your .env
cp .env.example .env
#   edit:
#   PORT=3000
#   ADMIN_USERNAME=jay
#   ADMIN_PASSWORD_HASH=$2a$12$...   (paste from step 2)
#   SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")

# 4. Run it
npm start
```

Then open `http://localhost:3000/` and sign in.

## Folder layout

```
.
├── server.js          Express server (auth, deploy, file mgmt, static serving)
├── sites.json         metadata for deployed sites (created on first run)
├── sites/             extracted static sites live here  (gitignored)
├── uploads/           temporary ZIP storage             (gitignored)
├── public/            dashboard UI (HTML / CSS / JS)
│   ├── index.html
│   ├── login.html
│   ├── app.js
│   └── login.js
├── scripts/
│   └── hash-password.js   CLI helper to generate ADMIN_PASSWORD_HASH
├── Dockerfile
└── .env.example
```

## Hashing the admin password

```bash
npm run hash -- 'my-strong-password'
```

Copy the printed `ADMIN_PASSWORD_HASH=...` line into your `.env`. You can also
run the script with no argument and it will prompt for input.

## How sites are served

Every deployed site lives at `sites/<slug>/` and is served at
`http://<host>:<PORT>/s/<slug>/`. Unknown paths under a site fall back to the
site's `index.html`, so single-page apps work without extra config. Stopped
sites return HTTP 503 until restarted from the dashboard.

The dashboard and all `/api/*` management routes require login. The deployed
sites themselves do not — they're public, which is the whole point.

## API (for scripting deploys)

All management endpoints require an authenticated session cookie. Easiest way
to script them is to first POST to `/api/login` and reuse the cookie.

| Method | Path | Body | Notes |
| ------ | ---- | ---- | ----- |
| POST   | `/api/login` | `{ username, password }` (JSON) | Sets `siteforge.sid` cookie |
| POST   | `/api/logout` | - | |
| GET    | `/api/me` | - | Returns auth status |
| GET    | `/api/sites` | - | List all sites |
| GET    | `/api/sites/:id` | - | Single site |
| POST   | `/api/sites` | multipart: `zip`, `name`, `slug` | Deploy new site |
| POST   | `/api/sites/:id/redeploy` | multipart: `zip` | Replace existing files |
| POST   | `/api/sites/:id/stop` | - | Mark stopped (returns 503) |
| POST   | `/api/sites/:id/start` | - | Resume serving |
| POST   | `/api/sites/:id/restart` | - | Alias of start |
| DELETE | `/api/sites/:id` | - | Remove site and files |
| GET    | `/api/sites/:id/files` | - | File tree |
| POST   | `/api/sites/:id/files` | multipart: `file`, `path` | Add / replace file |
| DELETE | `/api/sites/:id/files?path=...` | - | Delete file or folder |

Example deploy from the command line:

```bash
# Log in (saves cookie jar)
curl -c cookies.txt -H 'content-type: application/json' \
  -d '{"username":"jay","password":"..."}' \
  http://localhost:3000/api/login

# Deploy
curl -b cookies.txt \
  -F 'name=My Portfolio' -F 'slug=portfolio' \
  -F 'zip=@./portfolio.zip' \
  http://localhost:3000/api/sites
```

## Docker (optional)

```bash
docker build -t siteforge-host .
docker run -d --name siteforge \
  -p 3000:3000 \
  -e ADMIN_USERNAME=jay \
  -e ADMIN_PASSWORD_HASH='$2a$12$...' \
  -e SESSION_SECRET='...' \
  -v $(pwd)/sites:/app/sites \
  -v $(pwd)/sites.json:/app/sites.json \
  siteforge-host
```

The `sites/` directory and `sites.json` are mounted as volumes so deployed
content survives container restarts.

## Security notes

- Passwords are bcrypt-hashed; the plaintext never reaches disk.
- All `/api/*` and `/` (dashboard) routes are session-gated.
- ZIP extraction validates each entry against path traversal (`..` and absolute
  paths are dropped).
- Slugs are restricted to `[a-z0-9-]` to keep them off-disk-and-URL-safe.
- Set `SECURE_COOKIES=true` if you put this behind HTTPS (e.g. via a reverse
  proxy like Caddy or nginx).
- Don't expose this directly to the internet without HTTPS in front of it.

## Configuration reference

| Env var | Default | Purpose |
| ------- | ------- | ------- |
| `PORT` | `3000` | HTTP port |
| `ADMIN_USERNAME` | _required_ | Login username |
| `ADMIN_PASSWORD_HASH` | _required_ | bcrypt hash of the admin password |
| `SESSION_SECRET` | random per-boot | Signs the session cookie |
| `SECURE_COOKIES` | `false` | Set `true` behind HTTPS |
| `MAX_UPLOAD_MB` | `500` | ZIP upload size limit |

## Development

There is no build step — Tailwind is loaded via CDN and the JS is plain ES
modules executed in the browser. Run `npm start` and reload.
