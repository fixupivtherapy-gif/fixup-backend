/* ─────────────────────────────────────────────────────────────
   PR Property Scout — Leaflet + localStorage, no backend.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  // ── Config ──────────────────────────────────────────────────
  const PONCE = [18.011, -66.614];
  const DEFAULT_ZOOM = 13;
  const STORAGE_KEY = "pr_property_scout_v1";
  const MAX_IMAGES = 3;
  const IMG_MAX_DIM = 1024;   // px — longest edge after compression
  const IMG_QUALITY = 0.7;    // JPEG quality

  const STATUSES = [
    { name: "Interested",     color: "#2563eb" },
    { name: "Contacted",      color: "#0e7490" },
    { name: "Offer Pending",  color: "#d97706" },
    { name: "Under Contract", color: "#16a34a" },
    { name: "Passed",         color: "#6b7280" },
  ];
  const colorFor = (status) =>
    (STATUSES.find((s) => s.name === status) || STATUSES[0]).color;

  // ── State ───────────────────────────────────────────────────
  const _state = load();
  /** @type {Array<Object>} */
  let properties = _state.properties;
  /** @type {Array<{id:string, deletedAt:string}>} — deletion markers so
      removals propagate across devices instead of resurrecting on merge. */
  let tombstones = _state.tombstones;
  const markers = new Map();   // id -> L.marker
  let pendingImages = [];       // base64 strings while editing
  let searchTerm = "";

  // ── DOM refs ────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const els = {
    sidebar: $("sidebar"),
    toggleSidebar: $("toggleSidebar"),
    list: $("propertyList"),
    empty: $("emptyState"),
    search: $("searchInput"),
    legend: $("legend"),
    countBadge: $("countBadge"),
    exportBtn: $("exportBtn"),
    mapHint: $("mapHint"),
    // modal
    overlay: $("modalOverlay"),
    modalTitle: $("modalTitle"),
    modalClose: $("modalClose"),
    form: $("propertyForm"),
    fId: $("fId"), fLat: $("fLat"), fLng: $("fLng"),
    fAddress: $("fAddress"), fStatus: $("fStatus"), fNotes: $("fNotes"),
    fImages: $("fImages"), imagePreview: $("imagePreview"), uploadLabel: $("uploadLabel"),
    deleteBtn: $("deleteBtn"), cancelBtn: $("cancelBtn"),
    // lightbox
    lightbox: $("lightbox"), lightboxImg: $("lightboxImg"),
    // google drive sync
    connectDriveBtn: $("connectDriveBtn"),
    syncConnected: $("syncConnected"),
    syncNowBtn: $("syncNowBtn"),
    disconnectDriveBtn: $("disconnectDriveBtn"),
    syncStatus: $("syncStatus"), syncDot: $("syncDot"), syncLabel: $("syncLabel"),
    // setup modal
    setupOverlay: $("setupOverlay"), setupClose: $("setupClose"),
    setupCancel: $("setupCancel"), setupSave: $("setupSave"), clientIdInput: $("clientIdInput"),
  };

  // ── Storage ─────────────────────────────────────────────────
  // Normalize any stored/remote shape into { properties, tombstones }.
  // Accepts the legacy bare-array format for backward compatibility.
  function normalizeState(raw) {
    if (Array.isArray(raw)) return { properties: raw, tombstones: [] };
    if (raw && typeof raw === "object") {
      return {
        properties: Array.isArray(raw.properties) ? raw.properties : [],
        tombstones: Array.isArray(raw.tombstones) ? raw.tombstones : [],
      };
    }
    return { properties: [], tombstones: [] };
  }
  function load() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch (e) {
      console.warn("Could not parse stored properties:", e);
      return { properties: [], tombstones: [] };
    }
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ properties, tombstones }));
    } catch (e) {
      alert(
        "Storage limit reached. Try removing some photos or older properties.\n\n" + e.message
      );
    }
    // Back up to Google Drive when connected (debounced, offline-safe).
    if (window.GDriveSync) GDriveSync.queueSync();
  }

  // ── Map setup ───────────────────────────────────────────────
  const map = L.map("map", { zoomControl: true }).setView(PONCE, DEFAULT_ZOOM);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  map.on("click", (e) => openForm(null, e.latlng.lat, e.latlng.lng));

  function pinIcon(status) {
    return L.divIcon({
      className: "",
      html: `<div class="pin" style="background:${colorFor(status)}"></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
    });
  }

  function addMarker(p) {
    const m = L.marker([p.lat, p.lng], { icon: pinIcon(p.status) }).addTo(map);
    m.bindPopup(() => cardHtml(p), { minWidth: 240, closeButton: true });
    m.on("popupopen", () => wireCard(p));
    markers.set(p.id, m);
    return m;
  }

  function refreshMarker(p) {
    const m = markers.get(p.id);
    if (m) {
      m.setIcon(pinIcon(p.status));
      m.setLatLng([p.lat, p.lng]);
    } else {
      addMarker(p);
    }
  }

  // ── Summary card (popup) ────────────────────────────────────
  function cardHtml(p) {
    const thumbs = (p.images || [])
      .map((src, i) => `<img src="${src}" data-i="${i}" alt="Photo ${i + 1}">`)
      .join("");
    return `
      <div class="card" data-id="${p.id}">
        <div class="card-head">
          <div class="card-addr">${escapeHtml(p.address) || "Untitled property"}</div>
          <span class="status-chip card-status" style="background:${colorFor(p.status)}">${p.status}</span>
        </div>
        ${p.notes ? `<div class="card-notes">${escapeHtml(p.notes)}</div>` : ""}
        ${thumbs ? `<div class="card-thumbs">${thumbs}</div>` : ""}
        <div class="card-actions">
          <button class="btn btn-ghost" data-act="edit">Edit</button>
          <button class="btn btn-danger" data-act="delete">Delete</button>
        </div>
      </div>`;
  }

  function wireCard(p) {
    const root = document.querySelector(`.card[data-id="${p.id}"]`);
    if (!root) return;
    root.querySelector('[data-act="edit"]').onclick = () =>
      openForm(p.id, p.lat, p.lng);
    root.querySelector('[data-act="delete"]').onclick = () => removeProperty(p.id);
    root.querySelectorAll(".card-thumbs img").forEach((img) => {
      img.onclick = () => openLightbox(img.src);
    });
  }

  // ── Form / modal ────────────────────────────────────────────
  function openForm(id, lat, lng) {
    const editing = !!id;
    const p = editing ? properties.find((x) => x.id === id) : null;

    els.modalTitle.textContent = editing ? "Edit property" : "New property";
    els.fId.value = id || "";
    els.fLat.value = (p ? p.lat : lat);
    els.fLng.value = (p ? p.lng : lng);
    els.fAddress.value = p ? p.address : "";
    els.fStatus.value = p ? p.status : "Interested";
    els.fNotes.value = p ? p.notes : "";
    pendingImages = p ? [...(p.images || [])] : [];
    els.deleteBtn.hidden = !editing;

    renderImagePreview();
    els.overlay.hidden = false;
    setTimeout(() => els.fAddress.focus(), 50);
  }

  function closeForm() {
    els.overlay.hidden = true;
    els.form.reset();
    pendingImages = [];
  }

  function renderImagePreview() {
    els.imagePreview.innerHTML = pendingImages
      .map(
        (src, i) => `
        <div class="thumb">
          <img src="${src}" alt="Photo ${i + 1}">
          <button type="button" class="rm" data-i="${i}" aria-label="Remove">&times;</button>
        </div>`
      )
      .join("");
    els.imagePreview.querySelectorAll(".rm").forEach((btn) => {
      btn.onclick = () => {
        pendingImages.splice(Number(btn.dataset.i), 1);
        renderImagePreview();
      };
    });
    const full = pendingImages.length >= MAX_IMAGES;
    els.uploadLabel.classList.toggle("disabled", full);
    els.uploadLabel.querySelector("span").textContent = full
      ? `Max ${MAX_IMAGES} photos`
      : `+ Add photos`;
  }

  els.fImages.addEventListener("change", async (e) => {
    const files = [...e.target.files];
    for (const file of files) {
      if (pendingImages.length >= MAX_IMAGES) break;
      try {
        pendingImages.push(await compressImage(file));
        renderImagePreview();
      } catch (err) {
        console.warn("Image processing failed:", err);
      }
    }
    e.target.value = ""; // allow re-selecting same file
  });

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = els.fId.value || cryptoId();
    const existing = properties.find((x) => x.id === id);
    const record = {
      id,
      lat: parseFloat(els.fLat.value),
      lng: parseFloat(els.fLng.value),
      address: els.fAddress.value.trim(),
      status: els.fStatus.value,
      notes: els.fNotes.value.trim(),
      images: pendingImages,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      Object.assign(existing, record);
    } else {
      properties.push(record);
    }
    save();
    refreshMarker(record);
    renderList();
    closeForm();
    markers.get(id)?.openPopup();
  });

  function removeProperty(id) {
    if (!confirm("Delete this property and its photos?")) return;
    properties = properties.filter((p) => p.id !== id);
    recordTombstone(id);
    const m = markers.get(id);
    if (m) { map.removeLayer(m); markers.delete(id); }
    save();
    renderList();
    closeForm();
  }

  // Mark an id as deleted so other devices remove it too (instead of
  // re-adding it on the next merge).
  function recordTombstone(id) {
    const now = new Date().toISOString();
    const ex = tombstones.find((t) => t.id === id);
    if (ex) ex.deletedAt = now;
    else tombstones.push({ id, deletedAt: now });
  }

  // ── Sidebar list ────────────────────────────────────────────
  function renderList() {
    els.countBadge.textContent = properties.length;
    els.mapHint.style.display = properties.length ? "none" : "block";
    const term = searchTerm.toLowerCase();
    const visible = properties
      .filter(
        (p) =>
          !term ||
          (p.address || "").toLowerCase().includes(term) ||
          (p.notes || "").toLowerCase().includes(term)
      )
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

    els.empty.hidden = properties.length !== 0;
    if (properties.length && !visible.length) {
      els.empty.hidden = false;
      els.empty.textContent = "No matches.";
    } else if (properties.length) {
      els.empty.textContent = "Tap anywhere on the map to drop your first pin.";
    }

    els.list.innerHTML = visible
      .map((p) => {
        const thumb = (p.images && p.images[0])
          ? `<img class="pl-thumb" src="${p.images[0]}" alt="">`
          : `<div class="pl-thumb placeholder">🏠</div>`;
        return `
        <li data-id="${p.id}">
          ${thumb}
          <div class="pl-body">
            <div class="pl-addr">${escapeHtml(p.address) || "Untitled property"}</div>
            <div class="pl-meta">
              <span class="status-chip" style="background:${colorFor(p.status)}">${p.status}</span>
              ${p.images && p.images.length ? `<span>📷 ${p.images.length}</span>` : ""}
            </div>
          </div>
        </li>`;
      })
      .join("");

    els.list.querySelectorAll("li").forEach((li) => {
      li.onclick = () => focusProperty(li.dataset.id);
    });
  }

  function focusProperty(id) {
    const p = properties.find((x) => x.id === id);
    if (!p) return;
    map.setView([p.lat, p.lng], Math.max(map.getZoom(), 15), { animate: true });
    markers.get(id)?.openPopup();
    if (isMobile()) els.sidebar.classList.remove("open"); // close overlay
  }

  function renderLegend() {
    els.legend.innerHTML = STATUSES.map(
      (s) =>
        `<span class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.name}</span>`
    ).join("");
  }

  // ── Export ──────────────────────────────────────────────────
  els.exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(properties, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pr-property-scout-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // ── Lightbox ────────────────────────────────────────────────
  function openLightbox(src) {
    els.lightboxImg.src = src;
    els.lightbox.hidden = false;
  }
  els.lightbox.addEventListener("click", () => (els.lightbox.hidden = true));

  // ── Image compression (canvas → JPEG base64) ────────────────
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > IMG_MAX_DIM) {
            height = Math.round((height * IMG_MAX_DIM) / width);
            width = IMG_MAX_DIM;
          } else if (height > IMG_MAX_DIM) {
            width = Math.round((width * IMG_MAX_DIM) / height);
            height = IMG_MAX_DIM;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", IMG_QUALITY));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ── Helpers ─────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
  function cryptoId() {
    return (crypto.randomUUID && crypto.randomUUID()) ||
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ── Wire static controls ────────────────────────────────────
  els.modalClose.onclick = closeForm;
  els.cancelBtn.onclick = closeForm;
  els.deleteBtn.onclick = () => els.fId.value && removeProperty(els.fId.value);
  els.overlay.addEventListener("click", (e) => {
    if (e.target === els.overlay) closeForm();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!els.lightbox.hidden) els.lightbox.hidden = true;
      else if (!els.overlay.hidden) closeForm();
    }
  });
  els.toggleSidebar.onclick = () => {
    if (isMobile()) {
      els.sidebar.classList.toggle("open");   // slides over the map
    } else {
      els.sidebar.classList.toggle("collapsed");
    }
    // map width may change on desktop; let Leaflet re-measure
    setTimeout(() => map.invalidateSize(), 260);
  };
  els.search.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderList();
  });

  // ── Google Drive sync ───────────────────────────────────────
  // Redraw every marker + the list after data changes wholesale
  // (e.g. an import/merge from Drive).
  function rebuildAll() {
    markers.forEach((m) => map.removeLayer(m));
    markers.clear();
    properties.forEach(addMarker);
    renderList();
  }

  // How long to keep tombstones before pruning (days). Long enough for
  // every device to have synced and dropped the deleted record.
  const TOMBSTONE_TTL_DAYS = 180;

  // Merge two { properties, tombstones } states. Union by id with
  // newest-wins on properties; deletions (tombstones) and edits race by
  // timestamp, so a delete on one device removes the pin everywhere,
  // while an edit made *after* a delete resurrects it.
  // Returns the merged state plus { added, updated, removed } vs `local`.
  function mergeState(local, remote) {
    // 1. Union tombstones — newest deletedAt wins.
    const tomb = new Map();
    const addTomb = (t) => {
      if (!t || !t.id) return;
      const ex = tomb.get(t.id);
      if (!ex || (t.deletedAt || "") > (ex.deletedAt || "")) {
        tomb.set(t.id, { id: t.id, deletedAt: t.deletedAt || "" });
      }
    };
    local.tombstones.forEach(addTomb);
    remote.tombstones.forEach(addTomb);

    // 2. Union properties — newest updatedAt wins.
    const localById = new Map(local.properties.map((p) => [p.id, p]));
    const props = new Map(localById);
    remote.properties.forEach((r) => {
      if (!r || !r.id) return;
      const ex = props.get(r.id);
      if (!ex || (r.updatedAt || "") > (ex.updatedAt || "")) props.set(r.id, r);
    });

    // 3. Apply tombstones. A pin edited after its deletion is resurrected
    //    (and its tombstone dropped); otherwise the pin is removed.
    tomb.forEach((t, id) => {
      const p = props.get(id);
      if (p && (p.updatedAt || "") > (t.deletedAt || "")) tomb.delete(id);
      else if (p) props.delete(id);
    });

    // 4. Prune tombstones older than the TTL to bound file growth.
    const cutoff = new Date(Date.now() - TOMBSTONE_TTL_DAYS * 864e5).toISOString();
    const tombstonesOut = [...tomb.values()].filter((t) => (t.deletedAt || "") >= cutoff);

    // 5. Tally changes relative to the local state, for the prompt.
    let added = 0, updated = 0, removed = 0;
    props.forEach((p, id) => {
      if (!localById.has(id)) added++;
      else if (p !== localById.get(id)) updated++;
    });
    localById.forEach((_, id) => { if (!props.has(id)) removed++; });

    return { properties: [...props.values()], tombstones: tombstonesOut, added, updated, removed };
  }

  function updateSyncUI() {
    const connected = !!(window.GDriveSync && GDriveSync.isConnected());
    els.connectDriveBtn.hidden = connected;
    els.syncConnected.hidden = !connected;
  }

  // Status indicator: green = synced, yellow = pending, red = error.
  function onSyncStatus(state, detail) {
    const states = {
      synced:       { dot: "synced",  text: detail || "Synced" },
      pending:      { dot: "pending", text: detail || "Syncing…" },
      error:        { dot: "error",   text: detail || "Sync error" },
      disconnected: { dot: "",        text: "" },
    };
    const view = states[state] || states.disconnected;
    els.syncStatus.hidden = state === "disconnected";
    els.syncDot.className = "sync-dot " + view.dot;
    els.syncLabel.textContent = view.text;
    updateSyncUI();
  }

  // Pull remote data, offer to merge it in, then push the result back
  // so Drive holds the union. promptUser=false runs silently on resume.
  async function pullMergePush(promptUser) {
    let remoteRaw = null;
    try {
      remoteRaw = await GDriveSync.pull();
    } catch (e) {
      onSyncStatus("error", "Couldn't read Drive");
      return;
    }
    const remote = normalizeState(remoteRaw);
    if (remote.properties.length || remote.tombstones.length) {
      const result = mergeState({ properties, tombstones }, remote);
      const changes = result.added + result.updated + result.removed;
      const go = !promptUser || changes === 0 ||
        confirm(
          "Google Drive has changes from another device.\n" +
          `Import ${result.added} new, update ${result.updated}, ` +
          `and remove ${result.removed} deleted elsewhere?`
        );
      if (go && changes > 0) {
        properties = result.properties;
        tombstones = result.tombstones;
        save();           // persists locally + queues an upload
        rebuildAll();
      }
    }
    GDriveSync.syncNow();  // make sure Drive has the merged/local set
  }

  async function handleConnect() {
    if (!GDriveSync.isConfigured()) { openSetup(); return; }
    try {
      await GDriveSync.connect();
      updateSyncUI();
      await pullMergePush(true);
    } catch (e) {
      if (e && e.message === "NOT_CONFIGURED") openSetup();
      else if (e) onSyncStatus("error", "Connect failed");
    }
  }

  function openSetup() {
    els.clientIdInput.value = localStorage.getItem("gdrive_client_id") || "";
    els.setupOverlay.hidden = false;
    setTimeout(() => els.clientIdInput.focus(), 50);
  }
  function closeSetup() { els.setupOverlay.hidden = true; }

  function wireSync() {
    if (!window.GDriveSync) return;

    GDriveSync.init({
      onStatus: onSyncStatus,
      getData: () => ({ properties, tombstones }),
    });

    els.connectDriveBtn.onclick = handleConnect;
    els.syncNowBtn.onclick = () => GDriveSync.syncNow();
    els.disconnectDriveBtn.onclick = () => {
      if (confirm("Disconnect Google Drive? Your pins stay on this device; they just stop syncing.")) {
        GDriveSync.disconnect();
        updateSyncUI();
      }
    };

    // Setup modal
    els.setupClose.onclick = closeSetup;
    els.setupCancel.onclick = closeSetup;
    els.setupOverlay.addEventListener("click", (e) => {
      if (e.target === els.setupOverlay) closeSetup();
    });
    els.setupSave.onclick = async () => {
      const id = els.clientIdInput.value.trim();
      if (!id) { els.clientIdInput.focus(); return; }
      GDriveSync.setClientId(id);
      closeSetup();
      await handleConnect();
    };

    updateSyncUI();

    // Already connected from a previous session? Reconcile in the
    // background once the auth library is ready (cross-device freshness).
    if (GDriveSync.isConnected()) {
      const resume = () => pullMergePush(false).catch(() => {});
      if (GDriveSync.hasValidToken()) setTimeout(resume, 800);
      else window.addEventListener("online", resume, { once: true });
    }
  }

  // ── Boot ────────────────────────────────────────────────────
  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  renderLegend();
  properties.forEach(addMarker);
  renderList();
  wireSync();

  // Map initialised successfully — drop the "needs JavaScript" fallback.
  document.getElementById("mapFallback")?.remove();

  // Leaflet must re-measure once layout has settled, otherwise tiles
  // can fail to fill the container (common when loaded inside a viewer).
  const fixSize = () => map.invalidateSize();
  window.addEventListener("resize", fixSize);
  window.addEventListener("orientationchange", () => setTimeout(fixSize, 300));
  setTimeout(fixSize, 200);
  setTimeout(fixSize, 600);
})();
