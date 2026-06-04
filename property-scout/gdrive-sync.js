/* ─────────────────────────────────────────────────────────────
   PR Property Scout — Google Drive sync (optional, additive).

   Pure client-side: Google Identity Services (OAuth 2.0 token model)
   + Drive REST API over fetch. Data is stored in the app's private,
   hidden "appDataFolder" (scope: drive.appdata) as a single file:
   "ponce-properties.json". Images travel as base64 inside that JSON.

   The app works fully offline without this module. When connected,
   it backs up and syncs across devices. Exposes window.GDriveSync.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  // ── Config ──────────────────────────────────────────────────
  const FILE_NAME = "ponce-properties.json";
  const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
  const SYNC_DEBOUNCE_MS = 2500;

  // Paste your Google OAuth Client ID here to bake it into the build,
  // or leave blank and enter it once in the app (stored in localStorage).
  const HARDCODED_CLIENT_ID = "";

  const TOKEN_KEY = "gdrive_token_v1";
  const CLIENT_ID_KEY = "gdrive_client_id";
  const CONNECTED_KEY = "gdrive_connected";

  // ── State ───────────────────────────────────────────────────
  let handlers = { onStatus() {}, getData: () => [] };
  let tokenClient = null;
  let tokenResolve = null;      // settles the in-flight token request
  let tokenReject = null;
  let accessToken = null;
  let tokenExpiry = 0;          // epoch ms
  let cachedFileId = null;
  let syncTimer = null;
  let pendingUpload = false;
  let connectedFlag = false;    // user *intends* to be connected
  let currentStatus = "disconnected";

  // ── Client-ID helpers ───────────────────────────────────────
  function clientId() {
    return HARDCODED_CLIENT_ID || localStorage.getItem(CLIENT_ID_KEY) || "";
  }
  function isConfigured() {
    return !!clientId();
  }
  function setClientId(id) {
    const v = String(id || "").trim();
    if (v) localStorage.setItem(CLIENT_ID_KEY, v);
    tokenClient = null; // force re-init with the new id
  }

  // ── Status ──────────────────────────────────────────────────
  function setStatus(state, detail) {
    currentStatus = state;
    try { handlers.onStatus(state, detail || ""); } catch (e) { /* noop */ }
  }
  const hasValidToken = () => !!accessToken && Date.now() < tokenExpiry;

  // ── Token persistence (access token only; GIS issues no refresh
  //    token in the browser, so we reuse it until expiry, then renew
  //    silently). appdata scope is narrow, limiting exposure. ──────
  function saveToken() {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify({ token: accessToken, expiry: tokenExpiry }));
    } catch (e) { /* noop */ }
  }
  function loadToken() {
    try {
      const t = JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
      if (t && t.token && Date.now() < t.expiry) {
        accessToken = t.token;
        tokenExpiry = t.expiry;
        return true;
      }
    } catch (e) { /* noop */ }
    return false;
  }

  // ── Google Identity Services ────────────────────────────────
  function gisReady() {
    return !!(window.google && google.accounts && google.accounts.oauth2);
  }
  function waitForGIS(timeoutMs) {
    return new Promise((resolve, reject) => {
      if (gisReady()) return resolve();
      const started = Date.now();
      const t = setInterval(() => {
        if (gisReady()) { clearInterval(t); resolve(); }
        else if (Date.now() - started > (timeoutMs || 8000)) {
          clearInterval(t);
          reject(new Error("Google sign-in library did not load. Check your connection."));
        }
      }, 150);
    });
  }
  function settleToken(fn, arg) {
    const resolve = tokenResolve, reject = tokenReject;
    tokenResolve = tokenReject = null;
    if (fn === "resolve" && resolve) resolve(arg);
    else if (fn === "reject" && reject) reject(arg);
  }

  function ensureTokenClient() {
    if (tokenClient) return tokenClient;
    if (!gisReady() || !isConfigured()) return null;
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId(),
      scope: SCOPE,
      callback: (resp) => {
        if (resp && resp.error) return settleToken("reject", new Error(resp.error));
        accessToken = resp.access_token;
        tokenExpiry = Date.now() + (Number(resp.expires_in || 3600) - 60) * 1000;
        saveToken();
        settleToken("resolve", resp);
      },
      error_callback: (err) =>
        settleToken("reject", new Error((err && err.type) || "Authorization was cancelled.")),
    });
    return tokenClient;
  }

  // Request an access token. interactive=true shows the consent popup;
  // interactive=false attempts a silent renewal of an existing grant.
  function requestToken(interactive) {
    return new Promise((resolve, reject) => {
      const tc = ensureTokenClient();
      if (!tc) return reject(new Error("Google sign-in is not ready yet."));
      // Only one token request can be in flight; replace any prior waiter.
      if (tokenReject) settleToken("reject", new Error("superseded"));
      tokenResolve = resolve;
      tokenReject = reject;
      try {
        tc.requestAccessToken({ prompt: interactive ? "consent" : "" });
      } catch (e) {
        settleToken("reject", e);
      }
    });
  }

  async function ensureToken() {
    if (hasValidToken()) return accessToken;
    await waitForGIS();
    await requestToken(false); // silent
    return accessToken;
  }

  // ── Drive REST helper (auto-attaches token, one 401 retry) ──
  async function api(url, opts) {
    await ensureToken();
    const build = () => ({
      ...opts,
      headers: Object.assign({ Authorization: "Bearer " + accessToken }, opts && opts.headers),
    });
    let res = await fetch(url, build());
    if (res.status === 401) {
      accessToken = null;
      await requestToken(false);
      res = await fetch(url, build());
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error("Drive API error " + res.status + (body ? ": " + body.slice(0, 140) : ""));
    }
    return res;
  }

  async function findFileId() {
    if (cachedFileId) return cachedFileId;
    const q = encodeURIComponent("name='" + FILE_NAME + "' and trashed=false");
    const res = await api(
      "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=" +
      q + "&fields=files(id,modifiedTime)&orderBy=modifiedTime desc"
    );
    const data = await res.json();
    cachedFileId = (data.files && data.files[0] && data.files[0].id) || null;
    return cachedFileId;
  }

  // Download remote data → array (or null if no file yet).
  async function pull() {
    const id = await findFileId();
    if (!id) return null;
    const res = await api("https://www.googleapis.com/drive/v3/files/" + id + "?alt=media");
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : (parsed.properties || null);
    } catch (e) {
      return null;
    }
  }

  // Upload (create or overwrite) the JSON file.
  async function upload(data) {
    const body = JSON.stringify(data);
    const id = await findFileId();
    if (id) {
      await api(
        "https://www.googleapis.com/upload/drive/v3/files/" + id + "?uploadType=media",
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body }
      );
    } else {
      const metadata = { name: FILE_NAME, parents: ["appDataFolder"] };
      const boundary = "ponce_scout_" + Date.now();
      const multipart =
        "--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        "\r\n--" + boundary + "\r\nContent-Type: application/json\r\n\r\n" +
        body +
        "\r\n--" + boundary + "--";
      const res = await api(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        { method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + boundary }, body: multipart }
      );
      const j = await res.json();
      cachedFileId = j.id;
    }
  }

  // ── Public sync operations ──────────────────────────────────
  async function syncNow() {
    if (!connectedFlag) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      pendingUpload = true;
      setStatus("pending", "Offline — will sync later");
      return;
    }
    setStatus("pending", "Syncing…");
    try {
      await upload(handlers.getData());
      pendingUpload = false;
      setStatus("synced", "Synced " + timeLabel());
    } catch (e) {
      pendingUpload = true;
      setStatus("error", (e && e.message) || "Sync failed");
    }
  }

  // Debounced upload — call after any local change.
  function queueSync() {
    if (!connectedFlag) return;
    pendingUpload = true;
    setStatus("pending", "Pending…");
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncNow, SYNC_DEBOUNCE_MS);
  }

  // Interactive connect (shows Google consent screen).
  async function connect() {
    if (!isConfigured()) throw new Error("NOT_CONFIGURED");
    setStatus("pending", "Connecting…");
    await waitForGIS();
    await requestToken(true);
    connectedFlag = true;
    try { localStorage.setItem(CONNECTED_KEY, "1"); } catch (e) { /* noop */ }
    setStatus("synced", "Connected");
    return true;
  }

  function disconnect() {
    connectedFlag = false;
    clearTimeout(syncTimer);
    try {
      localStorage.removeItem(CONNECTED_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) { /* noop */ }
    const tok = accessToken;
    accessToken = null;
    tokenExpiry = 0;
    cachedFileId = null;
    pendingUpload = false;
    if (tok && gisReady()) {
      try { google.accounts.oauth2.revoke(tok, () => {}); } catch (e) { /* noop */ }
    }
    setStatus("disconnected", "");
  }

  // ── Init / boot ─────────────────────────────────────────────
  function init(h) {
    handlers = Object.assign(handlers, h || {});
    connectedFlag = (function () {
      try { return localStorage.getItem(CONNECTED_KEY) === "1"; } catch (e) { return false; }
    })();
    loadToken();

    if (connectedFlag) {
      setStatus(hasValidToken() ? "synced" : "pending", "Reconnecting…");
      // Resume the session: silently refresh the token in the background.
      waitForGIS()
        .then(() => ensureToken())
        .then(() => setStatus(navigator.onLine === false ? "pending" : "synced", "Connected"))
        .catch(() => setStatus("error", "Reconnect needed — tap Connect"));
    } else {
      setStatus("disconnected", "");
    }

    window.addEventListener("online", () => {
      if (connectedFlag && pendingUpload) syncNow();
      else if (connectedFlag) setStatus("synced", "Back online");
    });
    window.addEventListener("offline", () => {
      if (connectedFlag) setStatus("pending", "Offline — will sync later");
    });
  }

  function timeLabel() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // ── Public API ──────────────────────────────────────────────
  window.GDriveSync = {
    init,
    setClientId,
    isConfigured,
    isConnected: () => connectedFlag,
    hasValidToken,
    getStatus: () => currentStatus,
    connect,
    disconnect,
    pull,
    syncNow,
    queueSync,
  };
})();
