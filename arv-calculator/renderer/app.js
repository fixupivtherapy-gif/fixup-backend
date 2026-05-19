/**
 * Main renderer logic: state, input wiring, live recalculation, deal management,
 * keyboard shortcuts, export. Pulls pure math from calculations.js and chart
 * rendering from charts.js.
 */
(function () {
  'use strict';

  const ADJ_FIELDS = [
    { key: 'extraBath', label: 'Extra Bath' },
    { key: 'garage', label: 'Garage' },
    { key: 'pool', label: 'Pool' },
    { key: 'updatedKitchen', label: 'Updated Kitchen' },
    { key: 'lotSize', label: 'Lot Size Difference' },
    { key: 'condition', label: 'Condition Difference' },
    { key: 'other', label: 'Other' },
  ];

  const SAMPLE_DEALS = [
    {
      name: '4421 Maplewood Drive',
      subject: {
        address: '4421 Maplewood Drive, Austin, TX',
        beds: 3,
        baths: 2,
        sqft: 1480,
        lot: 6500,
        year: 1978,
        condition: 'distressed',
        price: 245000,
        rehab: 52000,
        closingPct: 10,
      },
      comps: [
        { address: '4318 Maplewood Dr', price: 412000, saleDate: daysAgo(45), beds: 3, baths: 2, sqft: 1525, lot: 6400, condition: 'renovated', included: true, adjustments: { updatedKitchen: -8000 } },
        { address: '4502 Cedar Ln', price: 398000, saleDate: daysAgo(78), beds: 3, baths: 2, sqft: 1450, lot: 6800, condition: 'renovated', included: true, adjustments: {} },
        { address: '4119 Birchwood Ave', price: 425000, saleDate: daysAgo(125), beds: 3, baths: 2.5, sqft: 1610, lot: 7100, condition: 'renovated', included: true, adjustments: { extraBath: -6000 } },
        { address: '4807 Oak Hollow', price: 385000, saleDate: daysAgo(210), beds: 3, baths: 2, sqft: 1395, lot: 6200, condition: 'good', included: true, adjustments: {} },
        { address: '4233 Willow Bend', price: 472000, saleDate: daysAgo(95), beds: 4, baths: 2, sqft: 1820, lot: 7400, condition: 'renovated', included: false, adjustments: {} },
      ],
      adjustmentsDraft: null,
    },
    {
      name: '7812 Linden Court',
      subject: {
        address: '7812 Linden Court, Charlotte, NC',
        beds: 4,
        baths: 2.5,
        sqft: 2150,
        lot: 8200,
        year: 1995,
        condition: 'fair',
        price: 318000,
        rehab: 68000,
        closingPct: 10,
      },
      comps: [
        { address: '7705 Linden Ct', price: 489000, saleDate: daysAgo(38), beds: 4, baths: 2.5, sqft: 2210, lot: 8400, condition: 'renovated', included: true, adjustments: {} },
        { address: '7918 Magnolia Dr', price: 465000, saleDate: daysAgo(112), beds: 4, baths: 2.5, sqft: 2090, lot: 7900, condition: 'renovated', included: true, adjustments: { pool: -12000 } },
        { address: '8021 Sycamore Way', price: 510000, saleDate: daysAgo(62), beds: 4, baths: 3, sqft: 2280, lot: 9100, condition: 'renovated', included: true, adjustments: { extraBath: -7500, lotSize: -3000 } },
        { address: '7644 Linden Pl', price: 442000, saleDate: daysAgo(155), beds: 4, baths: 2, sqft: 2050, lot: 8000, condition: 'good', included: true, adjustments: { extraBath: 8000 } },
      ],
    },
  ];

  // ===== Helpers =====
  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function showToast(msg, ms = 2200) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { el.hidden = true; }, ms);
  }

  // ===== State =====
  const state = {
    currentId: null,
    name: '',
    subject: {
      address: '', beds: '', baths: '', year: '', sqft: '', lot: '',
      condition: 'good', price: '', rehab: '', closingPct: 10,
    },
    comps: [],
    dirty: false,
    editingCompId: null,
  };

  function newComp() {
    return {
      id: Storage.uuid(),
      address: '',
      price: '',
      saleDate: '',
      beds: '',
      baths: '',
      sqft: '',
      lot: '',
      condition: 'good',
      included: true,
      adjustments: {},
    };
  }

  // ===== Number input formatting =====
  function formatNumberInput(input) {
    const raw = input.value.replace(/[^\d.-]/g, '');
    if (raw === '' || raw === '-') { input.value = raw; return raw; }
    const n = Number(raw);
    if (!Number.isFinite(n)) return raw;
    // Preserve decimals as typed
    const parts = raw.split('.');
    const intPart = Number(parts[0]).toLocaleString('en-US');
    input.value = parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
    return raw;
  }

  function bindNumericFormatter(input) {
    input.addEventListener('blur', () => {
      const raw = input.value.replace(/[^\d.-]/g, '');
      if (raw === '') return;
      const n = Number(raw);
      if (!Number.isFinite(n)) return;
      input.value = n.toLocaleString('en-US');
    });
  }

  // ===== Subject input wiring =====
  function bindSubjectInputs() {
    const map = {
      'subj-address': 'address',
      'subj-beds': 'beds',
      'subj-baths': 'baths',
      'subj-year': 'year',
      'subj-sqft': 'sqft',
      'subj-lot': 'lot',
      'subj-condition': 'condition',
      'subj-price': 'price',
      'subj-rehab': 'rehab',
      'subj-closing': 'closingPct',
    };
    for (const [id, key] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (!el) continue;
      const handler = () => {
        state.subject[key] = el.value;
        validateSubjectField(el, key);
        markDirty();
        debouncedRecalc();
      };
      el.addEventListener('input', handler);
      if (el.tagName === 'SELECT') el.addEventListener('change', handler);
      if (['sqft', 'lot', 'price', 'rehab'].includes(key)) bindNumericFormatter(el);
    }

    const nameInput = $('#deal-name');
    nameInput.addEventListener('input', () => {
      state.name = nameInput.value;
      markDirty();
    });
  }

  function validateSubjectField(el, key) {
    if (key === 'sqft') {
      const n = Calc.parseNumber(el.value);
      el.classList.toggle('invalid', el.value !== '' && (!Number.isFinite(n) || n <= 0));
    } else if (['price', 'rehab', 'beds', 'baths', 'year', 'lot'].includes(key)) {
      if (el.value === '') { el.classList.remove('invalid'); return; }
      const n = Calc.parseNumber(el.value);
      el.classList.toggle('invalid', !Number.isFinite(n) || n < 0);
    }
  }

  // ===== Subject -> UI =====
  function renderSubject() {
    const fmt = (k) => {
      const v = state.subject[k];
      if (v === '' || v === null || v === undefined) return '';
      if (['sqft', 'lot', 'price', 'rehab'].includes(k)) {
        const n = Calc.parseNumber(v);
        return Number.isFinite(n) ? n.toLocaleString('en-US') : String(v);
      }
      return String(v);
    };
    $('#subj-address').value = state.subject.address || '';
    $('#subj-beds').value = state.subject.beds ?? '';
    $('#subj-baths').value = state.subject.baths ?? '';
    $('#subj-year').value = state.subject.year ?? '';
    $('#subj-sqft').value = fmt('sqft');
    $('#subj-lot').value = fmt('lot');
    $('#subj-condition').value = state.subject.condition || 'good';
    $('#subj-price').value = fmt('price');
    $('#subj-rehab').value = fmt('rehab');
    $('#subj-closing').value = state.subject.closingPct ?? 10;
    $('#deal-name').value = state.name || '';
  }

  // ===== Comps table =====
  function renderComps() {
    const tbody = $('#comp-rows');
    const empty = $('#comp-empty');
    tbody.innerHTML = '';
    if (state.comps.length === 0) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    const outliers = Calc.detectOutliers(state.comps);

    for (const comp of state.comps) {
      const tr = document.createElement('tr');
      tr.dataset.id = comp.id;
      if (comp.included === false) tr.classList.add('excluded');
      if (outliers.has(comp.id)) tr.classList.add('outlier');

      const rate = Calc.compPricePerSqft(comp);
      const adj = Calc.netAdjustment(comp);

      tr.innerHTML = `
        <td class="col-inc">
          <input type="checkbox" class="comp-check" data-field="included" ${comp.included !== false ? 'checked' : ''} />
        </td>
        <td><input data-field="address" type="text" value="${escapeAttr(comp.address)}" placeholder="123 Comp St" /></td>
        <td class="num"><input data-field="price" type="text" inputmode="numeric" value="${fmtNum(comp.price)}" placeholder="0" /></td>
        <td class="num"><input data-field="saleDate" type="date" value="${escapeAttr(comp.saleDate)}" /></td>
        <td class="num"><input data-field="beds" type="number" min="0" step="1" value="${escapeAttr(comp.beds)}" /></td>
        <td class="num"><input data-field="baths" type="number" min="0" step="0.5" value="${escapeAttr(comp.baths)}" /></td>
        <td class="num"><input data-field="sqft" type="text" inputmode="numeric" value="${fmtNum(comp.sqft)}" /></td>
        <td class="num">${Number.isFinite(rate) ? '$' + rate.toFixed(0) : '—'}</td>
        <td class="num">${adj !== 0 ? Calc.formatCurrency(adj, { signed: true }) : '—'}</td>
        <td>
          <button class="comp-action" data-action="adjust" title="Adjustments">⌥</button>
          <button class="comp-action comp-action--del" data-action="delete" title="Remove">✕</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Wire inputs
    tbody.querySelectorAll('tr').forEach((tr) => {
      const id = tr.dataset.id;
      tr.querySelectorAll('input[data-field]').forEach((input) => {
        const field = input.dataset.field;
        const handler = () => {
          const comp = state.comps.find((c) => c.id === id);
          if (!comp) return;
          if (field === 'included') comp.included = input.checked;
          else comp[field] = input.value;
          markDirty();
          debouncedRecalc();
          // Light refresh of $/sqft cell on input
          if (field === 'price' || field === 'sqft') {
            const r = Calc.compPricePerSqft(comp);
            const cell = tr.querySelector('td.num:nth-last-child(3)');
            if (cell) cell.textContent = Number.isFinite(r) ? '$' + r.toFixed(0) : '—';
          }
        };
        input.addEventListener('input', handler);
        if (input.type === 'checkbox' || input.type === 'date') {
          input.addEventListener('change', handler);
        }
        if (['price', 'sqft'].includes(field)) bindNumericFormatter(input);
      });
      tr.querySelectorAll('[data-action]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const action = btn.dataset.action;
          if (action === 'delete') {
            state.comps = state.comps.filter((c) => c.id !== id);
            markDirty();
            renderComps();
            recalc();
          } else if (action === 'adjust') {
            openAdjustModal(id);
          }
        });
      });
    });

    $('#comp-count-hint').textContent = `${state.comps.filter(c => c.included !== false).length} of ${state.comps.length} comps included`;
  }

  function fmtNum(v) {
    if (v === '' || v === null || v === undefined) return '';
    const n = Calc.parseNumber(v);
    return Number.isFinite(n) ? n.toLocaleString('en-US') : escapeAttr(v);
  }

  function escapeAttr(v) {
    if (v === null || v === undefined) return '';
    return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ===== Adjustment modal =====
  function openAdjustModal(compId) {
    state.editingCompId = compId;
    const comp = state.comps.find((c) => c.id === compId);
    if (!comp) return;
    $('#adj-modal-title').textContent = `Adjustments — ${comp.address || 'Comp'}`;
    const wrap = $('#adj-fields');
    wrap.innerHTML = '';
    for (const field of ADJ_FIELDS) {
      const row = document.createElement('div');
      row.className = 'adj-field';
      const v = comp.adjustments[field.key];
      const shown = v !== undefined && v !== '' ? Calc.parseNumber(v) : '';
      row.innerHTML = `
        <label>${field.label}</label>
        <input type="text" inputmode="numeric" data-key="${field.key}" value="${Number.isFinite(shown) ? shown.toLocaleString('en-US') : ''}" placeholder="0" />
      `;
      wrap.appendChild(row);
    }
    wrap.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', updateAdjTotal);
    });
    updateAdjTotal();
    $('#adj-modal').hidden = false;
  }

  function updateAdjTotal() {
    let total = 0;
    $$('#adj-fields input').forEach((input) => {
      const n = Calc.parseNumber(input.value);
      if (Number.isFinite(n)) total += n;
    });
    $('#adj-total').textContent = Calc.formatCurrency(total, { signed: total !== 0 });
  }

  function closeAdjustModal() {
    $('#adj-modal').hidden = true;
    state.editingCompId = null;
  }

  function applyAdjustments() {
    const comp = state.comps.find((c) => c.id === state.editingCompId);
    if (!comp) { closeAdjustModal(); return; }
    const adj = {};
    $$('#adj-fields input').forEach((input) => {
      const key = input.dataset.key;
      const n = Calc.parseNumber(input.value);
      if (Number.isFinite(n) && n !== 0) adj[key] = n;
    });
    comp.adjustments = adj;
    closeAdjustModal();
    markDirty();
    renderComps();
    recalc();
  }

  // ===== Valuation render =====
  function renderValuation() {
    const arv = Calc.computeARV(state.comps, state.subject);
    const subjSqft = Calc.parseNumber(state.subject.sqft);

    const setMethod = (idVal, idRate, m) => {
      $(idVal).textContent = Number.isFinite(m.arv) ? Calc.formatCurrency(m.arv) : '—';
      $(idRate).textContent = Number.isFinite(m.rate)
        ? `$${m.rate.toFixed(0)}/sqft · n=${m.count}`
        : '—';
    };
    setMethod('#val-m1', '#val-m1-rate', arv.m1);
    setMethod('#val-m2', '#val-m2-rate', arv.m2);
    setMethod('#val-m3', '#val-m3-rate', arv.m3);

    $('#val-low').textContent = Number.isFinite(arv.low) ? Calc.formatCurrency(arv.low) : '—';
    $('#val-mid').textContent = Number.isFinite(arv.mid) ? Calc.formatCurrency(arv.mid) : '—';
    $('#val-high').textContent = Number.isFinite(arv.high) ? Calc.formatCurrency(arv.high) : '—';

    const math = Calc.computeInvestorMath(arv.mid, state.subject);
    const setIM = (id, val, opts = {}) => {
      const el = $(id);
      el.textContent = Number.isFinite(val)
        ? (opts.percent ? Calc.formatPercent(val) : Calc.formatCurrency(val))
        : '—';
      el.classList.remove('pos', 'neg');
      if (Number.isFinite(val) && opts.color) {
        el.classList.add(val >= 0 ? 'pos' : 'neg');
      }
    };
    setIM('#im-mao70', math.mao70);
    setIM('#im-mao75', math.mao75);
    setIM('#im-profit', math.profit, { color: true });
    setIM('#im-roi', math.roi, { percent: true, color: true });
    setIM('#im-cash', math.cash);

    // Ribbon
    $('#ribbon-arv').textContent = Number.isFinite(arv.mid) ? Calc.formatCurrency(arv.mid) : '—';
    $('#ribbon-mao').textContent = Number.isFinite(math.mao70) ? Calc.formatCurrency(math.mao70) : '—';
    const profitEl = $('#ribbon-profit');
    profitEl.textContent = Number.isFinite(math.profit) ? Calc.formatCurrency(math.profit) : '—';
    profitEl.style.color = Number.isFinite(math.profit)
      ? (math.profit >= 0 ? 'var(--good)' : 'var(--bad)')
      : '';

    // Quality
    const quality = Calc.computeDealQuality(arv.mid, math, state.subject);
    const pill = $('#deal-quality');
    pill.className = 'quality-pill quality-pill--' + quality.level;
    pill.querySelector('.quality-pill__label').textContent = quality.label;

    // Charts
    const outliers = Calc.detectOutliers(state.comps);
    Charts.updateScatter(state.comps, state.subject, outliers);
    Charts.updateBar(state.comps, outliers);
    $('#outlier-hint').textContent = outliers.size > 0
      ? `${outliers.size} outlier${outliers.size > 1 ? 's' : ''} flagged`
      : 'no outliers';
  }

  // ===== Sidebar deal list =====
  function renderDealList() {
    const list = $('#deal-list');
    list.innerHTML = '';
    const deals = Storage.list();
    if (deals.length === 0) {
      list.innerHTML = '<div style="padding:16px;color:var(--ink-mute);font-size:11px">No saved deals.</div>';
      return;
    }
    for (const d of deals) {
      const item = document.createElement('div');
      item.className = 'deal-item' + (d.id === state.currentId ? ' active' : '');
      const arv = Calc.computeARV(d.comps || [], d.subject || {});
      item.innerHTML = `
        <div class="deal-item__addr" title="${escapeAttr(d.name)}">${escapeAttr(d.name || 'Untitled')}</div>
        <div class="deal-item__row">
          <span class="deal-item__arv">${Number.isFinite(arv.mid) ? Calc.formatCurrency(arv.mid) : '—'}</span>
          <span class="deal-item__actions">
            <button class="deal-item__act" data-action="dup">DUP</button>
            <button class="deal-item__act" data-action="del">DEL</button>
          </span>
        </div>
      `;
      item.addEventListener('click', (e) => {
        if (e.target.closest('.deal-item__act')) return;
        loadDeal(d.id);
      });
      item.querySelector('[data-action="dup"]').addEventListener('click', (e) => {
        e.stopPropagation();
        const copy = Storage.duplicate(d.id);
        if (copy) { loadDeal(copy.id); showToast('Duplicated'); }
      });
      item.querySelector('[data-action="del"]').addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm(`Delete "${d.name || 'Untitled'}"?`)) return;
        Storage.remove(d.id);
        if (state.currentId === d.id) newDeal();
        renderDealList();
        showToast('Deleted');
      });
      list.appendChild(item);
    }
  }

  // ===== Deal lifecycle =====
  function markDirty() {
    state.dirty = true;
    const status = $('#deal-status');
    status.textContent = 'unsaved';
    status.classList.remove('saved');
  }

  function markSaved() {
    state.dirty = false;
    const status = $('#deal-status');
    status.textContent = 'saved';
    status.classList.add('saved');
  }

  function newDeal() {
    state.currentId = null;
    state.name = '';
    state.subject = {
      address: '', beds: '', baths: '', year: '', sqft: '', lot: '',
      condition: 'good', price: '', rehab: '', closingPct: 10,
    };
    state.comps = [];
    state.dirty = false;
    renderSubject();
    renderComps();
    recalc();
    renderDealList();
    markSaved();
    $('#deal-status').textContent = 'new';
    $('#deal-name').focus();
  }

  function loadDeal(id) {
    const deal = Storage.get(id);
    if (!deal) return;
    state.currentId = deal.id;
    state.name = deal.name || '';
    state.subject = { ...state.subject, ...(deal.subject || {}) };
    state.comps = (deal.comps || []).map((c) => ({
      ...newComp(),
      ...c,
      id: c.id || Storage.uuid(),
      adjustments: c.adjustments || {},
    }));
    renderSubject();
    renderComps();
    recalc();
    renderDealList();
    markSaved();
  }

  function saveDeal() {
    const sqft = Calc.parseNumber(state.subject.sqft);
    if (!Number.isFinite(sqft) || sqft <= 0) {
      showToast('Living area is required to save a deal');
      $('#subj-sqft').focus();
      return;
    }
    const dealName = state.name || state.subject.address || 'Untitled Deal';
    const deal = {
      id: state.currentId,
      name: dealName,
      subject: { ...state.subject },
      comps: state.comps.map((c) => ({ ...c })),
    };
    const saved = Storage.save(deal);
    state.currentId = saved.id;
    state.name = saved.name;
    $('#deal-name').value = saved.name;
    markSaved();
    renderDealList();
    showToast('Saved');
  }

  function addComp() {
    state.comps.push(newComp());
    markDirty();
    renderComps();
    recalc();
    // Focus the new row's address input
    const rows = $$('#comp-rows tr');
    const lastRow = rows[rows.length - 1];
    if (lastRow) lastRow.querySelector('input[data-field="address"]').focus();
  }

  // ===== Recalc =====
  const recalc = () => renderValuation();
  const debouncedRecalc = debounce(recalc, 300);

  // ===== Export =====
  function exportReport() {
    const arv = Calc.computeARV(state.comps, state.subject);
    const math = Calc.computeInvestorMath(arv.mid, state.subject);
    const quality = Calc.computeDealQuality(arv.mid, math, state.subject);
    const html = buildReportHTML(state, arv, math, quality);

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(state.name || 'deal').replace(/[^a-z0-9-]+/gi, '_')}_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Report downloaded — print to PDF from your browser');
  }

  function buildReportHTML(s, arv, math, quality) {
    const fmt = Calc.formatCurrency;
    const subj = s.subject;
    const compsRows = s.comps.map((c) => {
      const rate = Calc.compPricePerSqft(c);
      return `<tr${c.included === false ? ' style="opacity:0.5"' : ''}>
        <td>${escapeAttr(c.address)}</td>
        <td>${fmt(Calc.parseNumber(c.price))}</td>
        <td>${escapeAttr(c.saleDate)}</td>
        <td>${escapeAttr(c.beds)}/${escapeAttr(c.baths)}</td>
        <td>${fmtNum(c.sqft)}</td>
        <td>${Number.isFinite(rate) ? '$' + rate.toFixed(0) : '—'}</td>
        <td>${fmt(Calc.netAdjustment(c), { signed: true })}</td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ARV Report — ${escapeAttr(s.name)}</title>
<style>
  body{font-family:Georgia,serif;color:#222;max-width:800px;margin:40px auto;padding:0 30px;line-height:1.5}
  h1{font-size:24px;border-bottom:2px solid #c2683a;padding-bottom:8px;margin-bottom:4px}
  h2{font-size:16px;margin-top:32px;color:#c2683a;text-transform:uppercase;letter-spacing:0.05em}
  table{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px}
  th,td{padding:6px 10px;text-align:left;border-bottom:1px solid #ddd}
  th{background:#f3eedf;font-weight:600}
  .meta{color:#666;font-size:12px;margin-bottom:20px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:13px}
  .grid div span:first-child{color:#666;display:inline-block;width:140px}
  .arv-box{background:#f3eedf;padding:16px;margin-top:16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;text-align:center}
  .arv-box .lbl{font-size:10px;letter-spacing:0.1em;color:#666;text-transform:uppercase}
  .arv-box .val{font-size:20px;font-weight:600;margin-top:4px}
  .arv-box .mid{background:#fff;padding:8px;border:2px solid #c2683a}
  .quality{display:inline-block;padding:4px 10px;font-size:11px;letter-spacing:0.08em;color:white;border-radius:2px}
  .q-good{background:#6b8f5a}.q-warn{background:#c8a04a}.q-bad{background:#b3604a}.q-neutral{background:#999}
  @media print{body{margin:0;padding:20px}}
</style></head><body>
  <h1>${escapeAttr(s.name || 'Untitled Deal')}</h1>
  <div class="meta">Report generated ${new Date().toLocaleString()} · <span class="quality q-${quality.level}">${quality.label}</span></div>

  <h2>Subject Property</h2>
  <div class="grid">
    <div><span>Address</span>${escapeAttr(subj.address) || '—'}</div>
    <div><span>Beds / Baths</span>${escapeAttr(subj.beds)} / ${escapeAttr(subj.baths)}</div>
    <div><span>Living Area</span>${fmtNum(subj.sqft)} sqft</div>
    <div><span>Lot</span>${fmtNum(subj.lot)} sqft</div>
    <div><span>Year Built</span>${escapeAttr(subj.year)}</div>
    <div><span>Condition</span>${escapeAttr(subj.condition)}</div>
    <div><span>Asking Price</span>${fmt(Calc.parseNumber(subj.price))}</div>
    <div><span>Rehab</span>${fmt(Calc.parseNumber(subj.rehab))}</div>
  </div>

  <h2>Valuation</h2>
  <div class="arv-box">
    <div><div class="lbl">LOW</div><div class="val">${fmt(arv.low)}</div></div>
    <div class="mid"><div class="lbl">MID · RECOMMENDED</div><div class="val">${fmt(arv.mid)}</div></div>
    <div><div class="lbl">HIGH</div><div class="val">${fmt(arv.high)}</div></div>
  </div>
  <div class="grid" style="margin-top:14px">
    <div><span>M1 — Avg $/sqft</span>${fmt(arv.m1.arv)} ${Number.isFinite(arv.m1.rate) ? '($' + arv.m1.rate.toFixed(0) + '/sqft)' : ''}</div>
    <div><span>M2 — Weighted</span>${fmt(arv.m2.arv)} ${Number.isFinite(arv.m2.rate) ? '($' + arv.m2.rate.toFixed(0) + '/sqft)' : ''}</div>
    <div><span>M3 — Adjusted</span>${fmt(arv.m3.arv)} ${Number.isFinite(arv.m3.rate) ? '($' + arv.m3.rate.toFixed(0) + '/sqft)' : ''}</div>
  </div>

  <h2>Investor Math</h2>
  <div class="grid">
    <div><span>70% Max Offer</span>${fmt(math.mao70)}</div>
    <div><span>75% Max Offer</span>${fmt(math.mao75)}</div>
    <div><span>Estimated Profit</span>${fmt(math.profit)}</div>
    <div><span>ROI</span>${Calc.formatPercent(math.roi)}</div>
    <div><span>Total Investment</span>${fmt(math.cash)}</div>
    <div><span>Closing/Holding</span>${fmt(math.closingHolding)}</div>
  </div>

  <h2>Comparable Sales (${s.comps.length})</h2>
  <table>
    <thead><tr><th>Address</th><th>Sale Price</th><th>Date</th><th>Bd/Ba</th><th>SqFt</th><th>$/SqFt</th><th>Adj</th></tr></thead>
    <tbody>${compsRows}</tbody>
  </table>
</body></html>`;
  }

  // ===== Modal wiring =====
  function bindModal() {
    $('#adj-modal').addEventListener('click', (e) => {
      if (e.target.matches('[data-close]')) closeAdjustModal();
    });
    $('#adj-apply').addEventListener('click', applyAdjustments);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('#adj-modal').hidden) closeAdjustModal();
    });
  }

  // ===== Keyboard shortcuts =====
  function bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDeal();
      } else if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        newDeal();
      } else if (mod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        exportReport();
      }
    });
    if (window.electronAPI) {
      window.electronAPI.onMenuNewDeal(() => newDeal());
      window.electronAPI.onMenuSaveDeal(() => saveDeal());
      window.electronAPI.onMenuExport(() => exportReport());
    }
  }

  // ===== Boot =====
  function boot() {
    Storage.seedIfEmpty(SAMPLE_DEALS);
    bindSubjectInputs();
    bindModal();
    bindShortcuts();
    $('#btn-new-deal').addEventListener('click', newDeal);
    $('#btn-save').addEventListener('click', saveDeal);
    $('#btn-export').addEventListener('click', exportReport);
    $('#btn-add-comp').addEventListener('click', addComp);

    const deals = Storage.list();
    if (deals.length > 0) loadDeal(deals[0].id);
    else newDeal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
