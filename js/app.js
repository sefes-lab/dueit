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
  var state = { assignments: [], classes: [], preferences: {}, semesterData: {} };
  var storageAvailable = true;
  var confirmResolve = null;
  var calendarMode = false;
  var lastLevel = 0;

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
    state.semesterData = DueIt.load(DueIt.STORAGE_KEYS.SEMESTER_HISTORY) || { history: [], rolloverXP: 0, semesterCount: 0 };

    // Migrate legacy semester data from preferences if present
    if (state.preferences.semesterHistory || state.preferences.rolloverXP || state.preferences.semesterCount) {
      if (state.preferences.semesterHistory) state.semesterData.history = state.preferences.semesterHistory;
      if (state.preferences.rolloverXP) state.semesterData.rolloverXP = state.preferences.rolloverXP;
      if (state.preferences.semesterCount) state.semesterData.semesterCount = state.preferences.semesterCount;
      delete state.preferences.semesterHistory;
      delete state.preferences.rolloverXP;
      delete state.preferences.semesterCount;
    }

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
    // Initialize level tracking so page load doesn't trigger level-up toast
    lastLevel = DueIt.computeLevel(DueIt.computeXP(state.assignments, state.semesterData.rolloverXP)).level;
  }

  function persist() {
    if (!storageAvailable) return;
    DueIt.save(DueIt.STORAGE_KEYS.ASSIGNMENTS, state.assignments);
    DueIt.save(DueIt.STORAGE_KEYS.CLASSES, state.classes);
    DueIt.save(DueIt.STORAGE_KEYS.PREFERENCES, state.preferences);
    DueIt.save(DueIt.STORAGE_KEYS.SEMESTER_HISTORY, state.semesterData);
  }

  function renderAll() {
    DueIt.renderTracker(state.assignments, new Date(), getClassColor);
    DueIt.renderClassDropdown(state.classes);
    DueIt.renderClassManager(state.classes);
    renderStreak();
    renderXPBar();
    renderWeeklyStats();
    renderBadges();
    renderProgressSummary();
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
  function applyMode(mode) {
    if (mode !== 'parent') mode = 'student';
    state.preferences.mode = mode;
    var pill = document.getElementById('mode-toggle-btn');
    if (mode === 'parent') {
      document.body.classList.add('parent-mode');
      pill.textContent = 'Parent';
      pill.title = 'Switch to Student mode';
      pill.setAttribute('aria-label', 'Switch to Student mode');
    } else {
      document.body.classList.remove('parent-mode');
      pill.textContent = 'Student';
      pill.title = 'Switch to Parent mode';
      pill.setAttribute('aria-label', 'Switch to Parent mode');
    }
    persist();
  }

  var FONT_MAP = {
      'system':       { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', url: null },
      'nunito':       { family: '"Nunito", sans-serif',       url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap' },
      'patrick-hand': { family: '"Patrick Hand", cursive',    url: 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap' },
      'baloo-2':      { family: '"Baloo 2", cursive',         url: 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700&display=swap' },
      'quicksand':    { family: '"Quicksand", sans-serif',    url: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap' },
      'comic-neue':   { family: '"Comic Neue", cursive',      url: 'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap' },
    };

    function applyFont(fontKey) {
      var font = FONT_MAP[fontKey];
      if (!font) { fontKey = 'system'; font = FONT_MAP.system; }

      // Load Google Font if needed
      if (font.url) {
        var linkId = 'gfont-' + fontKey;
        if (!document.getElementById(linkId)) {
          var link = document.createElement('link');
          link.id = linkId;
          link.rel = 'stylesheet';
          link.href = font.url;
          document.head.appendChild(link);
        }
      }

      document.documentElement.style.setProperty('--font-family', font.family);
      state.preferences.font = fontKey;
      var picker = document.getElementById('font-picker');
      if (picker) picker.value = fontKey;
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

  function renderXPBar() {
    var el = document.getElementById('xp-bar-container');
    if (!el) return;
    var xp = DueIt.computeXP(state.assignments, state.semesterData.rolloverXP);
    var info = DueIt.computeLevel(xp);

    // Detect level-up
    if (lastLevel > 0 && info.level > lastLevel && state.preferences.mode !== 'parent') {
      showLevelUpToast(info.level, info.title);
      setTimeout(function () {
        var wrapper = el.querySelector('.xp-bar-wrapper');
        if (wrapper) wrapper.classList.add('level-up');
        setTimeout(function () {
          if (wrapper) wrapper.classList.remove('level-up');
        }, 1200);
      }, 50);
    }
    lastLevel = info.level;

    var pct = Math.round(info.progress * 100);
    var xpLabel = info.isMaxLevel
      ? info.xp + ' XP (MAX)'
      : info.xp + ' / ' + info.xpForNext + ' XP';

    el.innerHTML =
      '<div class="xp-bar-wrapper">' +
        '<div class="xp-header">' +
          '<span class="xp-level">Lv. ' + info.level + ' <span class="xp-title">' + _esc(info.title) + '</span></span>' +
          '<span class="xp-count">' + xpLabel + '</span>' +
        '</div>' +
        '<div class="xp-track"><div class="xp-fill" style="width:' + pct + '%"></div></div>' +
      '</div>';
  }

  function renderWeeklyStats() {
    var el = document.getElementById('weekly-stats-container');
    if (!el) return;
    var stats = DueIt.computeWeeklyStats(state.assignments);
    if (stats.total === 0) { el.innerHTML = ''; return; }
    el.innerHTML =
      '<div class="weekly-stats">' +
        '<div class="weekly-stat">' +
          '<span class="weekly-stat-value">' + stats.completed + '/' + stats.total + '</span>' +
          '<span class="weekly-stat-label">Done</span>' +
        '</div>' +
        '<div class="weekly-stat">' +
          '<span class="weekly-stat-value">' + stats.turnedIn + '</span>' +
          '<span class="weekly-stat-label">Turned In</span>' +
        '</div>' +
        '<div class="weekly-stat">' +
          '<span class="weekly-stat-value">' + stats.completionRate + '%</span>' +
          '<span class="weekly-stat-label">This Week</span>' +
        '</div>' +
      '</div>';
  }

  function renderBadges() {
    var el = document.getElementById('badges-grid');
    if (!el) return;
    var badges = DueIt.computeBadges(state.assignments);
    el.innerHTML = badges.map(function (b) {
      var cls = b.unlocked ? 'badge-card unlocked' : 'badge-card locked';
      if (b.tier >= 4) cls += ' badge-tier-4';
      else if (b.tier >= 3) cls += ' badge-tier-3';
      else if (b.tier >= 2) cls += ' badge-tier-2';
      else if (b.tier >= 1) cls += ' badge-tier-1';
      var tierHtml = b.tierLabel ? '<span class="badge-tier" style="color:' + b.tierColor + '">' + b.tierLabel + '</span>' : '';
      return '<div class="' + cls + '" title="' + _esc(b.desc) + '">' +
        '<span class="badge-emoji">' + b.emoji + '</span>' +
        '<span class="badge-name">' + _esc(b.name) + '</span>' +
        tierHtml +
        '<span class="badge-desc">' + _esc(b.desc) + '</span>' +
      '</div>';
    }).join('');
  }

  function renderProgressSummary() {
    var el = document.getElementById('progress-summary');
    if (!el) return;
    if (state.preferences.mode !== 'parent') { el.innerHTML = ''; return; }
    var now = new Date();
    var total = state.assignments.length;
    var completed = state.assignments.filter(function (a) { return a.isComplete || a.isStudied; }).length;
    var overdue = state.assignments.filter(function (a) {
      var isDone = a.isComplete || a.isStudied;
      if (isDone) return false;
      return new Date(a.dueDate + 'T23:59:59') < now;
    }).length;
    el.innerHTML =
      '<div class="progress-stat">' +
        '<span class="progress-stat-value">' + total + '</span>' +
        '<span class="progress-stat-label">Total</span>' +
      '</div>' +
      '<div class="progress-stat">' +
        '<span class="progress-stat-value">' + completed + '</span>' +
        '<span class="progress-stat-label">Completed</span>' +
      '</div>' +
      '<div class="progress-stat">' +
        '<span class="progress-stat-value">' + overdue + '</span>' +
        '<span class="progress-stat-label">Overdue</span>' +
      '</div>';
  }

  function showLevelUpToast(level, title) {
    var toast = document.createElement('div');
    toast.className = 'level-up-toast';
    toast.textContent = '⬆️ Level ' + level + ' — ' + title + '!';
    document.body.appendChild(toast);
    spawnConfetti();
    setTimeout(function () {
      toast.classList.add('hiding');
      setTimeout(function () { toast.remove(); }, 500);
    }, 2500);
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
      if (wasTurnedIn && !wasTurnedIn.isTurnedIn && state.preferences.mode !== 'parent') spawnConfetti();
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
    } else if (btn.classList.contains('grade-btn')) {
      var currentAssignment = state.assignments.filter(function (a) { return a.id === id; })[0];
      if (currentAssignment) openGradeDialog(currentAssignment);
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
    state.preferences.shareEmail = document.getElementById('share-email').value.trim();
    persist();
    renderAll();
  }

  function buildPrintableHtml() {
      var streak = computeStreak(state.assignments);
      var d = DueIt.buildReportData(state.assignments, state.preferences, streak, state.semesterData.rolloverXP);
      var heading = d.first ? d.first + "'s Assignments" : 'My Assignments';
      var subtitle = d.name && d.grade ? d.name + ' — Grade ' + d.grade : (d.name || '');

      var summaryHtml = '<div class="summary">' +
        '<span>⭐ Level ' + d.level.level + ' — ' + _esc(d.level.title) + ' (' + d.xp + ' XP)</span>' +
        (d.streak >= 2 ? ' &nbsp;|&nbsp; <span>🔥 ' + d.streak + '-day streak</span>' : '') +
        ' &nbsp;|&nbsp; <span>📈 ' + d.completed + '/' + d.total + ' completed, ' + d.turnedIn + ' turned in</span>' +
        (d.unlocked.length > 0 ? ' &nbsp;|&nbsp; <span>🏆 ' + d.unlocked.map(function (b) { return b.emoji; }).join('') + '</span>' : '') +
        '</div>';

      var rows = d.rows.map(function (r) {
        return '<tr>' +
          '<td>' + r.icon + '</td>' +
          '<td>' + _esc(r.className) + '</td>' +
          '<td>' + _esc(r.title) + '</td>' +
          '<td>' + r.dueDate + '</td>' +
          '<td>' + r.countdown + '</td>' +
          '<td>' + r.status + '</td>' +
          '<td>' + (r.grade || '') + '</td>' +
          '<td>' + r.doneDate + '</td>' +
          '<td>' + (r.isTest ? '' : r.turnedInDate) + '</td>' +
        '</tr>';
      }).join('\n');

      return '<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"/>' +
        '<title>' + _esc(heading) + '</title>' +
        '<style>' +
          'body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:2rem;color:#2d3436}' +
          'h1{font-size:1.4rem;margin-bottom:0.25rem}' +
          '.subtitle{color:#636e72;margin-bottom:0.5rem;font-size:0.9rem}' +
          '.date{color:#636e72;font-size:0.8rem;margin-bottom:0.5rem}' +
          '.summary{font-size:0.85rem;margin-bottom:1rem;padding:0.5rem 0;border-bottom:1px solid #dfe6e9}' +
          'table{width:100%;border-collapse:collapse;font-size:0.9rem}' +
          'th,td{text-align:left;padding:0.4rem 0.6rem;border-bottom:1px solid #dfe6e9}' +
          'th{background:#f4f6f8;font-weight:600}' +
          'tr.overdue td:nth-child(4){color:#e74c3c;font-weight:600}' +
        '</style></head><body>' +
        '<h1>' + _esc(heading) + '</h1>' +
        (subtitle ? '<p class="subtitle">' + _esc(subtitle) + '</p>' : '') +
        '<p class="date">Printed ' + d.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) + '</p>' +
        summaryHtml +
        '<table><thead><tr><th>Type</th><th>Class</th><th>Assignment</th><th>Due Date</th><th>Countdown</th><th>Status</th><th>Grade</th><th>Done</th><th>Turned In</th></tr></thead>' +
        '<tbody>' + (rows || '<tr><td colspan="9" style="text-align:center;padding:1rem">No assignments</td></tr>') + '</tbody></table>' +
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
  function handleCalendarSync() {
      var result = DueIt.generateICS(state.assignments);
      if (result.count === 0) {
        alert('No pending assignments to sync!');
        return;
      }
      var blob = new Blob([result.content], { type: 'text/calendar;charset=utf-8' });
      var file = new File([blob], 'dueit-assignments.ics', { type: 'text/calendar' });

      // Try Web Share API with file (mobile)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          title: 'DueIt Assignments',
          files: [file],
        }).catch(function () {
          // User cancelled or share failed — fall back to download
          downloadICS(blob);
        });
      } else {
        downloadICS(blob);
      }
    }

    function downloadICS(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'dueit-assignments.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }
    function buildExportFile() {
        var json = DueIt.serializePlannerData({
          assignments: state.assignments,
          classes: state.classes,
          preferences: state.preferences,
        });
        return new File([json], 'dueit-data.json', { type: 'application/json' });
      }

      function downloadFile(file) {
        var url = URL.createObjectURL(file);
        var a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }

  function handleShare() {
    var streak = computeStreak(state.assignments);
    var report = DueIt.buildProgressReport(state.assignments, state.preferences, streak, state.semesterData.rolloverXP);
    var emailInput = document.getElementById('share-dialog-email');
    var preview = document.getElementById('share-preview');
    var feedback = document.getElementById('share-feedback');
    var nativeShareBtn = document.getElementById('share-native-btn');

    // Pre-fill email from preferences
    emailInput.value = state.preferences.shareEmail || '';
    preview.textContent = report;
    feedback.textContent = '';

    // Show/hide native share button based on Web Share API support
    if (navigator.share) {
      nativeShareBtn.hidden = false;
    } else {
      nativeShareBtn.hidden = true;
    }

    document.getElementById('share-dialog').showModal();
  }

  function handleShareEmail() {
    var email = document.getElementById('share-dialog-email').value.trim();
    var feedback = document.getElementById('share-feedback');
    if (!email) {
      feedback.textContent = 'Please enter an email address.';
      feedback.style.color = 'var(--clr-danger)';
      return;
    }
    // Save the email to preferences for next time
    state.preferences.shareEmail = email;
    persist();
    var settingsEmail = document.getElementById('share-email');
    if (settingsEmail) settingsEmail.value = email;

    var streak = computeStreak(state.assignments);
    var report = DueIt.buildProgressReport(state.assignments, state.preferences, streak, state.semesterData.rolloverXP);
    var name = (state.preferences.studentName || '').trim();
    var first = name.split(' ')[0] || 'Student';
    var subject = encodeURIComponent(first + "'s DueIt Progress Report");
    var body = encodeURIComponent(report);

    // mailto URLs can be truncated on mobile (~2000 char limit).
    // If the full URL is too long, trim the body and append a note.
    var mailto = 'mailto:' + encodeURIComponent(email) + '?subject=' + subject + '&body=' + body;
    if (mailto.length > 1900) {
      // Build a shorter version: just the summary section
      var shortReport = DueIt.buildProgressReport(state.assignments, state.preferences, streak, state.semesterData.rolloverXP);
      // Truncate to fit within limits
      var maxBodyLen = 1500;
      if (shortReport.length > maxBodyLen) {
        shortReport = shortReport.substring(0, maxBodyLen) + '\n\n[Report trimmed — use Copy or Share for full version]';
      }
      body = encodeURIComponent(shortReport);
      mailto = 'mailto:' + encodeURIComponent(email) + '?subject=' + subject + '&body=' + body;
    }

    window.location.href = mailto;
    feedback.textContent = 'Opening email client...';
    feedback.style.color = 'var(--clr-complete)';

    // Download JSON data file if attach checkbox is checked
    if (document.getElementById('share-attach-data').checked) {
      var file = buildExportFile();
      downloadFile(file);
      feedback.textContent = 'Opening email client... JSON data downloaded — attach it to the email.';
    }
  }

  function handleShareNative() {
    var report = document.getElementById('share-preview').textContent;
    var name = (state.preferences.studentName || '').trim();
    var first = name.split(' ')[0] || 'Student';
    var feedback = document.getElementById('share-feedback');
    var attachChecked = document.getElementById('share-attach-data').checked;

    var shareData = {
      title: first + "'s DueIt Progress Report",
      text: report,
    };

    var fileToDownload = null;

    // Include JSON data file if attach checkbox is checked
    if (attachChecked) {
      var file = buildExportFile();
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      } else {
        // Browser doesn't support file sharing — download separately
        fileToDownload = file;
      }
    }

    navigator.share(shareData).then(function () {
      if (fileToDownload) {
        downloadFile(fileToDownload);
        feedback.textContent = '✓ Shared! Data file downloaded — send it separately.';
      } else {
        feedback.textContent = '✓ Shared!';
      }
      feedback.style.color = 'var(--clr-complete)';
    }).catch(function (err) {
      if (err.name !== 'AbortError') {
        feedback.textContent = 'Could not share. Try Copy instead.';
        feedback.style.color = 'var(--clr-danger)';
      }
    });
  }

  function handleShareCopy() {
    var report = document.getElementById('share-preview').textContent;
    var feedback = document.getElementById('share-feedback');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(report).then(function () {
        feedback.textContent = '✓ Copied to clipboard!';
        feedback.style.color = 'var(--clr-complete)';
      }).catch(function () {
        fallbackCopy(report, feedback);
      });
    } else {
      fallbackCopy(report, feedback);
    }
  }

  function fallbackCopy(text, feedback) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      feedback.textContent = '✓ Copied to clipboard!';
      feedback.style.color = 'var(--clr-complete)';
    } catch (e) {
      feedback.textContent = 'Could not copy. Please select and copy manually.';
      feedback.style.color = 'var(--clr-danger)';
    }
    document.body.removeChild(ta);
  }

  function handleExport() {
    DueIt.triggerExportDownload({
      assignments: state.assignments,
      classes: state.classes,
      preferences: state.preferences,
    });
  }

  var gradeDialogId = null;
  var GRADE_EMOJIS = { A: '🎉', B: '👍', C: '😐', D: '😬', F: '😢' };

  function openGradeDialog(assignment) {
    gradeDialogId = assignment.id;
    var titleEl = document.getElementById('grade-dialog-title');
    var assignEl = document.getElementById('grade-dialog-assignment');
    var inputEl = document.getElementById('grade-input');
    var emojiEl = document.getElementById('grade-emoji');
    var letterEl = document.getElementById('grade-live-letter');

    titleEl.textContent = typeof assignment.grade === 'number' ? 'Update Grade' : 'Enter Grade';
    assignEl.textContent = assignment.title + ' — ' + assignment.className;
    inputEl.value = typeof assignment.grade === 'number' ? assignment.grade : '';
    updateGradePreview();

    // Clear active picks
    var picks = document.querySelectorAll('.grade-pick');
    for (var i = 0; i < picks.length; i++) picks[i].classList.remove('active');

    // Highlight matching pick if grade matches
    if (typeof assignment.grade === 'number') {
      var letter = DueIt.getLetterGrade(assignment.grade);
      highlightGradePick(letter);
    }

    document.getElementById('grade-dialog').showModal();
    inputEl.focus();
  }

  function highlightGradePick(letter) {
    var picks = document.querySelectorAll('.grade-pick');
    for (var i = 0; i < picks.length; i++) {
      picks[i].classList.toggle('active', picks[i].textContent === letter);
    }
  }

  function updateGradePreview() {
    var inputEl = document.getElementById('grade-input');
    var emojiEl = document.getElementById('grade-emoji');
    var letterEl = document.getElementById('grade-live-letter');
    var val = parseInt(inputEl.value, 10);
    if (isNaN(val) || val < 0 || val > 100) {
      emojiEl.textContent = '📊';
      letterEl.textContent = '';
      letterEl.style.color = '';
      return;
    }
    var letter = DueIt.getLetterGrade(val);
    var color = DueIt.getGradeColor(val);
    emojiEl.textContent = GRADE_EMOJIS[letter] || '📊';
    letterEl.textContent = letter;
    letterEl.style.color = color;
    highlightGradePick(letter);
  }

  function saveGrade() {
    var inputEl = document.getElementById('grade-input');
    var val = inputEl.value.trim();
    if (!val) { document.getElementById('grade-dialog').close(); return; }
    var result = DueIt.setGrade(state.assignments, gradeDialogId, val);
    if (result.error) {
      inputEl.style.outline = '2px solid var(--clr-danger)';
      setTimeout(function () { inputEl.style.outline = ''; }, 1000);
      return;
    }
    state.assignments = result.assignments;
    persist(); renderAll();
    document.getElementById('grade-dialog').close();
  }

  /* ===== New Semester ===== */

  function openSemesterDialog() {
    var dateEl = document.getElementById('semester-date');
    dateEl.value = new Date().toISOString().slice(0, 10);
    updateSemesterPreview();
    // Close Settings first to avoid nested modal issues
    document.getElementById('settings-dialog').close();
    document.getElementById('semester-dialog').showModal();
  }

  function updateSemesterPreview() {
    var dateEl = document.getElementById('semester-date');
    var previewEl = document.getElementById('semester-preview');
    var startBtn = document.getElementById('semester-start-btn');
    var cutoff = dateEl.value;
    if (!cutoff) {
      previewEl.textContent = 'Pick a date to see what will be archived.';
      startBtn.disabled = true;
      return;
    }
    var archiveCount = state.assignments.filter(function (a) {
      return a.dueDate < cutoff;
    }).length;
    var keepCount = state.assignments.length - archiveCount;
    if (archiveCount === 0) {
      previewEl.textContent = 'No assignments to archive before ' + cutoff + '. All ' + keepCount + ' assignments will be kept.';
      startBtn.disabled = true;
    } else {
      previewEl.innerHTML = '<b>' + archiveCount + '</b> assignment' + (archiveCount !== 1 ? 's' : '') +
        ' before ' + cutoff + ' will be archived.<br>' +
        '<b>' + keepCount + '</b> assignment' + (keepCount !== 1 ? 's' : '') + ' will be kept.' +
        '<br>Your XP carries over!';
      startBtn.disabled = false;
    }
  }

  function buildSemesterSummaryHtml(archived) {
    var isParent = state.preferences.mode === 'parent';
    var completed = archived.filter(function (a) { return a.isComplete || a.isStudied; }).length;
    var turnedIn = archived.filter(function (a) { return a.isTurnedIn; }).length;
    var graded = archived.filter(function (a) { return typeof a.grade === 'number'; });
    var avgGrade = graded.length > 0
      ? Math.round(graded.reduce(function (s, a) { return s + a.grade; }, 0) / graded.length)
      : null;
    var xp = DueIt.computeXP(archived);
    var lvl = DueIt.computeLevel(DueIt.computeXP(state.assignments, state.semesterData.rolloverXP));
    var badges = DueIt.computeBadges(archived);
    var unlocked = badges.filter(function (b) { return b.unlocked; });

    var heading = isParent ? '📋 Semester Summary' : '🎉 Semester Complete!';
    var subtext = isParent
      ? 'Archiving ' + archived.length + ' assignments.'
      : 'Great work this semester! Here\'s what you accomplished:';

    var html = '<h2>' + heading + '</h2>' +
      '<p style="color:var(--clr-muted);margin-bottom:0.75rem">' + subtext + '</p>' +
      '<div class="semester-stats">' +
        '<div class="semester-stat"><span class="semester-stat-value">' + archived.length + '</span><span class="semester-stat-label">Archived</span></div>' +
        '<div class="semester-stat"><span class="semester-stat-value">' + completed + '</span><span class="semester-stat-label">Completed</span></div>' +
        '<div class="semester-stat"><span class="semester-stat-value">' + turnedIn + '</span><span class="semester-stat-label">Turned In</span></div>' +
        '<div class="semester-stat"><span class="semester-stat-value">' + graded.length + '</span><span class="semester-stat-label">Graded</span></div>' +
      '</div>';

    if (avgGrade !== null) {
      html += '<p style="font-size:0.9rem;margin:0.5rem 0">Average grade: <b>' + avgGrade + ' ' + DueIt.getLetterGrade(avgGrade) + '</b></p>';
    }

    if (!isParent) {
      html += '<p style="font-size:0.9rem;margin:0.5rem 0">⭐ ' + xp + ' XP earned this semester — rolling over!</p>';
      html += '<p style="font-size:0.9rem">You\'re Level ' + lvl.level + ' — ' + _esc(lvl.title) + '</p>';
    }

    if (unlocked.length > 0) {
      html += '<div class="semester-badges">🏆 ' + unlocked.map(function (b) { return b.emoji; }).join(' ') + '</div>';
    }

    html += '<div class="semester-summary-actions">' +
      '<button type="button" class="btn btn-primary" id="semester-confirm-btn">✅ Confirm</button>' +
      '<button type="button" class="btn btn-secondary" id="semester-back-btn">Go Back</button>' +
    '</div>';

    return html;
  }

  var semesterArchived = [];

  function handleSemesterStart() {
    var cutoff = document.getElementById('semester-date').value;
    semesterArchived = state.assignments.filter(function (a) { return a.dueDate < cutoff; });
    if (semesterArchived.length === 0) return;

    var contentEl = document.getElementById('semester-summary-content');
    contentEl.innerHTML = buildSemesterSummaryHtml(semesterArchived);

    // Wire up summary buttons
    document.getElementById('semester-confirm-btn').addEventListener('click', function () {
      executeSemesterReset(cutoff);
    });
    document.getElementById('semester-back-btn').addEventListener('click', function () {
      document.getElementById('semester-summary-dialog').close();
    });

    document.getElementById('semester-dialog').close();
    document.getElementById('semester-summary-dialog').showModal();
  }

  function executeSemesterReset(cutoff) {
    // Calculate XP from ALL current assignments before removing any
    var totalXP = DueIt.computeXP(state.assignments, state.semesterData.rolloverXP);

    // Build semester snapshot from archived assignments
    var archived = semesterArchived;
    var completed = archived.filter(function (a) { return a.isComplete || a.isStudied; }).length;
    var turnedIn = archived.filter(function (a) { return a.isTurnedIn; }).length;
    var graded = archived.filter(function (a) { return typeof a.grade === 'number'; });
    var avgGrade = graded.length > 0
      ? Math.round(graded.reduce(function (s, a) { return s + a.grade; }, 0) / graded.length)
      : null;
    var onTime = archived.filter(function (a) {
      if (!a.isTurnedIn || !a.turnedInAt || !a.dueDate) return false;
      return new Date(a.turnedInAt) <= new Date(a.dueDate + 'T23:59:59');
    }).length;
    // Count by class
    var classCounts = {};
    archived.forEach(function (a) {
      classCounts[a.className] = (classCounts[a.className] || 0) + 1;
    });
    // Count by type
    var typeCounts = {};
    archived.forEach(function (a) {
      var t = a.type || 'homework';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    var xpEarned = DueIt.computeXP(archived);

    var snapshot = {
      date: new Date().toISOString(),
      cutoff: cutoff,
      total: archived.length,
      completed: completed,
      turnedIn: turnedIn,
      onTime: onTime,
      graded: graded.length,
      avgGrade: avgGrade,
      xpEarned: xpEarned,
      classCounts: classCounts,
      typeCounts: typeCounts,
    };

    // Save to semester history
    state.semesterData.history.push(snapshot);

    // Remove archived assignments
    state.assignments = state.assignments.filter(function (a) { return a.dueDate >= cutoff; });

    // Store rollover XP (total XP minus what remaining assignments contribute)
    var remainingXP = DueIt.computeXP(state.assignments);
    state.semesterData.rolloverXP = totalXP - remainingXP;

    // Increment semester count
    state.semesterData.semesterCount = (state.semesterData.semesterCount || 0) + 1;

    persist();
    renderAll();

    document.getElementById('semester-summary-dialog').close();
    document.getElementById('settings-dialog').close();

    // Show celebratory message
    var isParent = state.preferences.mode === 'parent';
    var msg = isParent
      ? 'New semester started. ' + archived.length + ' assignments archived.'
      : '🎉 New semester! You\'re starting with ' + totalXP + ' XP at Level ' + DueIt.computeLevel(totalXP).level + '. Let\'s go!';
    var toast = document.createElement('div');
    toast.className = 'level-up-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    if (!isParent) spawnConfetti();
    setTimeout(function () {
      toast.classList.add('hiding');
      setTimeout(function () { toast.remove(); }, 500);
    }, 3000);
  }

  function handleSemesterExport() {
    handleExport();
  }

  /* ===== Year in Review ===== */

  function buildYearReviewHtml() {
    var isParent = state.preferences.mode === 'parent';
    var history = state.semesterData.history || [];
    var name = (state.preferences.studentName || '').trim();
    var first = name.split(' ')[0] || 'Student';

    // Aggregate stats from semester history + current assignments
    var totalAssignments = 0, totalCompleted = 0, totalTurnedIn = 0, totalOnTime = 0;
    var totalGraded = 0, gradeSum = 0, totalXP = 0;
    var allClassCounts = {}, allTypeCounts = {};

    history.forEach(function (s) {
      totalAssignments += s.total || 0;
      totalCompleted += s.completed || 0;
      totalTurnedIn += s.turnedIn || 0;
      totalOnTime += s.onTime || 0;
      totalGraded += s.graded || 0;
      if (s.avgGrade !== null && s.graded > 0) gradeSum += s.avgGrade * s.graded;
      totalXP += s.xpEarned || 0;
      if (s.classCounts) {
        for (var c in s.classCounts) allClassCounts[c] = (allClassCounts[c] || 0) + s.classCounts[c];
      }
      if (s.typeCounts) {
        for (var t in s.typeCounts) allTypeCounts[t] = (allTypeCounts[t] || 0) + s.typeCounts[t];
      }
    });

    // Add current assignments
    state.assignments.forEach(function (a) {
      totalAssignments++;
      if (a.isComplete || a.isStudied) totalCompleted++;
      if (a.isTurnedIn) totalTurnedIn++;
      if (a.isTurnedIn && a.turnedInAt && a.dueDate) {
        if (new Date(a.turnedInAt) <= new Date(a.dueDate + 'T23:59:59')) totalOnTime++;
      }
      if (typeof a.grade === 'number') {
        totalGraded++;
        gradeSum += a.grade;
      }
      allClassCounts[a.className] = (allClassCounts[a.className] || 0) + 1;
      var t = a.type || 'homework';
      allTypeCounts[t] = (allTypeCounts[t] || 0) + 1;
    });

    totalXP += DueIt.computeXP(state.assignments, state.semesterData.rolloverXP);
    var avgGrade = totalGraded > 0 ? Math.round(gradeSum / totalGraded) : null;
    var completionRate = totalAssignments > 0 ? Math.round((totalCompleted / totalAssignments) * 100) : 0;
    var onTimeRate = totalTurnedIn > 0 ? Math.round((totalOnTime / totalTurnedIn) * 100) : 0;
    var semesterCount = state.semesterData.semesterCount || 0;
    var lvl = DueIt.computeLevel(totalXP);

    // Find busiest class
    var busiestClass = '';
    var busiestCount = 0;
    for (var cls in allClassCounts) {
      if (allClassCounts[cls] > busiestCount) { busiestClass = cls; busiestCount = allClassCounts[cls]; }
    }

    // Type labels
    var typeLabels = { homework: 'Homework', test: 'Tests', reading: 'Readings', project: 'Projects' };

    // Current badges
    var badges = DueIt.computeBadges(state.assignments);
    var unlocked = badges.filter(function (b) { return b.unlocked; });

    var heading = isParent ? first + '\'s Year in Review' : '🎉 ' + first + '\'s Year in Review';

    var html = '';

    // Big number hero
    html += '<span class="yr-big-number">' + totalAssignments + '</span>';
    html += '<span class="yr-label">Total Assignments This Year</span>';

    // Core stats
    html += '<div class="yr-stats">';
    html += '<div class="yr-stat"><span class="yr-stat-value">' + totalCompleted + '</span><span class="yr-stat-label">Completed</span></div>';
    html += '<div class="yr-stat"><span class="yr-stat-value">' + totalTurnedIn + '</span><span class="yr-stat-label">Turned In</span></div>';
    html += '<div class="yr-stat"><span class="yr-stat-value">' + completionRate + '%</span><span class="yr-stat-label">Completion</span></div>';
    html += '</div>';

    // Grade stats
    if (totalGraded > 0) {
      html += '<h3>📊 Grades</h3>';
      html += '<div class="yr-stats">';
      html += '<div class="yr-stat"><span class="yr-stat-value">' + totalGraded + '</span><span class="yr-stat-label">Graded</span></div>';
      html += '<div class="yr-stat"><span class="yr-stat-value">' + avgGrade + ' ' + DueIt.getLetterGrade(avgGrade) + '</span><span class="yr-stat-label">Average</span></div>';
      html += '<div class="yr-stat"><span class="yr-stat-value">' + onTimeRate + '%</span><span class="yr-stat-label">On Time</span></div>';
      html += '</div>';
    }

    // XP & Level
    if (!isParent) {
      html += '<h3>⭐ XP & Level</h3>';
      html += '<div class="yr-stats">';
      html += '<div class="yr-stat"><span class="yr-stat-value">' + totalXP + '</span><span class="yr-stat-label">Total XP</span></div>';
      html += '<div class="yr-stat"><span class="yr-stat-value">Lv. ' + lvl.level + '</span><span class="yr-stat-label">' + _esc(lvl.title) + '</span></div>';
      html += '<div class="yr-stat"><span class="yr-stat-value">' + semesterCount + '</span><span class="yr-stat-label">Semesters</span></div>';
      html += '</div>';
    } else {
      html += '<h3>📈 Progress</h3>';
      html += '<div class="yr-stats">';
      html += '<div class="yr-stat"><span class="yr-stat-value">' + totalOnTime + '</span><span class="yr-stat-label">On Time</span></div>';
      html += '<div class="yr-stat"><span class="yr-stat-value">' + semesterCount + '</span><span class="yr-stat-label">Semesters</span></div>';
      html += '<div class="yr-stat"><span class="yr-stat-value">' + Object.keys(allClassCounts).length + '</span><span class="yr-stat-label">Classes</span></div>';
      html += '</div>';
    }

    // Fun facts
    html += '<h3>🎯 Fun Facts</h3>';
    if (busiestClass) {
      html += '<div class="yr-fun-fact">📚 Busiest class: <b>' + _esc(busiestClass) + '</b> with ' + busiestCount + ' assignments</div>';
    }
    if (totalOnTime > 0) {
      html += '<div class="yr-fun-fact">⏰ Turned in ' + totalOnTime + ' assignment' + (totalOnTime !== 1 ? 's' : '') + ' on time!</div>';
    }
    // Type breakdown
    var typeLines = [];
    for (var tp in allTypeCounts) {
      typeLines.push((typeLabels[tp] || tp) + ': ' + allTypeCounts[tp]);
    }
    if (typeLines.length > 0) {
      html += '<div class="yr-fun-fact">📝 ' + typeLines.join(' · ') + '</div>';
    }

    // Badges
    if (unlocked.length > 0 && !isParent) {
      html += '<h3>🏆 Badges Earned</h3>';
      html += '<div class="yr-badges">' + unlocked.map(function (b) { return b.emoji; }).join(' ') + '</div>';
      html += '<p style="text-align:center;font-size:0.8rem;color:var(--clr-muted)">' + unlocked.length + ' of ' + badges.length + ' badges unlocked</p>';
    }

    return html;
  }

  function buildYearReviewText() {
    var name = (state.preferences.studentName || '').trim();
    var first = name.split(' ')[0] || 'Student';
    var history = state.semesterData.history || [];
    var totalAssignments = 0, totalCompleted = 0, totalTurnedIn = 0, totalGraded = 0, gradeSum = 0;

    history.forEach(function (s) {
      totalAssignments += s.total || 0;
      totalCompleted += s.completed || 0;
      totalTurnedIn += s.turnedIn || 0;
      totalGraded += s.graded || 0;
      if (s.avgGrade !== null && s.graded > 0) gradeSum += s.avgGrade * s.graded;
    });
    state.assignments.forEach(function (a) {
      totalAssignments++;
      if (a.isComplete || a.isStudied) totalCompleted++;
      if (a.isTurnedIn) totalTurnedIn++;
      if (typeof a.grade === 'number') { totalGraded++; gradeSum += a.grade; }
    });
    var avgGrade = totalGraded > 0 ? Math.round(gradeSum / totalGraded) : null;
    var totalXP = DueIt.computeXP(state.assignments, state.semesterData.rolloverXP);
    var lvl = DueIt.computeLevel(totalXP);

    var lines = [];
    lines.push('📊 ' + first + '\'s Year in Review');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push('Total Assignments: ' + totalAssignments);
    lines.push('Completed: ' + totalCompleted);
    lines.push('Turned In: ' + totalTurnedIn);
    if (avgGrade !== null) lines.push('Average Grade: ' + avgGrade + ' ' + DueIt.getLetterGrade(avgGrade));
    lines.push('Total XP: ' + totalXP + ' (Level ' + lvl.level + ' — ' + lvl.title + ')');
    lines.push('Semesters: ' + (state.semesterData.semesterCount || 0));
    lines.push('');
    lines.push('— DueIt v' + DueIt.APP_VERSION);
    return lines.join('\n');
  }

  function openYearReview() {
    var history = state.semesterData.history || [];
    var totalAssignments = state.assignments.length;
    history.forEach(function (s) { totalAssignments += s.total || 0; });

    if (totalAssignments === 0) {
      alert('No data yet! Add some assignments first.');
      return;
    }

    // Close Settings first to avoid nested modal issues
    document.getElementById('settings-dialog').close();

    var isParent = state.preferences.mode === 'parent';
    var name = (state.preferences.studentName || '').trim();
    var first = name.split(' ')[0] || 'Student';
    document.getElementById('year-review-title').textContent = isParent
      ? '📊 ' + first + '\'s Year in Review'
      : '🎉 Year in Review';
    document.getElementById('year-review-body').innerHTML = buildYearReviewHtml();
    document.getElementById('year-review-dialog').showModal();
  }

  function handleYearReviewPrint() {
    var html = document.getElementById('year-review-body').innerHTML;
    var name = (state.preferences.studentName || '').trim();
    var first = name.split(' ')[0] || 'Student';
    var win = window.open('', '_blank');
    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>' + first + '\'s Year in Review</title>' +
      '<style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:2rem;color:#2d3436;max-width:600px;margin:2rem auto}' +
      'h3{color:#4a6cf7;margin:1rem 0 0.4rem}.yr-big-number{font-size:2.5rem;font-weight:700;color:#4a6cf7;display:block;text-align:center}' +
      '.yr-label{font-size:0.8rem;color:#636e72;text-align:center;display:block;margin-bottom:0.75rem}' +
      '.yr-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;margin:0.75rem 0}' +
      '.yr-stat{text-align:center;padding:0.5rem;background:#f4f6f8;border:1px solid #dfe6e9;border-radius:8px}' +
      '.yr-stat-value{font-size:1.3rem;font-weight:700;color:#4a6cf7;display:block}' +
      '.yr-stat-label{font-size:0.65rem;color:#636e72;text-transform:uppercase}' +
      '.yr-fun-fact{background:#f4f6f8;border:1px solid #dfe6e9;border-radius:8px;padding:0.6rem;margin:0.5rem 0;text-align:center;font-size:0.85rem}' +
      '.yr-badges{text-align:center;font-size:1.5rem;margin:0.5rem 0;letter-spacing:0.2em}</style></head><body>' +
      '<h1 style="text-align:center">' + _esc(first) + '\'s Year in Review</h1>' + html + '</body></html>');
    win.document.close();
    win.focus();
    win.print();
  }

  function handleYearReviewShare() {
    var text = buildYearReviewText();
    if (navigator.share) {
      navigator.share({ title: 'Year in Review', text: text }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        alert('Copied to clipboard!');
      });
    }
  }

  function buildStudentHelp() {
    return '<h3>👋 Welcome to DueIt!</h3>' +
      '<p>DueIt helps you keep track of all your homework, tests, readings, and projects in one place. Here\'s how to get started:</p>' +

      '<h3>📝 Adding Assignments</h3>' +
      '<ul>' +
        '<li>Pick your <b>Class</b> and <b>Due Date</b></li>' +
        '<li>Choose the <b>Type</b> (Homework, Test, Reading, or Project)</li>' +
        '<li>Type in the <b>Assignment</b> name and hit <b>Add Assignment</b></li>' +
      '</ul>' +

      '<h3>✅ Tracking Your Progress</h3>' +
      '<ul>' +
        '<li><b>👍 Done</b> — Mark it when you finish the work</li>' +
        '<li><b>🫴 Turn In</b> — Mark it after you hand it in (shows up after Done)</li>' +
        '<li><b>📖 Studied</b> — For tests and quizzes, mark when you\'ve studied</li>' +
        '<li><b>📊 Grade</b> — After turning in or studying, record your grade (0–100)</li>' +
        '<li><b>✏️ Edit</b> — Fix a mistake or change the due date</li>' +
        '<li><b>🗑 Delete</b> — Remove an assignment you don\'t need</li>' +
      '</ul>' +

      '<h3>⭐ Earning XP & Leveling Up</h3>' +
      '<p>You earn XP for everything you do!</p>' +
      '<ul>' +
        '<li>Complete an assignment: <b>+10 XP</b></li>' +
        '<li>Turn it in: <b>+20 XP</b></li>' +
        '<li>Turn it in on time: <b>+10 bonus XP</b></li>' +
        '<li>Study for a test: <b>+15 XP</b></li>' +
        '<li>Record a grade: <b>+5 XP</b> (plus bonuses for B, A, and 100!)</li>' +
        '<li>Tests and projects earn <b>1.5x</b> grade XP</li>' +
      '</ul>' +
      '<p>Level up from Freshman all the way to Legend! 🎉</p>' +

      '<h3>🏆 Badges</h3>' +
      '<p>Unlock badges by hitting milestones — check them out in <b>Settings > Achievements</b>.</p>' +

      '<h3>📅 Calendar View</h3>' +
      '<p>Tap the 📅 button in the tracker to see your assignments on a monthly calendar. Colored dots show what\'s due each day.</p>' +

      '<h3>⬆️ Sharing Progress</h3>' +
      '<p>Tap ⬆️ to share a progress report with your parent or teacher. You can email it, copy it, or use your phone\'s share menu.</p>' +
      '<div class="help-tip">💡 Check the "📎 Attach data" box to include your data file so your parent can see everything in their own DueIt!</div>' +

      '<h3>🎨 Make It Yours</h3>' +
      '<p>In <b>Settings</b> (⚙️) you can:</p>' +
      '<ul>' +
        '<li>Pick a color theme and font</li>' +
        '<li>Set your name and grade</li>' +
        '<li>Add or rename your classes</li>' +
        '<li>Export or import your data</li>' +
      '</ul>' +

      '<h3>🌙 Dark Mode</h3>' +
      '<p>Tap the moon/sun icon to switch between light and dark mode.</p>';
  }

  function buildParentHelp() {
    return '<h3>👋 Welcome to Parent Mode</h3>' +
      '<p>Parent Mode gives you a clean overview of your child\'s assignments without the gamification elements. Here\'s how to use it:</p>' +

      '<h3>📊 Progress Summary</h3>' +
      '<p>At the top of the tracker you\'ll see three numbers:</p>' +
      '<ul>' +
        '<li><b>Total</b> — All assignments in the system</li>' +
        '<li><b>Completed</b> — Assignments marked done or studied</li>' +
        '<li><b>Overdue</b> — Past due and not yet completed</li>' +
      '</ul>' +

      '<h3>⬇️ Importing Your Child\'s Data</h3>' +
      '<p>Tap <b>⬇️</b> in the header to import a JSON data file from your child. This lets you see all their assignments and progress.</p>' +
      '<div class="help-tip">💡 Your child can send you their data by tapping ⬆️ Share with the "📎 Attach data" box checked.</div>' +

      '<h3>✏️ Reviewing & Updating</h3>' +
      '<p>You have full access to add, edit, and delete assignments — just like your child does. Use this to:</p>' +
      '<ul>' +
        '<li>Add assignments your child forgot to enter</li>' +
        '<li>Fix incorrect due dates</li>' +
        '<li>Mark items as done if needed</li>' +
        '<li>Remove duplicates or old entries</li>' +
      '</ul>' +

      '<h3>⬆️ Sending Updates Back</h3>' +
      '<p>After making changes, tap <b>⬆️ Share</b> with "📎 Attach data" checked to send the updated data back. Your child imports it and the app will <b>smart merge</b> — keeping the newer version of each assignment.</p>' +
      '<div class="help-tip">💡 Smart merge means neither side loses work. If your child completed something while you were editing, their newer update wins for that assignment.</div>' +

      '<h3>🖨️ Printing Reports</h3>' +
      '<p>Tap 🖨️ to print a full assignment report with status, due dates, and completion dates.</p>' +

      '<h3>⚙️ Settings</h3>' +
      '<p>In Settings you can:</p>' +
      '<ul>' +
        '<li>Change colors and fonts</li>' +
        '<li>Manage classes</li>' +
        '<li>Export data, import data, or sync to calendar</li>' +
      '</ul>' +

      '<h3>🔄 Switching Back</h3>' +
      '<p>Tap the <b>[Parent]</b> pill in the header to switch back to Student mode. The mode is remembered between visits.</p>';
  }

  function handleHelp() {
    var titleEl = document.getElementById('help-title');
    var bodyEl = document.getElementById('help-body');
    if (state.preferences.mode === 'parent') {
      titleEl.textContent = '❓ Parent Guide';
      bodyEl.innerHTML = buildParentHelp();
    } else {
      titleEl.textContent = '❓ Student Guide';
      bodyEl.innerHTML = buildStudentHelp();
    }
    document.getElementById('help-dialog').showModal();
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
      showConfirm('Merge imported data with your current data?').then(function (confirmed) {
        if (!confirmed) { e.target.value = ''; return; }
        var merged = DueIt.mergeImportData(
          { assignments: state.assignments, classes: state.classes, preferences: state.preferences },
          result.data
        );
        state.assignments = merged.assignments;
        state.classes = merged.classes;
        // Keep local preferences (merge doesn't overwrite them)
        persist(); renderAll();
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
    applyFont(state.preferences.font || 'system');
    applyMode(state.preferences.mode || 'student');
    renderAll();
    document.getElementById('footer-version').textContent = 'DueIt v' + DueIt.APP_VERSION;

    document.getElementById('assignment-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('form-cancel-btn').addEventListener('click', function () { DueIt.clearForm(); });
    document.getElementById('tracker-list').addEventListener('click', handleTrackerClick);
    document.getElementById('add-class-btn').addEventListener('click', handleAddClass);
    document.getElementById('class-list').addEventListener('click', handleClassListClick);
    document.getElementById('save-profile-btn').addEventListener('click', handleSaveProfile);
    document.getElementById('print-btn').addEventListener('click', handlePrint);
    document.getElementById('calendar-sync-btn').addEventListener('click', handleCalendarSync);
    document.getElementById('share-btn').addEventListener('click', handleShare);
    document.getElementById('share-email-btn').addEventListener('click', handleShareEmail);
    document.getElementById('share-copy-btn').addEventListener('click', handleShareCopy);
    document.getElementById('share-native-btn').addEventListener('click', handleShareNative);
    document.getElementById('share-close-btn').addEventListener('click', function () {
      document.getElementById('share-dialog').close();
    });
    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('import-file').addEventListener('change', handleImport);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    document.getElementById('help-btn').addEventListener('click', handleHelp);
    document.getElementById('help-close-btn').addEventListener('click', function () {
      document.getElementById('help-dialog').close();
    });

    // Grade dialog
    document.getElementById('grade-save-btn').addEventListener('click', saveGrade);
    document.getElementById('grade-cancel-btn').addEventListener('click', function () {
      document.getElementById('grade-dialog').close();
    });
    document.getElementById('grade-input').addEventListener('input', updateGradePreview);
    document.getElementById('grade-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') saveGrade();
    });
    document.querySelector('.grade-quick-picks').addEventListener('click', function (e) {
      var pick = e.target.closest('.grade-pick');
      if (!pick) return;
      document.getElementById('grade-input').value = pick.dataset.score;
      updateGradePreview();
    });

    // New Semester
    document.getElementById('new-semester-btn').addEventListener('click', openSemesterDialog);
    document.getElementById('semester-date').addEventListener('change', updateSemesterPreview);
    document.getElementById('semester-start-btn').addEventListener('click', handleSemesterStart);
    document.getElementById('semester-export-btn').addEventListener('click', handleSemesterExport);
    document.getElementById('semester-cancel-btn').addEventListener('click', function () {
      document.getElementById('semester-dialog').close();
    });
    document.getElementById('semester-close-btn').addEventListener('click', function () {
      document.getElementById('semester-dialog').close();
    });

    // Year in Review
    document.getElementById('year-review-btn').addEventListener('click', openYearReview);
    document.getElementById('year-review-close-btn').addEventListener('click', function () {
      document.getElementById('year-review-dialog').close();
    });
    document.getElementById('year-review-print-btn').addEventListener('click', handleYearReviewPrint);
    document.getElementById('year-review-share-btn').addEventListener('click', handleYearReviewShare);

    document.getElementById('mode-toggle-btn').addEventListener('click', function () {
      var newMode = state.preferences.mode === 'parent' ? 'student' : 'parent';
      applyMode(newMode);
      renderAll();
    });

    document.getElementById('import-header-btn').addEventListener('click', function () {
      document.getElementById('import-header-file').click();
    });
    document.getElementById('import-header-file').addEventListener('change', handleImport);

    document.getElementById('calendar-toggle-btn').addEventListener('click', function () {
      calendarMode = !calendarMode;
      if (calendarMode) DueIt.resetCalendarView();
      updateCalendarVisibility();
    });

    document.getElementById('color-picker').addEventListener('click', function (e) {
      var swatch = e.target.closest('.color-swatch');
      if (swatch && swatch.dataset.accent) applyAccent(swatch.dataset.accent);
    });

    document.getElementById('font-picker').addEventListener('change', function (e) {
      applyFont(e.target.value);
    });

    document.getElementById('settings-open-btn').addEventListener('click', function () {
      DueIt.renderClassManager(state.classes);
      document.getElementById('student-name').value = state.preferences.studentName || '';
      document.getElementById('student-grade').value = state.preferences.studentGrade || '';
      document.getElementById('share-email').value = state.preferences.shareEmail || '';
      document.getElementById('font-picker').value = state.preferences.font || 'system';
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
