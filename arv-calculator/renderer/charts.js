/**
 * Chart.js setup. Two charts:
 *   - scatter: $/sqft vs living area (subject highlighted)
 *   - bar: comp sale prices, outliers tinted
 */
(function (global) {
  'use strict';

  const COLORS = {
    ink: '#ece8df',
    inkDim: '#a6a39b',
    inkMute: '#6e6c66',
    line: '#2c2c34',
    accent: '#c2683a',
    accentSoft: 'rgba(194, 104, 58, 0.25)',
    good: '#6b8f5a',
    warn: '#c8a04a',
    bad: '#b3604a',
  };

  let scatterChart = null;
  let barChart = null;

  function ensureCharts() {
    if (typeof Chart === 'undefined') return false;
    if (!scatterChart) initScatter();
    if (!barChart) initBar();
    return true;
  }

  function gridStyle() {
    return { color: COLORS.line, drawBorder: false };
  }

  function tickStyle(font = 10) {
    return {
      color: COLORS.inkMute,
      font: { family: "'JetBrains Mono', monospace", size: font },
    };
  }

  function initScatter() {
    const ctx = document.getElementById('chart-scatter');
    if (!ctx) return;
    scatterChart = new Chart(ctx, {
      type: 'scatter',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: COLORS.inkDim,
              font: { family: "'Inter', sans-serif", size: 10 },
              usePointStyle: true,
              boxWidth: 8,
            },
          },
          tooltip: {
            backgroundColor: '#1d1d22',
            borderColor: COLORS.line,
            borderWidth: 1,
            titleColor: COLORS.ink,
            bodyColor: COLORS.inkDim,
            titleFont: { family: "'Inter', sans-serif", size: 11 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
            callbacks: {
              label: (ctx) => {
                const d = ctx.raw;
                return [
                  d.label || '',
                  `${Math.round(d.x).toLocaleString()} sqft`,
                  `$${Math.round(d.y).toLocaleString()}/sqft`,
                ].filter(Boolean);
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'LIVING AREA (SQFT)', color: COLORS.inkMute, font: { size: 9, family: "'Inter', sans-serif" } },
            grid: gridStyle(),
            ticks: tickStyle(),
          },
          y: {
            title: { display: true, text: '$ / SQFT', color: COLORS.inkMute, font: { size: 9, family: "'Inter', sans-serif" } },
            grid: gridStyle(),
            ticks: { ...tickStyle(), callback: (v) => '$' + v },
          },
        },
      },
    });
  }

  function initBar() {
    const ctx = document.getElementById('chart-bar');
    if (!ctx) return;
    barChart = new Chart(ctx, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Sale Price', data: [], backgroundColor: [] }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1d1d22',
            borderColor: COLORS.line,
            borderWidth: 1,
            titleColor: COLORS.ink,
            bodyColor: COLORS.inkDim,
            titleFont: { family: "'Inter', sans-serif", size: 11 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
            callbacks: {
              label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { ...tickStyle(), maxRotation: 0, autoSkip: false },
          },
          y: {
            grid: gridStyle(),
            ticks: { ...tickStyle(), callback: (v) => '$' + (v / 1000).toFixed(0) + 'k' },
          },
        },
      },
    });
  }

  function updateScatter(comps, subject, outliers) {
    if (!ensureCharts() || !scatterChart) return;

    const compsValid = [];
    const compsOutlier = [];
    for (const c of comps) {
      const rate = Calc.compPricePerSqft(c);
      const sqft = Calc.parseNumber(c.sqft);
      if (!Number.isFinite(rate) || !Number.isFinite(sqft)) continue;
      const point = { x: sqft, y: rate, label: c.address || 'Comp' };
      if (outliers.has(c.id)) compsOutlier.push(point);
      else if (c.included === false) compsValid.push({ ...point, excluded: true });
      else compsValid.push(point);
    }

    const subjectPoints = [];
    const subjSqft = Calc.parseNumber(subject.sqft);
    if (Number.isFinite(subjSqft) && subjSqft > 0) {
      // Place subject at the mean comp rate for visual reference
      const mean = compsValid.concat(compsOutlier).reduce(
        (acc, p) => { acc.sum += p.y; acc.n++; return acc; },
        { sum: 0, n: 0 }
      );
      const refRate = mean.n > 0 ? mean.sum / mean.n : 0;
      subjectPoints.push({ x: subjSqft, y: refRate, label: subject.address || 'Subject' });
    }

    scatterChart.data.datasets = [
      {
        label: 'Comp',
        data: compsValid,
        backgroundColor: COLORS.accentSoft,
        borderColor: COLORS.accent,
        borderWidth: 1.5,
        pointRadius: 5,
        pointStyle: 'circle',
      },
      {
        label: 'Outlier',
        data: compsOutlier,
        backgroundColor: 'rgba(200,160,74,0.2)',
        borderColor: COLORS.warn,
        borderWidth: 1.5,
        pointRadius: 6,
        pointStyle: 'rectRot',
      },
      {
        label: 'Subject',
        data: subjectPoints,
        backgroundColor: COLORS.ink,
        borderColor: COLORS.ink,
        borderWidth: 2,
        pointRadius: 8,
        pointStyle: 'triangle',
      },
    ];
    scatterChart.update('none');
  }

  function updateBar(comps, outliers) {
    if (!ensureCharts() || !barChart) return;
    const valid = comps.filter((c) => {
      const p = Calc.parseNumber(c.price);
      return Number.isFinite(p) && p > 0;
    });
    const labels = valid.map((c, i) => {
      const a = (c.address || '').trim();
      if (!a) return `#${i + 1}`;
      // Compact label: first token before comma, max 14 chars
      const head = a.split(',')[0].trim();
      return head.length > 14 ? head.slice(0, 13) + '…' : head;
    });
    const data = valid.map((c) => Calc.parseNumber(c.price));
    const colors = valid.map((c) => {
      if (outliers.has(c.id)) return 'rgba(200,160,74,0.65)';
      if (c.included === false) return 'rgba(166,163,155,0.25)';
      return 'rgba(194,104,58,0.7)';
    });
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = data;
    barChart.data.datasets[0].backgroundColor = colors;
    barChart.data.datasets[0].borderColor = colors.map((c) => c.replace(/[\d.]+\)$/, '1)'));
    barChart.data.datasets[0].borderWidth = 1;
    barChart.update('none');
  }

  global.Charts = { updateScatter, updateBar };
})(typeof window !== 'undefined' ? window : globalThis);
