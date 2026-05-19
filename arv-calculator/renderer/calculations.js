/**
 * ARV calculation engine. All functions are pure — they take inputs and return
 * results with no side effects, which keeps them straightforward to unit-test.
 */
(function (global) {
  'use strict';

  const MS_PER_DAY = 86400000;

  function parseNumber(value) {
    if (value === null || value === undefined) return NaN;
    if (typeof value === 'number') return value;
    const cleaned = String(value).replace(/[$,\s]/g, '');
    if (cleaned === '' || cleaned === '-') return NaN;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function formatCurrency(value, opts = {}) {
    if (!Number.isFinite(value)) return '—';
    const { decimals = 0, signed = false } = opts;
    const abs = Math.abs(value);
    const str = abs.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const sign = value < 0 ? '-' : signed ? '+' : '';
    return `${sign}$${str}`;
  }

  function formatNumber(value, decimals = 0) {
    if (!Number.isFinite(value)) return '—';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function formatPercent(value, decimals = 1) {
    if (!Number.isFinite(value)) return '—';
    return `${value.toFixed(decimals)}%`;
  }

  function daysBetween(a, b) {
    const t1 = new Date(a).getTime();
    const t2 = new Date(b).getTime();
    if (!Number.isFinite(t1) || !Number.isFinite(t2)) return NaN;
    return Math.abs(t2 - t1) / MS_PER_DAY;
  }

  function compPricePerSqft(comp) {
    const price = parseNumber(comp.price);
    const sqft = parseNumber(comp.sqft);
    if (!Number.isFinite(price) || !Number.isFinite(sqft) || sqft <= 0) return NaN;
    return price / sqft;
  }

  function compAdjustedPrice(comp) {
    const price = parseNumber(comp.price);
    if (!Number.isFinite(price)) return NaN;
    const adjustments = comp.adjustments || {};
    const netAdj = Object.values(adjustments).reduce((sum, v) => {
      const n = parseNumber(v);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    return price + netAdj;
  }

  function netAdjustment(comp) {
    const adjustments = comp.adjustments || {};
    return Object.values(adjustments).reduce((sum, v) => {
      const n = parseNumber(v);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }

  /**
   * Method 1: Simple average $/sqft.
   */
  function method1AvgPerSqft(comps, subjectSqft) {
    const rates = comps
      .filter((c) => c.included !== false)
      .map(compPricePerSqft)
      .filter(Number.isFinite);
    if (rates.length === 0 || !subjectSqft) return { arv: NaN, rate: NaN, count: 0 };
    const rate = rates.reduce((a, b) => a + b, 0) / rates.length;
    return { arv: rate * subjectSqft, rate, count: rates.length };
  }

  /**
   * Method 2: Weighted by recency (months since sale) and size similarity.
   */
  function method2Weighted(comps, subjectSqft, referenceDate = new Date()) {
    const included = comps.filter((c) => c.included !== false);
    if (included.length === 0 || !subjectSqft) return { arv: NaN, rate: NaN, count: 0 };

    let weightedRate = 0;
    let totalWeight = 0;
    let count = 0;

    for (const comp of included) {
      const rate = compPricePerSqft(comp);
      const sqft = parseNumber(comp.sqft);
      if (!Number.isFinite(rate) || !Number.isFinite(sqft) || sqft <= 0) continue;

      // Recency weight
      let recencyW = 0.5;
      if (comp.saleDate) {
        const days = daysBetween(comp.saleDate, referenceDate);
        if (Number.isFinite(days)) {
          if (days <= 90) recencyW = 1.0;
          else if (days <= 180) recencyW = 0.75;
          else if (days <= 365) recencyW = 0.5;
          else recencyW = 0.25;
        }
      }

      // Size similarity weight: 1.0 when same sqft, decays linearly.
      const sizeDiff = Math.abs(sqft - subjectSqft) / subjectSqft;
      const sizeW = Math.max(0.2, 1 - sizeDiff);

      const w = recencyW * sizeW;
      weightedRate += rate * w;
      totalWeight += w;
      count++;
    }

    if (totalWeight === 0) return { arv: NaN, rate: NaN, count: 0 };
    const rate = weightedRate / totalWeight;
    return { arv: rate * subjectSqft, rate, count };
  }

  /**
   * Method 3: Adjusted comps — apply user $ adjustments, average the adjusted
   * prices, then normalize against the subject's living area.
   */
  function method3Adjusted(comps, subjectSqft) {
    const included = comps.filter((c) => c.included !== false);
    if (included.length === 0 || !subjectSqft) return { arv: NaN, rate: NaN, count: 0 };

    const adjustedRates = [];
    for (const comp of included) {
      const adjPrice = compAdjustedPrice(comp);
      const sqft = parseNumber(comp.sqft);
      if (!Number.isFinite(adjPrice) || !Number.isFinite(sqft) || sqft <= 0) continue;
      adjustedRates.push(adjPrice / sqft);
    }
    if (adjustedRates.length === 0) return { arv: NaN, rate: NaN, count: 0 };
    const rate = adjustedRates.reduce((a, b) => a + b, 0) / adjustedRates.length;
    return { arv: rate * subjectSqft, rate, count: adjustedRates.length };
  }

  /**
   * Run all three methods, return { m1, m2, m3, low, mid, high }.
   * Mid = average of the three; low/high = min/max.
   */
  function computeARV(comps, subject) {
    const subjectSqft = parseNumber(subject.sqft);
    const m1 = method1AvgPerSqft(comps, subjectSqft);
    const m2 = method2Weighted(comps, subjectSqft);
    const m3 = method3Adjusted(comps, subjectSqft);

    const arvs = [m1.arv, m2.arv, m3.arv].filter(Number.isFinite);
    let low = NaN, mid = NaN, high = NaN;
    if (arvs.length > 0) {
      low = Math.min(...arvs);
      high = Math.max(...arvs);
      mid = arvs.reduce((a, b) => a + b, 0) / arvs.length;
    }
    return { m1, m2, m3, low, mid, high };
  }

  /**
   * Investor math from the ARV mid estimate.
   */
  function computeInvestorMath(arv, subject) {
    const purchase = parseNumber(subject.price) || 0;
    const rehab = parseNumber(subject.rehab) || 0;
    const closingPct = parseNumber(subject.closingPct);
    const closingRate = Number.isFinite(closingPct) ? closingPct / 100 : 0.10;

    let mao70 = NaN, mao75 = NaN, profit = NaN, roi = NaN, cash = NaN, closingHolding = NaN;

    if (Number.isFinite(arv)) {
      mao70 = arv * 0.70 - rehab;
      mao75 = arv * 0.75 - rehab;
      closingHolding = arv * closingRate;
      profit = arv - purchase - rehab - closingHolding;
      cash = purchase + rehab + closingHolding;
      if (cash > 0) roi = (profit / cash) * 100;
    }

    return { mao70, mao75, profit, roi, cash, closingHolding };
  }

  /**
   * Deal quality: green / yellow / red. Based on profit margin and 70% rule.
   */
  function computeDealQuality(arv, math, subject) {
    if (!Number.isFinite(arv) || !Number.isFinite(math.profit)) {
      return { level: 'neutral', label: 'NO DATA' };
    }
    const purchase = parseNumber(subject.price) || 0;
    const margin = arv > 0 ? math.profit / arv : 0;
    const meetsRule = purchase > 0 && purchase <= math.mao70;

    if (margin >= 0.20 && meetsRule) return { level: 'good', label: 'GOOD DEAL' };
    if (margin >= 0.10) return { level: 'warn', label: 'MARGINAL' };
    return { level: 'bad', label: 'PASS' };
  }

  /**
   * Identify outlier comps by $/sqft (> 1.5 std deviations from mean).
   */
  function detectOutliers(comps) {
    const ratesById = new Map();
    const rates = [];
    for (const comp of comps) {
      const r = compPricePerSqft(comp);
      if (Number.isFinite(r)) {
        ratesById.set(comp.id, r);
        rates.push(r);
      }
    }
    if (rates.length < 3) return new Set();
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    const variance = rates.reduce((s, v) => s + (v - mean) ** 2, 0) / rates.length;
    const std = Math.sqrt(variance);
    if (std === 0) return new Set();
    const outliers = new Set();
    for (const [id, rate] of ratesById) {
      if (Math.abs(rate - mean) > 1.5 * std) outliers.add(id);
    }
    return outliers;
  }

  const API = {
    parseNumber,
    formatCurrency,
    formatNumber,
    formatPercent,
    daysBetween,
    compPricePerSqft,
    compAdjustedPrice,
    netAdjustment,
    method1AvgPerSqft,
    method2Weighted,
    method3Adjusted,
    computeARV,
    computeInvestorMath,
    computeDealQuality,
    detectOutliers,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  global.Calc = API;
})(typeof window !== 'undefined' ? window : globalThis);
