var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

/**
 * Computes countdown display from a due date and reference time.
 * Counts by calendar days only (no hours).
 * @param {string} dueDateISO - ISO 8601 date string
 * @param {Date} now - Reference time
 * @returns {{ isOverdue: boolean, days: number, label: string }}
 */
DueIt.computeCountdown = function computeCountdown(dueDateISO, now) {
  // Parse as local date to avoid UTC offset shifting the day
  var parts = dueDateISO.slice(0, 10).split('-');
  var dueDay = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var diffDays = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { isOverdue: true, days: 0, label: 'Overdue' };
  }
  if (diffDays === 0) {
    return { isOverdue: false, days: 0, label: 'Due today' };
  }
  if (diffDays === 1) {
    return { isOverdue: false, days: 1, label: '1 day' };
  }
  return { isOverdue: false, days: diffDays, label: diffDays + ' days' };
};
