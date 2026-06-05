# PR Property Scout 🗺️

A single-page, **fully local** map app for scouting real-estate deals across
**all of Puerto Rico** — the main island plus Vieques and Culebra. No server,
no cloud — everything lives in your browser via `localStorage`.

## Features

- **Map (Leaflet)** opens framed on the whole island of Puerto Rico, with
  detailed street-level tiles everywhere (zoom in anywhere on the island).
- **Tap to drop a pin** — each pin opens a form to capture property details.
- **Per-property data:** address, deal status, notes, and up to **3 photos**.
- **Deal statuses** with distinct marker colors:
  - 🔵 Interested · 🟦 Contacted · 🟠 Offer Pending · 🟢 Under Contract · ⚪ Passed
- **Summary card** on pin click: address, status chip, notes, photo thumbnails
  (click a thumbnail for a full-screen lightbox), plus **Edit** / **Delete**.
- **Image compression** — photos are resized (max 1024px) and stored as
  JPEG base64 to keep the storage footprint small.
- **Searchable sidebar** listing every property by address / notes.
- **Export / Import** — download all properties as a JSON file, and import a
  JSON exported from another device to merge it in (union by id, no
  duplicates; the most recently edited copy wins). This is the simple,
  offline way to move data between devices.
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
