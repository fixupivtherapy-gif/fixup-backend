/**
 * LocalStorage wrapper for deal persistence.
 */
(function (global) {
  'use strict';

  const KEY = 'arv-terminal:deals';
  const SCHEMA_VERSION = 1;

  function readAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.deals)) return [];
      return parsed.deals;
    } catch (e) {
      console.error('storage read failed', e);
      return [];
    }
  }

  function writeAll(deals) {
    localStorage.setItem(KEY, JSON.stringify({ version: SCHEMA_VERSION, deals }));
  }

  function uuid() {
    if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    return 'd-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function list() {
    return readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  function get(id) {
    return readAll().find((d) => d.id === id) || null;
  }

  function save(deal) {
    const deals = readAll();
    const now = Date.now();
    const idx = deals.findIndex((d) => d.id === deal.id);
    const next = { ...deal, updatedAt: now };
    if (idx >= 0) {
      next.createdAt = deals[idx].createdAt || now;
      deals[idx] = next;
    } else {
      next.id = next.id || uuid();
      next.createdAt = now;
      deals.push(next);
    }
    writeAll(deals);
    return next;
  }

  function remove(id) {
    writeAll(readAll().filter((d) => d.id !== id));
  }

  function duplicate(id) {
    const orig = get(id);
    if (!orig) return null;
    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = uuid();
    copy.name = (orig.name || 'Untitled') + ' (copy)';
    copy.createdAt = Date.now();
    copy.updatedAt = Date.now();
    const deals = readAll();
    deals.push(copy);
    writeAll(deals);
    return copy;
  }

  function seedIfEmpty(samples) {
    const existing = readAll();
    if (existing.length > 0) return;
    const now = Date.now();
    const seeded = samples.map((s, i) => ({
      ...s,
      id: uuid(),
      createdAt: now - (samples.length - i) * 1000,
      updatedAt: now - (samples.length - i) * 1000,
    }));
    writeAll(seeded);
  }

  global.Storage = { list, get, save, remove, duplicate, seedIfEmpty, uuid };
})(typeof window !== 'undefined' ? window : globalThis);
