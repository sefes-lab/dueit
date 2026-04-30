/** @namespace */
var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

/** Storage key constants */
DueIt.STORAGE_KEYS = {
  ASSIGNMENTS: 'dueit_assignments',
  CLASSES: 'dueit_classes',
  PREFERENCES: 'dueit_preferences',
  SEMESTER_HISTORY: 'dueit_semester_history',
};

/**
 * @param {string} key
 * @returns {any|null} Parsed value or null
 */
DueIt.load = function load(key) {
  try {
    var raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

/**
 * @param {string} key
 * @param {any} data
 * @returns {{ success: boolean, error: string|null }}
 */
DueIt.save = function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true, error: null };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { success: false, error: 'Storage is full. Please export your data and clear old assignments.' };
    }
    return { success: false, error: 'localStorage is unavailable.' };
  }
};

/** Clears all DueIt keys from localStorage */
DueIt.clearAll = function clearAll() {
  try {
    var keys = DueIt.STORAGE_KEYS;
    Object.values(keys).forEach(function (key) { localStorage.removeItem(key); });
  } catch (e) {
    // localStorage unavailable — nothing to clear
  }
};
