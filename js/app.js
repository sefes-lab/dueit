var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

(function () {
  var DEFAULT_CLASSES = ['Spanish', 'Language Arts', 'US History', 'Choir', 'Math', 'Science'];
  var ACCENT_COLORS = ['blue', 'pink', 'green', 'purple', 'orange', 'teal'];
  var CLASS_COLORS = ['#4a6cf7','#ff6b6b','#00b894','#6c5ce7','#e17055','#00cec9','#fdcb6e','#e84393','#636e72','#2d3436'];
  var EMPTY_STATES = [
    '📚✨ No assignments yet — enjoy the free time!',
    '🎉 All clear! Add an assignment to get started.',
    '🌈 Nothing due — what a great day!',
    '🚀 Ready for liftoff! Add your first assignment.',
    '☀️ No homework? Must be a good day!',
  ];
  var state = { assignments: [], classes: [], preferences: {} };
  var storageAvailable = true;
  var confirmResolve = null;
  var calendarMode = false;

  function loadState() {
    try {
      localStorage.setItem('__dueit_test__', '1');
      localStorage.removeItem('__dueit_test__');
    } catch (e) {
      storageAvailable = false;
      document.getElementById('storage-warning').hidden = false;
      return;
    }
    state.assignments = DueIt.load(DueIt.STORAGE_KEYS.ASSIGNMENTS) || [];
    state.classes = DueIt.load(DueIt.STORAGE_KEYS.CLASSES);
    state.preferences = DueIt.load(DueIt.STORAGE_KEYS.PREFERENCES) || {};

    // Seed defaults on first run (no classes saved yet)
    var needsPersist = false;
    if (state.classes === null || state.classes.length === 0) {
      state.classes = DEFAULT_CLASSES;
      needsPersist = true;
    }
    if (!state.preferences.studentName) {
      state.preferences.studentName = 'April Shterling';
      state.preferences.studentGrade = '8';
      needsPersist = true;
    }
    if (needsPersist) {
      persist();
    }
  }

  function persist() {
    if (!storageAvailable) return;
    DueIt.save(DueIt.STORAGE_KEYS.ASSIGNMENTS, state.assignments);
    DueIt.save(DueIt.STORAGE_KEYS.CLASSES, state.classes);
    DueIt.save(DueIt.STORAGE_KEYS.PREFERENCES, state.preferences);
  }

  function renderAll() {
    DueIt.renderTracker(state.assignments, new Date(), getClassColor);
    DueIt.renderClassDropdown(state.classes);
    DueIt.renderClassManager(state.classes);
    renderStreak();
    updateTitle();
    updateCalendarVisibility();
  }

  function updateCalendarVisibility() {
    var listEl = document.getElementById('tracker-list');
    var calEl = document.getElementById('calendar-view');
    var btn = document.getElementById('calendar-toggle-btn');
    if (calendarMode) {
      listEl.hidden = true;
      calEl.hidden = false;
      btn.textContent = '📋';
      btn.title = 'List view';
      DueIt.renderCalendar(calEl, state.assignments, getClassColor);
    } else {
      listEl.hidden = false;
      calEl.hidden = true;
      btn.textContent = '📅';
      btn.title = 'Calendar view';
    }
  }

  function updateTitle() {
    var name = (state.preferences.studentName || '').trim();
    var titleEl = document.getElementById('app-title');
    var first = name.split(' ')[0];
    if (first) {
      titleEl.textContent = first + "'s DueIt";
      document.title = first + "'s DueIt — Homework Planner";
    } else {
      titleEl.textContent = 'DueIt';
      document.title = 'DueIt — Homework Planner';
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    state.preferences.theme = theme;
    persist();
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function applyAccent(accent) {
    if (ACCENT_COLORS.indexOf(accent) === -1) accent = 'blue';
    document.documentElement.setAttribute('data-accent', accent);
    state.preferences.accent = accent;
    // Update active swatch
    var swatches = document.querySelectorAll('.color-swatch');
    for (var i = 0; i < swatches.length; i++) {
      swatches[i].classList.toggle('active', swatches[i].dataset.accent === accent);
    }
    persist();
  }

  function getClassColor(className) {
    var idx = state.classes.indexOf(className);
    if (idx === -1) idx = 0;
    return CLASS_COLORS[idx % CLASS_COLORS.length];
  }

  function computeStreak(assignments) {
    var turnedInDates = [];
    assignments.forEach(function (a) {
      if (a.turnedInAt) {
        var d = new Date(a.turnedInAt);
        var key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        if (turnedInDates.indexOf(key) === -1) turnedInDates.push(key);
      }
    });
    if (turnedInDates.length === 0) return 0;
    // Check consecutive days ending today or yesterday
    var today = new Date();
    var streak = 0;
    for (var offset = 0; offset < 365; offset++) {
      var check = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      var key = check.getFullYear() + '-' + (check.getMonth() + 1) + '-' + check.getDate();
      if (turnedInDates.indexOf(key) !== -1) {
        streak++;
      } else if (offset > 0) {
        break;
      }
    }
    return streak;
  }

  function renderStreak() {
    var el = document.getElementById('streak-banner');
    if (!el) return;
    var streak = computeStreak(state.assignments);
    if (streak >= 2) {
      el.innerHTML = '<div class="streak-banner">🔥 ' + streak + '-day turn-in streak!</div>';
    } else {
      el.innerHTML = '';
    }
  }

  function spawnConfetti() {
    var container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    var colors = ['#ff6b6b','#fdcb6e','#00b894','#6c5ce7','#00cec9','#e17055'];
    for (var i = 0; i < 30; i++) {
      var piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.top = Math.random() * 40 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = (Math.random() * 0.5) + 's';
      piece.style.animationDuration = (1 + Math.random()) + 's';
      container.appendChild(piece);
    }
    setTimeout(function () { container.remove(); }, 2500);
  }

  function showConfirm(message) {
    return new Promise(function (resolve) {
      confirmResolve = resolve;
      document.getElementById('confirm-message').textContent = message;
      document.getElementById('confirm-dialog').showModal();
    });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    DueIt.clearFieldErrors();
    var editId = document.getElementById('edit-id').value;
    var input = {
      title: document.getElementById('title').value,
      type: document.getElementById('assignmentType').value,
      className: document.getElementById('className').value,
      dueDate: document.getElementById('dueDate').value,
    };
    var result;
    if (editId) {
      result = DueIt.updateAssignment(state.assignments, editId, input);
    } else {
      result = DueIt.addAssignment(state.assignments, input);
    }
    if (result.error) {
      result.error.errors.forEach(function (msg) {
        if (msg.toLowerCase().indexOf('title') !== -1) DueIt.showFieldError('title', msg);
        if (msg.toLowerCase().indexOf('due date') !== -1) DueIt.showFieldError('dueDate', msg);
      });
      return;
    }
    state.assignments = result.assignments;
    persist();
    DueIt.clearForm();
    renderAll();
  }

  function handleTrackerClick(e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var id = btn.dataset.id;
    if (!id) return;

    if (btn.classList.contains('toggle-complete-btn')) {
      state.assignments = DueIt.toggleComplete(state.assignments, id);
      persist(); renderAll();
    } else if (btn.classList.contains('toggle-turned-in-btn')) {
      var wasTurnedIn = state.assignments.filter(function (a) { return a.id === id; })[0];
      state.assignments = DueIt.toggleTurnedIn(state.assignments, id);
      persist(); renderAll();
      if (wasTurnedIn && !wasTurnedIn.isTurnedIn) spawnConfetti();
    } else if (btn.classList.contains('toggle-studied-btn')) {
      state.assignments = DueIt.toggleStudied(state.assignments, id);
      persist(); renderAll();
    } else if (btn.classList.contains('edit-btn')) {
      var assignment = state.assignments.filter(function (a) { return a.id === id; })[0];
      if (assignment) {
        DueIt.populateFormForEdit(assignment);
        DueIt.renderClassDropdown(state.classes);
        document.getElementById('className').value = assignment.className;
        document.getElementById('assignmentType').value = assignment.type || 'homework';
        document.getElementById('assignment-form-section').scrollIntoView({ behavior: 'smooth' });
      }
    } else if (btn.classList.contains('delete-btn')) {
      showConfirm('Are you sure you want to delete this assignment?').then(function (confirmed) {
        if (confirmed) {
          state.assignments = DueIt.deleteAssignment(state.assignments, id);
          persist(); renderAll();
        }
      });
    }
  }

  function handleAddClass() {
    var input = document.getElementById('new-class-name');
    var errorEl = document.getElementById('class-error');
    errorEl.textContent = '';
    var result = DueIt.addClass(state.classes, input.value);
    if (result.error) { errorEl.textContent = result.error; return; }
    state.classes = result.classes;
    input.value = '';
    persist(); renderAll();
  }

  function handleClassListClick(e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var name = btn.dataset.name;
    if (!name) return;
    if (btn.classList.contains('rename-class-btn')) {
      var newName = prompt('Rename "' + name + '" to:', name);
      if (newName !== null && newName.trim() !== '' && newName.trim() !== name) {
        var result = DueIt.renameClass(state.classes, state.assignments, name, newName);
        state.classes = result.classes;
        state.assignments = result.assignments;
        persist(); renderAll();
      }
    } else if (btn.classList.contains('remove-class-btn')) {
      showConfirm('Remove class "' + name + '"? Assignments in this class will become Unclassified.').then(function (confirmed) {
        if (confirmed) {
          var result = DueIt.removeClass(state.classes, state.assignments, name);
          state.classes = result.classes;
          state.assignments = result.assignments;
          persist(); renderAll();
        }
      });
    }
  }

  function handleSaveProfile() {
    state.preferences.studentName = document.getElementById('student-name').value.trim();
    state.preferences.studentGrade = document.getElementById('student-grade').value.trim();
    persist();
    renderAll();
  }

  function buildPrintableHtml() {
    var name = (state.preferences.studentName || '').trim();
    var grade = (state.preferences.studentGrade || '').trim();
    var first = name.split(' ')[0];
    var heading = first ? first + "'s Assignments" : 'My Assignments';
    var subtitle = name && grade ? name + ' — Grade ' + grade : (name || '');
    var now = new Date();
    var sorted = DueIt.sortByDueDate(state.assignments);

    var rows = sorted.map(function (a) {
      var cd = DueIt.computeCountdown(a.dueDate, now);
      var typeIcons = { homework: '📝', test: '📋', reading: '📖', project: '🎨' };
      var typeLabel = typeIcons[a.type || 'homework'] || '📝';
      var isTest = (a.type === 'test');
      var status;
      if (isTest) {
        status = a.isStudied ? 'Studied' : 'Not Studied';
      } else {
        status = a.isTurnedIn ? 'Turned In' : (a.isComplete ? 'Done' : 'Pending');
      }
      var due = new Date(a.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      var doneDate = '';
      if (isTest && a.studiedAt) {
        doneDate = new Date(a.studiedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (!isTest && a.completedAt) {
        doneDate = new Date(a.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }
      var turnedInDate = a.turnedInAt ? new Date(a.turnedInAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      return '<tr>' +
        '<td>' + typeLabel + '</td>' +
        '<td>' + _esc(a.className) + '</td>' +
        '<td>' + _esc(a.title) + '</td>' +
        '<td>' + due + '</td>' +
        '<td>' + cd.label + '</td>' +
        '<td>' + status + '</td>' +
        '<td>' + doneDate + '</td>' +
        '<td>' + (isTest ? '' : turnedInDate) + '</td>' +
      '</tr>';
    }).join('\n');

    return '<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"/>' +
      '<title>' + _esc(heading) + '</title>' +
      '<style>' +
        'body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:2rem;color:#2d3436}' +
        'h1{font-size:1.4rem;margin-bottom:0.25rem}' +
        '.subtitle{color:#636e72;margin-bottom:0.5rem;font-size:0.9rem}' +
        '.date{color:#636e72;font-size:0.8rem;margin-bottom:1rem}' +
        'table{width:100%;border-collapse:collapse;font-size:0.9rem}' +
        'th,td{text-align:left;padding:0.4rem 0.6rem;border-bottom:1px solid #dfe6e9}' +
        'th{background:#f4f6f8;font-weight:600}' +
        'tr.overdue td:nth-child(4){color:#e74c3c;font-weight:600}' +
      '</style></head><body>' +
      '<h1>' + _esc(heading) + '</h1>' +
      (subtitle ? '<p class="subtitle">' + _esc(subtitle) + '</p>' : '') +
      '<p class="date">Printed ' + now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) + '</p>' +
      '<table><thead><tr><th>Type</th><th>Class</th><th>Assignment</th><th>Due Date</th><th>Countdown</th><th>Status</th><th>Done</th><th>Turned In</th></tr></thead>' +
      '<tbody>' + (rows || '<tr><td colspan="8" style="text-align:center;padding:1rem">No assignments</td></tr>') + '</tbody></table>' +
      '</body></html>';
  }

  function _esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function handlePrint() {
    var html = buildPrintableHtml();
    var win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  function handleExport() {
    DueIt.triggerExportDownload({
      assignments: state.assignments,
      classes: state.classes,
      preferences: state.preferences,
    });
  }

  function handleImport(e) {
    var file = e.target.files[0];
    if (!file) return;
    DueIt.readFileAsText(file).then(function (text) {
      var result = DueIt.deserializePlannerData(text);
      if (result.error) {
        alert(result.error);
        e.target.value = '';
        return;
      }
      showConfirm('Importing will replace all current data. Continue?').then(function (confirmed) {
        if (!confirmed) { e.target.value = ''; return; }
        state.assignments = result.data.assignments;
        state.classes = result.data.classes;
        state.preferences = result.data.preferences || {};
        persist(); renderAll();
        if (state.preferences.theme) applyTheme(state.preferences.theme);
        e.target.value = '';
      });
    }).catch(function () {
      alert('Could not read the selected file.');
      e.target.value = '';
    });
  }

  function init() {
    loadState();
    applyTheme(state.preferences.theme || 'light');
    applyAccent(state.preferences.accent || 'blue');
    renderAll();
    document.getElementById('footer-version').textContent = 'DueIt v' + DueIt.APP_VERSION;

    document.getElementById('assignment-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('form-cancel-btn').addEventListener('click', function () { DueIt.clearForm(); });
    document.getElementById('tracker-list').addEventListener('click', handleTrackerClick);
    document.getElementById('add-class-btn').addEventListener('click', handleAddClass);
    document.getElementById('class-list').addEventListener('click', handleClassListClick);
    document.getElementById('save-profile-btn').addEventListener('click', handleSaveProfile);
    document.getElementById('print-btn').addEventListener('click', handlePrint);
    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('import-file').addEventListener('change', handleImport);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    document.getElementById('calendar-toggle-btn').addEventListener('click', function () {
      calendarMode = !calendarMode;
      if (calendarMode) DueIt.resetCalendarView();
      updateCalendarVisibility();
    });

    document.getElementById('color-picker').addEventListener('click', function (e) {
      var swatch = e.target.closest('.color-swatch');
      if (swatch && swatch.dataset.accent) applyAccent(swatch.dataset.accent);
    });

    document.getElementById('settings-open-btn').addEventListener('click', function () {
      DueIt.renderClassManager(state.classes);
      document.getElementById('student-name').value = state.preferences.studentName || '';
      document.getElementById('student-grade').value = state.preferences.studentGrade || '';
      document.getElementById('settings-dialog').showModal();
    });
    document.getElementById('settings-close-btn').addEventListener('click', function () {
      document.getElementById('settings-dialog').close();
    });

    document.getElementById('confirm-ok').addEventListener('click', function () {
      document.getElementById('confirm-dialog').close();
      if (confirmResolve) { confirmResolve(true); confirmResolve = null; }
    });
    document.getElementById('confirm-cancel').addEventListener('click', function () {
      document.getElementById('confirm-dialog').close();
      if (confirmResolve) { confirmResolve(false); confirmResolve = null; }
    });

    setInterval(function () { DueIt.renderTracker(state.assignments, new Date()); }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
