import { describe, it, expect } from 'vitest';

// Load all modules in dependency order — they populate globalThis.DueIt
import '../js/storage.js';
import '../js/version.js';
import '../js/validation.js';
import '../js/countdown.js';
import '../js/assignments.js';
import '../js/classes.js';
import '../js/import-export.js';

const D = globalThis.DueIt;

describe('version', () => {
  it('exports APP_VERSION as 0.57', () => {
    expect(D.APP_VERSION).toBe('0.57');
  });

  it('has at least one version history entry', () => {
    expect(D.VERSION_HISTORY.length).toBeGreaterThanOrEqual(1);
    expect(D.VERSION_HISTORY[0]).toHaveProperty('version');
    expect(D.VERSION_HISTORY[0]).toHaveProperty('date');
    expect(D.VERSION_HISTORY[0]).toHaveProperty('description');
  });
});

describe('validation', () => {
  it('rejects empty title', () => {
    const result = D.validateAssignment({ title: '', dueDate: '2026-04-01' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects missing due date', () => {
    const result = D.validateAssignment({ title: 'Test', dueDate: '' });
    expect(result.valid).toBe(false);
  });

  it('accepts valid input', () => {
    const result = D.validateAssignment({ title: 'Test', dueDate: '2026-04-01' });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('validates import data', () => {
    const valid = D.validateImportData({
      version: 1,
      appVersion: '0.1',
      assignments: [],
      classes: [],
      preferences: {},
    });
    expect(valid.valid).toBe(true);
  });

  it('rejects invalid import data', () => {
    const result = D.validateImportData({ foo: 'bar' });
    expect(result.valid).toBe(false);
  });
});

describe('countdown', () => {
  it('returns future countdown in days', () => {
    // Use local dates to avoid timezone offset issues
    const now = new Date(2026, 2, 16, 10, 0, 0); // Mar 16 local
    const result = D.computeCountdown('2026-03-18T12:00:00', now);
    expect(result.isOverdue).toBe(false);
    expect(result.days).toBe(2);
    expect(result.label).toBe('2 days');
  });

  it('returns overdue for past dates', () => {
    const now = new Date(2026, 2, 18, 10, 0, 0); // Mar 18 local
    const result = D.computeCountdown('2026-03-16T12:00:00', now);
    expect(result.isOverdue).toBe(true);
    expect(result.label).toBe('Overdue');
  });

  it('returns Due today for same day', () => {
    const now = new Date(2026, 2, 16, 10, 0, 0); // Mar 16 local
    const result = D.computeCountdown('2026-03-16T12:00:00', now);
    expect(result.label).toBe('Due today');
  });
});

describe('assignments', () => {
  it('adds a valid assignment', () => {
    const result = D.addAssignment([], { title: 'HW1', dueDate: '2026-04-01' });
    expect(result.error).toBeNull();
    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].title).toBe('HW1');
  });

  it('rejects invalid assignment', () => {
    const result = D.addAssignment([], { title: '', dueDate: '' });
    expect(result.error).not.toBeNull();
    expect(result.assignments).toHaveLength(0);
  });

  it('deletes an assignment', () => {
    const { assignments } = D.addAssignment([], { title: 'HW1', dueDate: '2026-04-01' });
    const result = D.deleteAssignment(assignments, assignments[0].id);
    expect(result).toHaveLength(0);
  });

  it('toggles complete and records completedAt timestamp', () => {
    const { assignments } = D.addAssignment([], { title: 'HW1', dueDate: '2026-04-01' });
    const toggled = D.toggleComplete(assignments, assignments[0].id);
    expect(toggled[0].isComplete).toBe(true);
    expect(toggled[0].isTurnedIn).toBe(false);
    expect(toggled[0].completedAt).toBeTruthy();
  });

  it('undoing complete also clears turned-in and timestamps', () => {
    const { assignments } = D.addAssignment([], { title: 'HW1', dueDate: '2026-04-01' });
    const completed = D.toggleComplete(assignments, assignments[0].id);
    const turnedIn = D.toggleTurnedIn(completed, completed[0].id);
    expect(turnedIn[0].isComplete).toBe(true);
    expect(turnedIn[0].isTurnedIn).toBe(true);
    expect(turnedIn[0].turnedInAt).toBeTruthy();
    const undone = D.toggleComplete(turnedIn, turnedIn[0].id);
    expect(undone[0].isComplete).toBe(false);
    expect(undone[0].isTurnedIn).toBe(false);
    expect(undone[0].completedAt).toBeNull();
    expect(undone[0].turnedInAt).toBeNull();
  });

  it('toggles turned-in and records turnedInAt timestamp', () => {
    const { assignments } = D.addAssignment([], { title: 'HW1', dueDate: '2026-04-01' });
    const completed = D.toggleComplete(assignments, assignments[0].id);
    const toggled = D.toggleTurnedIn(completed, completed[0].id);
    expect(toggled[0].isTurnedIn).toBe(true);
    expect(toggled[0].turnedInAt).toBeTruthy();
    const undone = D.toggleTurnedIn(toggled, toggled[0].id);
    expect(undone[0].isTurnedIn).toBe(false);
    expect(undone[0].turnedInAt).toBeNull();
  });

  it('toggles studied for test type assignments', () => {
    const { assignments } = D.addAssignment([], { title: 'Math Test', type: 'test', dueDate: '2026-04-01' });
    expect(assignments[0].type).toBe('test');
    const studied = D.toggleStudied(assignments, assignments[0].id);
    expect(studied[0].isStudied).toBe(true);
    expect(studied[0].studiedAt).toBeTruthy();
    const unstudied = D.toggleStudied(studied, studied[0].id);
    expect(unstudied[0].isStudied).toBe(false);
    expect(unstudied[0].studiedAt).toBeNull();
  });

  it('sorts by due date ascending', () => {
    const a1 = D.addAssignment([], { title: 'Later', dueDate: '2026-05-01' });
    const a2 = D.addAssignment(a1.assignments, { title: 'Sooner', dueDate: '2026-04-01' });
    const sorted = D.sortByDueDate(a2.assignments);
    expect(sorted[0].title).toBe('Sooner');
    expect(sorted[1].title).toBe('Later');
  });
});

describe('classes', () => {
  it('adds a class', () => {
    const result = D.addClass([], 'Math');
    expect(result.error).toBeNull();
    expect(result.classes).toEqual(['Math']);
  });

  it('rejects duplicate class', () => {
    const result = D.addClass(['Math'], 'Math');
    expect(result.error).not.toBeNull();
  });

  it('renames a class and propagates', () => {
    const assignments = [{ id: '1', className: 'Math', title: 'HW', dueDate: '2026-04-01', isComplete: false, isTurnedIn: false }];
    const result = D.renameClass(['Math'], assignments, 'Math', 'Algebra');
    expect(result.classes).toEqual(['Algebra']);
    expect(result.assignments[0].className).toBe('Algebra');
  });

  it('removes a class and unclassifies', () => {
    const assignments = [{ id: '1', className: 'Math', title: 'HW', dueDate: '2026-04-01', isComplete: false, isTurnedIn: false }];
    const result = D.removeClass(['Math'], assignments, 'Math');
    expect(result.classes).toEqual([]);
    expect(result.assignments[0].className).toBe('Unclassified');
  });
});

describe('import-export', () => {
  it('round-trips planner data', () => {
    const data = {
      assignments: [{ id: 'abc', title: 'HW1', className: 'Math', dueDate: '2026-04-01', isComplete: false, isTurnedIn: false, createdAt: '2026-03-16', updatedAt: '2026-03-16' }],
      classes: ['Math'],
      preferences: {},
    };
    const json = D.serializePlannerData(data);
    const result = D.deserializePlannerData(json);
    expect(result.error).toBeNull();
    expect(result.data.assignments).toEqual(data.assignments);
    expect(result.data.classes).toEqual(data.classes);
    expect(result.data.appVersion).toBe(D.APP_VERSION);
  });

  it('rejects invalid JSON', () => {
    const result = D.deserializePlannerData('not json');
    expect(result.error).not.toBeNull();
  });
});
