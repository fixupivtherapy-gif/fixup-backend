# PR Property Scout 🗺️

A single-page, **installable** map app (PWA) for scouting real-estate deals
across **all of Puerto Rico** — the main island plus Vieques and Culebra.
No backend, no framework, no app store. Your data stays on your device.

## Features

- **Map (Leaflet + OpenStreetMap)** framed on the whole island, with the
  **78 municipios** drawn as labeled boundary overlays.
- **Tap the map to drop a pin** and capture a property: address, deal
  **status** (Interested / Contacted / Offer Pending / Under Contract /
  Passed — color-coded markers), notes, and up to **3 photos**
  (compressed client-side to ~1024px JPEG).
- **Searchable sidebar**, status legend, count badge, marker popups, and a
  full-screen photo lightbox.
- **Export / Import** all data as a JSON file — the simple, offline way to
  move data between devices.
- **Installable PWA**: add it to your home screen / desktop and launch it
  like a native app. **Works offline** (app shell + visited map areas +
  your saved data).
- **Durable storage**: data is kept in **IndexedDB** (more durable and
  larger than `localStorage`, which iOS evicts after ~7 days of non-use).
  Existing `localStorage` data is migrated automatically on first run.

## Run locally

It's a static site. Serve the folder over HTTP (the service worker needs a
server — it will **not** register on `file://`):

```bash
cd property-scout
python3 -m http.server 8080
# then open http://localhost:8080
```

> `localhost` counts as a secure context, so the PWA/service worker work
> there. The first load needs internet (Leaflet + map tiles come from CDNs).

## Deploy (Netlify — free, gives HTTPS)

No build step. Two easy options:

1. **Drag & drop:** go to **<https://app.netlify.com/drop>** and drop the
   whole `property-scout` folder. You get a live `https://…netlify.app` URL.
2. **From git:** connect the repo and set the publish directory to
   `property-scout`. No build command needed.

> **HTTPS is required** for the service worker (install + offline). Netlify
> provides HTTPS automatically. On plain `http://` (other than `localhost`)
> the app still runs, but it won't install or cache offline.

## Install on your devices

Open the hosted **https** URL, then:

### PC — Chrome / Edge
- Click the **install icon** (a monitor with a ⬇️) at the right end of the
  address bar, **or** use the **⬇️ Instalar** button in the app's top bar →
  **Install**. It opens in its own window and gets a desktop/Start-menu icon.

### Android — Chrome
- Tap the **⬇️ Instalar** button in the top bar (or the browser's
  **⋮ → Install app / Add to Home screen**). Confirm. The JD icon lands on
  your home screen.

### iPhone / iPad — Safari
- Safari doesn't show an install button, so the app shows a one-time hint.
  Tap **Compartir ⬆️** (the share icon) → scroll to **Añadir a pantalla de
  inicio** (Add to Home Screen) → **Añadir**. Launch it from the new icon —
  it runs full-screen with no Safari chrome.

## Moving your pins to another device

Each device keeps its own data. To copy what you already have:

1. On device A → **Export** (downloads a `.json`).
2. Send it to device B (AirDrop between Apple devices is easiest).
3. On device B → **Import** → pick that `.json`. It merges without
   duplicates (newest edit wins).

## Offline behavior

Once installed (and after the first online load), the app opens with no
connection. Map areas you've already viewed stay visible (tiles are cached,
capped at ~300 to bound storage); panning to brand-new areas while offline
shows a subtle **"Sin conexión — viendo solo áreas guardadas"** hint until
you're back online. All adding/editing keeps working offline and persists
locally.

## Files

| File | Purpose |
|------|---------|
| `index.html`, `app.js`, `styles.css` | The app |
| `manifest.json` | PWA metadata (name, icons, colors, display) |
| `service-worker.js` | Offline caching (app shell + map tiles) |
| `icons/` | App icons (192, 512, and 512 maskable) |
| `PR-Property-Scout.html` | Optional **single-file** build (no install / no offline — for hosts that only accept one HTML file) |

## Privacy

Single user, no accounts, no analytics, no backend. Everything lives in your
browser. Use **Export** regularly as a manual backup — uninstalling the app
or clearing site data erases the local store.
