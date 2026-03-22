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
    lastLevel = DueIt.computeLevel(DueIt.computeXP(state.assignments)).level;
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
    var xp = DueIt.computeXP(state.assignments);
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
      return '<div class="' + cls + '" title="' + _esc(b.desc) + '">' +
        '<span class="badge-emoji">' + b.emoji + '</span>' +
        '<span class="badge-name">' + _esc(b.name) + '</span>' +
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
      var d = DueIt.buildReportData(state.assignments, state.preferences, streak);
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
    var report = DueIt.buildProgressReport(state.assignments, state.preferences, streak);
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
    var report = DueIt.buildProgressReport(state.assignments, state.preferences, streak);
    var name = (state.preferences.studentName || '').trim();
    var first = name.split(' ')[0] || 'Student';
    var subject = encodeURIComponent(first + "'s DueIt Progress Report");
    var body = encodeURIComponent(report);

    // mailto URLs can be truncated on mobile (~2000 char limit).
    // If the full URL is too long, trim the body and append a note.
    var mailto = 'mailto:' + encodeURIComponent(email) + '?subject=' + subject + '&body=' + body;
    if (mailto.length > 1900) {
      // Build a shorter version: just the summary section
      var shortReport = DueIt.buildProgressReport(state.assignments, state.preferences, streak);
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

    var shareData = {
      title: first + "'s DueIt Progress Report",
      text: report,
    };

    // Include JSON data file if attach checkbox is checked
    if (document.getElementById('share-attach-data').checked) {
      var file = buildExportFile();
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }
    }

    navigator.share(shareData).then(function () {
      feedback.textContent = '✓ Shared!';
      feedback.style.color = 'var(--clr-complete)';
    }).catch(function (err) {
      // User cancelled — not an error
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
