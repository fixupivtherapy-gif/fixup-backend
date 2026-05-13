// Dashboard frontend - lightweight vanilla JS. Stays in one file on purpose.

const $ = (sel) => document.querySelector(sel);

// ─── toasts ─────────────────────────────────────────────────────────────────

function toast(msg, kind = 'info') {
  const el = document.createElement('div');
  const tones = {
    info: 'bg-ink-800 border-ink-600 text-zinc-100',
    ok: 'bg-emerald-900/60 border-emerald-700 text-emerald-100',
    err: 'bg-rose-900/60 border-rose-700 text-rose-100',
  };
  el.className = `border ${tones[kind]} rounded-lg px-3 py-2 text-sm shadow-lg`;
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ─── api ────────────────────────────────────────────────────────────────────

async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ─── sites list ─────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString();
}

function siteCard(s) {
  const stopped = s.status !== 'active';
  return `
    <article class="bg-ink-900 border border-ink-700 rounded-2xl p-4 flex flex-col gap-3" data-id="${s.id}">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="font-semibold text-zinc-100 truncate">${escapeHtml(s.name)}</div>
          <a href="${s.url}" target="_blank" rel="noopener"
             class="text-xs text-accent hover:underline break-all">${escapeHtml(s.url)}</a>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-full ${stopped ? 'bg-zinc-700 text-zinc-300' : 'bg-emerald-900/50 text-emerald-300 border border-emerald-800'}">
          ${stopped ? 'stopped' : 'active'}
        </span>
      </div>
      <dl class="text-xs text-zinc-400 grid grid-cols-2 gap-y-1">
        <dt>Files</dt><dd class="text-zinc-300 text-right">${s.fileCount ?? '-'}</dd>
        <dt>Last deployed</dt><dd class="text-zinc-300 text-right">${fmtDate(s.lastDeployed)}</dd>
      </dl>
      <div class="flex flex-wrap gap-2 pt-1">
        ${stopped
          ? `<button data-action="start" class="text-xs px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600">Start</button>`
          : `<button data-action="stop" class="text-xs px-2 py-1 rounded bg-ink-700 hover:bg-ink-600">Stop</button>`}
        <button data-action="restart" class="text-xs px-2 py-1 rounded bg-ink-700 hover:bg-ink-600">Restart</button>
        <button data-action="redeploy" class="text-xs px-2 py-1 rounded bg-ink-700 hover:bg-ink-600">Redeploy</button>
        <button data-action="files" class="text-xs px-2 py-1 rounded bg-ink-700 hover:bg-ink-600">Files</button>
        <button data-action="delete" class="text-xs px-2 py-1 rounded bg-rose-800 hover:bg-rose-700 ml-auto">Delete</button>
      </div>
    </article>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function loadSites() {
  try {
    const { sites } = await api('/api/sites');
    const list = $('#sites');
    list.innerHTML = sites.map(siteCard).join('');
    $('#empty').classList.toggle('hidden', sites.length > 0);
    return sites;
  } catch (err) {
    if (err.message !== 'unauthorized') toast(err.message, 'err');
    return [];
  }
}

// ─── card actions ───────────────────────────────────────────────────────────

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const card = btn.closest('[data-id]');
  if (!card) return;
  const id = card.dataset.id;
  const action = btn.dataset.action;

  try {
    if (action === 'stop' || action === 'start' || action === 'restart') {
      await api(`/api/sites/${id}/${action}`, { method: 'POST' });
      toast(`Site ${action}ed`, 'ok');
      loadSites();
    } else if (action === 'delete') {
      if (!confirm('Delete this site and all its files? This cannot be undone.')) return;
      await api(`/api/sites/${id}`, { method: 'DELETE' });
      toast('Site deleted', 'ok');
      loadSites();
    } else if (action === 'redeploy') {
      openDeployModal({ redeployId: id });
    } else if (action === 'files') {
      openFilesModal(id);
    }
  } catch (err) {
    if (err.message !== 'unauthorized') toast(err.message, 'err');
  }
});

// ─── deploy modal ───────────────────────────────────────────────────────────

const deployModal = $('#deployModal');
const deployForm = $('#deployForm');
const drop = $('#drop');
const dropLabel = $('#dropLabel');
const zipInput = $('#zipInput');
const newFields = $('#newFields');
const deployTitle = $('#deployTitle');
const deployErr = $('#deployErr');
const deploySubmit = $('#deploySubmit');

let pendingFile = null;
let redeployId = null;

function openDeployModal({ redeployId: rid = null } = {}) {
  redeployId = rid;
  pendingFile = null;
  zipInput.value = '';
  dropLabel.textContent = 'Drop a ZIP here, or click to choose';
  deployErr.classList.add('hidden');
  deployErr.textContent = '';
  if (rid) {
    deployTitle.textContent = 'Redeploy site';
    newFields.classList.add('hidden');
  } else {
    deployTitle.textContent = 'Deploy a new site';
    newFields.classList.remove('hidden');
    $('#siteName').value = '';
    $('#siteSlug').value = '';
  }
  deployModal.classList.remove('hidden');
  deployModal.classList.add('flex');
}

function closeDeployModal() {
  deployModal.classList.add('hidden');
  deployModal.classList.remove('flex');
}

$('#newSiteBtn').addEventListener('click', () => openDeployModal());

deployModal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close]') || e.target === deployModal) closeDeployModal();
});

$('#siteName').addEventListener('input', (e) => {
  const slug = e.target.value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
  if (!$('#siteSlug').dataset.touched) $('#siteSlug').value = slug;
});
$('#siteSlug').addEventListener('input', (e) => { e.target.dataset.touched = '1'; });

function setFile(f) {
  if (!f) return;
  if (!f.name.toLowerCase().endsWith('.zip')) {
    deployErr.textContent = 'Only .zip files are supported';
    deployErr.classList.remove('hidden');
    return;
  }
  pendingFile = f;
  dropLabel.textContent = f.name + ` (${(f.size / 1024).toFixed(1)} KB)`;
  deployErr.classList.add('hidden');
}

zipInput.addEventListener('change', (e) => setFile(e.target.files[0]));
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, (e) => {
  e.preventDefault(); drop.classList.add('drop-active');
}));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, (e) => {
  e.preventDefault(); drop.classList.remove('drop-active');
}));
drop.addEventListener('drop', (e) => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) setFile(f);
});

deployForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  deployErr.classList.add('hidden');
  if (!pendingFile) {
    deployErr.textContent = 'Choose a ZIP file first.';
    deployErr.classList.remove('hidden');
    return;
  }

  const fd = new FormData();
  fd.append('zip', pendingFile);

  let url;
  if (redeployId) {
    url = `/api/sites/${redeployId}/redeploy`;
  } else {
    const name = $('#siteName').value.trim();
    const slug = $('#siteSlug').value.trim();
    if (!slug) {
      deployErr.textContent = 'Slug is required.';
      deployErr.classList.remove('hidden');
      return;
    }
    fd.append('name', name);
    fd.append('slug', slug);
    url = '/api/sites';
  }

  deploySubmit.disabled = true;
  dropLabel.textContent = 'Uploading...';
  try {
    const res = await fetch(url, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Deploy failed');
    toast(redeployId ? 'Redeployed' : 'Deployed', 'ok');
    closeDeployModal();
    loadSites();
  } catch (err) {
    deployErr.textContent = err.message;
    deployErr.classList.remove('hidden');
    dropLabel.textContent = pendingFile.name;
  } finally {
    deploySubmit.disabled = false;
  }
});

// ─── file manager modal ─────────────────────────────────────────────────────

const filesModal = $('#filesModal');
const fileTree = $('#fileTree');
const filesSite = $('#filesSite');
const filePathInput = $('#filePathInput');
const fileUploadInput = $('#fileUploadInput');
let currentFilesSiteId = null;

filesModal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close-files]') || e.target === filesModal) {
    filesModal.classList.add('hidden');
    filesModal.classList.remove('flex');
    currentFilesSiteId = null;
  }
});

async function openFilesModal(id) {
  currentFilesSiteId = id;
  filePathInput.value = '';
  fileUploadInput.value = '';
  filesModal.classList.remove('hidden');
  filesModal.classList.add('flex');
  try {
    const site = await api(`/api/sites/${id}`);
    filesSite.textContent = site.name;
    await refreshFileTree();
  } catch (err) {
    if (err.message !== 'unauthorized') toast(err.message, 'err');
  }
}

function renderTree(nodes, depth = 0) {
  if (!nodes.length) return '<div class="text-zinc-500">Empty</div>';
  return nodes.map(n => {
    const pad = `padding-left:${depth * 12}px`;
    if (n.type === 'dir') {
      return `
        <div style="${pad}" class="text-zinc-300">📁 ${escapeHtml(n.name)}</div>
        ${renderTree(n.children || [], depth + 1)}
      `;
    }
    return `
      <div style="${pad}" class="flex items-center justify-between gap-2 py-0.5">
        <span class="truncate">📄 ${escapeHtml(n.name)} <span class="text-zinc-500 text-xs">(${n.size}b)</span></span>
        <span class="flex items-center gap-1 shrink-0">
          <button data-file-action="use" data-path="${escapeHtml(n.path)}" class="text-xs text-zinc-400 hover:text-zinc-100">copy path</button>
          <button data-file-action="delete" data-path="${escapeHtml(n.path)}" class="text-xs text-rose-400 hover:text-rose-300">delete</button>
        </span>
      </div>
    `;
  }).join('');
}

async function refreshFileTree() {
  if (!currentFilesSiteId) return;
  try {
    const { files } = await api(`/api/sites/${currentFilesSiteId}/files`);
    fileTree.innerHTML = renderTree(files);
  } catch (err) {
    if (err.message !== 'unauthorized') toast(err.message, 'err');
  }
}

fileTree.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-file-action]');
  if (!btn) return;
  const action = btn.dataset.fileAction;
  const filePath = btn.dataset.path;
  if (action === 'use') {
    filePathInput.value = filePath;
    filePathInput.focus();
  } else if (action === 'delete') {
    if (!confirm(`Delete ${filePath}?`)) return;
    try {
      await api(`/api/sites/${currentFilesSiteId}/files?path=${encodeURIComponent(filePath)}`, { method: 'DELETE' });
      toast('File deleted', 'ok');
      refreshFileTree();
      loadSites();
    } catch (err) {
      if (err.message !== 'unauthorized') toast(err.message, 'err');
    }
  }
});

fileUploadInput.addEventListener('change', async () => {
  const file = fileUploadInput.files[0];
  if (!file || !currentFilesSiteId) return;
  const dest = filePathInput.value.trim() || file.name;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('path', dest);
  try {
    const res = await fetch(`/api/sites/${currentFilesSiteId}/files`, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    toast('File uploaded', 'ok');
    fileUploadInput.value = '';
    refreshFileTree();
    loadSites();
  } catch (err) {
    toast(err.message, 'err');
  }
});

// ─── logout ─────────────────────────────────────────────────────────────────

$('#logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login';
});

// ─── boot ───────────────────────────────────────────────────────────────────

loadSites();
setInterval(loadSites, 15000);
