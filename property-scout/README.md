# PR Property Scout 🗺️

A single-page, **fully local** map app for scouting real-estate deals around
**Ponce, Puerto Rico** and the southern municipalities. No server, no cloud —
everything lives in your browser via `localStorage`.

## Features

- **Map (Leaflet)** centered on Ponce (`18.011, -66.614`), default zoom 13.
- **Tap to drop a pin** — each pin opens a form to capture property details.
- **Per-property data:** address, deal status, notes, and up to **3 photos**.
- **Deal statuses** with distinct marker colors:
  - 🔵 Interested · 🟦 Contacted · 🟠 Offer Pending · 🟢 Under Contract · ⚪ Passed
- **Summary card** on pin click: address, status chip, notes, photo thumbnails
  (click a thumbnail for a full-screen lightbox), plus **Edit** / **Delete**.
- **Image compression** — photos are resized (max 1024px) and stored as
  JPEG base64 to keep the storage footprint small.
- **Searchable sidebar** listing every property by address / notes.
- **Export** all properties to a JSON file for backup.
- **Optional Google Drive sync** — back up and sync pins across devices
  (see below). Fully offline-first; sync is additive.
- **Responsive & touch-friendly** — works on phones, tablets, and desktops.

## Running it

It's just static files. Open `index.html` directly, or serve the folder:

```bash
cd property-scout
python3 -m http.server 8080
# then visit http://localhost:8080
```

> Leaflet's CSS/JS load from the unpkg CDN, so the first load needs internet.
> Map tiles come from OpenStreetMap. Your saved data never leaves the browser.

## Data & backup

Records are stored under the `pr_property_scout_v1` localStorage key. Each
record includes coordinates, a timestamp, status, notes, and base64 image data.
Use the **Export** button regularly — clearing browser data wipes saved pins.

## Google Drive sync (optional)

The app works entirely offline. If you want your pins backed up and kept in
sync across devices (phone + laptop, etc.), connect Google Drive:

- Click **☁️ Connect Google Drive** at the bottom of the sidebar.
- Once connected, every pin you add/edit/delete is saved to a single file,
  **`ponce-properties.json`**, in your Drive's private *app data folder*
  (a hidden area only this app can see). Photos ride along as base64 inside
  that file, so there's nothing else to manage.
- A **status dot** sits in the bottom-right corner of the map:
  🟢 synced · 🟡 pending/offline · 🔴 error.
- **Sync now** forces an immediate upload; **Disconnect** stops syncing
  (your local pins stay put).
- **New device:** install/open the app there, click **Connect**, and it
  detects the existing `ponce-properties.json` and offers to import & merge
  it with whatever is on that device (no duplicates — newest edit wins).
- **Offline:** changes keep saving locally; the app uploads automatically
  once the connection returns.

### One-time setup: your Google OAuth Client ID

Because this is a server-less static app, it uses *your own* Google project
so the data goes to *your* Drive. You only do this once:

1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create (or pick) a project, then open **APIs & Services → Library** and
   enable the **Google Drive API**.
3. Configure the **OAuth consent screen** (External is fine; add your own
   Google account as a test user).
4. Back in **Credentials → Create credentials → OAuth client ID**, choose
   **Web application**.
5. Under **Authorized JavaScript origins**, add the exact address where you
   open the app, e.g. `https://yourdomain.com` (and `http://localhost:8080`
   if testing locally). No redirect URI is needed.
6. Copy the **Client ID** (looks like `…-….apps.googleusercontent.com`).
7. In the app, click **Connect Google Drive** and paste it when prompted.
   It's saved in your browser, so you only enter it once per device.

> The scope requested is `drive.appdata` — the narrowest Drive scope. The app
> can only see the single file it creates in its own hidden folder; it cannot
> read or touch any of your other Drive files. The access token is stored in
> `localStorage` and refreshed silently while you stay signed in.

To bake the Client ID into the build for all users (instead of pasting it),
set `HARDCODED_CLIENT_ID` near the top of `gdrive-sync.js`.
