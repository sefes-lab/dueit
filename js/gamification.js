var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

/* ===== XP & Level System ===== */

var XP_VALUES = {
  COMPLETE: 10,
  TURN_IN: 20,
  STUDIED: 15,
  ON_TIME: 10,       // bonus for turning in before due date
  STREAK_BONUS: 5,   // per streak day beyond 1
  GRADE_BASE: 5,     // recording any grade
  GRADE_C: 5,        // bonus for C (70-79)
  GRADE_B: 10,       // bonus for B (80-89)
  GRADE_A: 15,       // bonus for A (90-99)
  GRADE_PERFECT: 25, // bonus for 100
};

// Level thresholds: level N requires LEVELS[N] total XP
var LEVELS = [
  0,     // Level 1
  50,    // Level 2
  120,   // Level 3
  220,   // Level 4
  350,   // Level 5
  520,   // Level 6
  730,   // Level 7
  1000,  // Level 8
  1350,  // Level 9
  1800,  // Level 10
];

var LEVEL_TITLES = [
  'Freshman',        // 1
  'Sophomore',       // 2
  'Scholar',         // 3
  'Bookworm',        // 4
  'Honor Roll',      // 5
  'Dean\'s List',    // 6
  'Magna Cum Laude', // 7
  'Summa Cum Laude', // 8
  'Valedictorian',   // 9
  'Legend',           // 10
];

DueIt.computeXP = function computeXP(assignments) {
  var xp = 0;
  assignments.forEach(function (a) {
    if (a.isComplete) xp += XP_VALUES.COMPLETE;
    if (a.isTurnedIn) {
      xp += XP_VALUES.TURN_IN;
      // On-time bonus
      if (a.turnedInAt && a.dueDate) {
        var turnedIn = new Date(a.turnedInAt);
        var due = new Date(a.dueDate + 'T23:59:59');
        if (turnedIn <= due) xp += XP_VALUES.ON_TIME;
      }
    }
    if (a.isStudied) xp += XP_VALUES.STUDIED;
    // Grade XP
    if (typeof a.grade === 'number') {
      var gradeXP = XP_VALUES.GRADE_BASE;
      if (a.grade === 100) gradeXP += XP_VALUES.GRADE_PERFECT;
      else if (a.grade >= 90) gradeXP += XP_VALUES.GRADE_A;
      else if (a.grade >= 80) gradeXP += XP_VALUES.GRADE_B;
      else if (a.grade >= 70) gradeXP += XP_VALUES.GRADE_C;
      // 1.5x multiplier for tests and projects
      var type = a.type || 'homework';
      if (type === 'test' || type === 'project') {
        gradeXP = Math.round(gradeXP * 1.5);
      }
      xp += gradeXP;
    }
  });
  return xp;
};

DueIt.computeLevel = function computeLevel(xp) {
  var level = 1;
  for (var i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i]) { level = i + 1; break; }
  }
  var currentThreshold = LEVELS[level - 1] || 0;
  var nextThreshold = LEVELS[level] || LEVELS[LEVELS.length - 1] + 500;
  var progress = nextThreshold > currentThreshold
    ? (xp - currentThreshold) / (nextThreshold - currentThreshold)
    : 1;
  return {
    level: level,
    title: LEVEL_TITLES[level - 1] || 'Legend',
    xp: xp,
    xpForCurrent: currentThreshold,
    xpForNext: nextThreshold,
    progress: Math.min(progress, 1),
    isMaxLevel: level >= LEVELS.length,
  };
};


/* ===== Achievement Badges ===== */

var BADGES = [
  { id: 'first_add',      emoji: '🌱', name: 'First Seed',       desc: 'Add your first assignment',           check: function (a) { return a.length >= 1; } },
  { id: 'five_done',      emoji: '✅', name: 'High Five',        desc: 'Complete 5 assignments',              check: function (a) { return a.filter(function(x){return x.isComplete;}).length >= 5; } },
  { id: 'ten_done',       emoji: '🏅', name: 'Double Digits',    desc: 'Complete 10 assignments',             check: function (a) { return a.filter(function(x){return x.isComplete;}).length >= 10; } },
  { id: 'first_turnin',   emoji: '🫴', name: 'Hand It Over',     desc: 'Turn in your first assignment',       check: function (a) { return a.some(function(x){return x.isTurnedIn;}); } },
  { id: 'ten_turnin',     emoji: '📬', name: 'Mailbox Full',     desc: 'Turn in 10 assignments',              check: function (a) { return a.filter(function(x){return x.isTurnedIn;}).length >= 10; } },
  { id: 'first_study',    emoji: '📖', name: 'Study Buddy',      desc: 'Study for your first test',           check: function (a) { return a.some(function(x){return x.isStudied;}); } },
  { id: 'all_types',      emoji: '🎯', name: 'Well Rounded',     desc: 'Add all 4 assignment types',          check: function (a) {
    var types = {};
    a.forEach(function(x){ types[x.type || 'homework'] = true; });
    return types.homework && types.test && types.reading && types.project;
  }},
  { id: 'five_ontime',    emoji: '⏰', name: 'Punctual',         desc: 'Turn in 5 assignments on time',       check: function (a) {
    return a.filter(function(x){
      if (!x.isTurnedIn || !x.turnedInAt || !x.dueDate) return false;
      return new Date(x.turnedInAt) <= new Date(x.dueDate + 'T23:59:59');
    }).length >= 5;
  }},
  { id: 'twenty_five',    emoji: '🏆', name: 'Quarter Century',  desc: 'Add 25 assignments total',            check: function (a) { return a.length >= 25; } },
  { id: 'perfect_week',   emoji: '💯', name: 'Perfect Week',     desc: 'Complete all assignments due this week', check: function (a) {
    var now = new Date();
    var startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    var endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);
    var dueThisWeek = a.filter(function(x){
      var d = new Date(x.dueDate);
      return d >= startOfWeek && d < endOfWeek;
    });
    return dueThisWeek.length > 0 && dueThisWeek.every(function(x){ return x.isComplete || x.isStudied; });
  }},
  // Grade badges
  { id: 'first_grade',    emoji: '📊', name: 'First Grade',      desc: 'Record your first grade',             check: function (a) { return a.some(function(x){ return typeof x.grade === 'number'; }); } },
  { id: 'perfect_score',  emoji: '🏆', name: 'Perfect Score',    desc: 'Get a 100 on any assignment',         check: function (a) { return a.some(function(x){ return x.grade === 100; }); } },
  { id: 'honor_roll',     emoji: '🎖️', name: 'Honor Roll',       desc: 'Get 5 or more grades of 90+',        check: function (a) { return a.filter(function(x){ return typeof x.grade === 'number' && x.grade >= 90; }).length >= 5; } },
  { id: 'grade_tracker',  emoji: '📈', name: 'Grade Tracker',    desc: 'Record grades on 10 assignments',     check: function (a) { return a.filter(function(x){ return typeof x.grade === 'number'; }).length >= 10; } },
  { id: 'straight_as',    emoji: '🌟', name: 'Straight A\'s',    desc: 'Get an A on 5 graded assignments in a row', check: function (a) {
    var graded = a.filter(function(x){ return typeof x.grade === 'number' && x.gradedAt; });
    graded.sort(function(x,y){ return new Date(x.gradedAt).getTime() - new Date(y.gradedAt).getTime(); });
    var streak = 0;
    for (var i = 0; i < graded.length; i++) {
      if (graded[i].grade >= 90) { streak++; if (streak >= 5) return true; }
      else { streak = 0; }
    }
    return false;
  }},
  { id: 'test_ace',       emoji: '🧠', name: 'Test Ace',         desc: 'Get 90+ on 3 tests',                 check: function (a) { return a.filter(function(x){ return x.type === 'test' && typeof x.grade === 'number' && x.grade >= 90; }).length >= 3; } },
  { id: 'project_pro',    emoji: '🏗️', name: 'Project Pro',      desc: 'Get 90+ on 2 projects',              check: function (a) { return a.filter(function(x){ return x.type === 'project' && typeof x.grade === 'number' && x.grade >= 90; }).length >= 2; } },
  { id: 'bookworm_bonus', emoji: '📚', name: 'Bookworm Bonus',   desc: 'Get 90+ on 3 readings',              check: function (a) { return a.filter(function(x){ return x.type === 'reading' && typeof x.grade === 'number' && x.grade >= 90; }).length >= 3; } },
  { id: 'scholar_types',  emoji: '🎯', name: 'Well Rounded Scholar', desc: 'Record grades on all 4 assignment types', check: function (a) {
    var types = {};
    a.forEach(function(x){ if (typeof x.grade === 'number') types[x.type || 'homework'] = true; });
    return types.homework && types.test && types.reading && types.project;
  }},
  { id: 'grade_streak',   emoji: '🔥', name: 'Grade Streak',     desc: 'Get 3 grades of 80+ in a row',       check: function (a) {
    var graded = a.filter(function(x){ return typeof x.grade === 'number' && x.gradedAt; });
    graded.sort(function(x,y){ return new Date(x.gradedAt).getTime() - new Date(y.gradedAt).getTime(); });
    var streak = 0;
    for (var i = 0; i < graded.length; i++) {
      if (graded[i].grade >= 80) { streak++; if (streak >= 3) return true; }
      else { streak = 0; }
    }
    return false;
  }},
];

DueIt.computeBadges = function computeBadges(assignments) {
  return BADGES.map(function (b) {
    return {
      id: b.id,
      emoji: b.emoji,
      name: b.name,
      desc: b.desc,
      unlocked: b.check(assignments),
    };
  });
};

/* ===== Weekly Stats ===== */

DueIt.computeWeeklyStats = function computeWeeklyStats(assignments) {
  var now = new Date();
  var startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  var endOfWeek = new Date(startOfWeek.getTime() + 7 * 86400000);

  var dueThisWeek = assignments.filter(function (a) {
    var d = new Date(a.dueDate);
    return d >= startOfWeek && d < endOfWeek;
  });

  var completed = dueThisWeek.filter(function (a) { return a.isComplete || a.isStudied; }).length;
  var turnedIn = dueThisWeek.filter(function (a) { return a.isTurnedIn; }).length;
  var total = dueThisWeek.length;

  return {
    total: total,
    completed: completed,
    turnedIn: turnedIn,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};


/* ===== Shared Report Data (used by both text share and HTML print) ===== */

DueIt.buildReportData = function buildReportData(assignments, preferences, streak) {
  var name = (preferences.studentName || '').trim();
  var grade = (preferences.studentGrade || '').trim();
  var first = name.split(' ')[0] || 'Student';
  var now = new Date();
  var typeIcons = { homework: '📝', test: '📋', reading: '📖', project: '🎨' };

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch (e) { return iso || ''; }
  }

  var xp = DueIt.computeXP(assignments);
  var lvl = DueIt.computeLevel(xp);
  var total = assignments.length;
  var completed = assignments.filter(function (a) { return a.isComplete || a.isStudied; }).length;
  var turnedIn = assignments.filter(function (a) { return a.isTurnedIn; }).length;
  var badges = DueIt.computeBadges(assignments);
  var unlocked = badges.filter(function (b) { return b.unlocked; });
  var sorted = DueIt.sortByDueDate(assignments);

  var rows = sorted.map(function (a) {
    var cd = DueIt.computeCountdown(a.dueDate, now);
    var icon = typeIcons[a.type || 'homework'] || '📝';
    var isTest = (a.type === 'test');
    var status;
    if (isTest) {
      status = a.isStudied ? 'Studied' : 'Not Studied';
    } else {
      status = a.isTurnedIn ? 'Turned In' : (a.isComplete ? 'Done' : 'Pending');
    }
    var doneDate = '';
    if (isTest && a.studiedAt) {
      doneDate = fmtDate(a.studiedAt);
    } else if (!isTest && a.completedAt) {
      doneDate = fmtDate(a.completedAt);
    }
    var turnedInDate = (!isTest && a.turnedInAt) ? fmtDate(a.turnedInAt) : '';
    var gradeStr = '';
    if (typeof a.grade === 'number') {
      gradeStr = a.grade + ' ' + DueIt.getLetterGrade(a.grade);
    }
    return {
      icon: icon,
      className: a.className,
      title: a.title,
      dueDate: fmtDate(a.dueDate),
      countdown: cd.label,
      status: status,
      doneDate: doneDate,
      turnedInDate: turnedInDate,
      isTest: isTest,
      grade: gradeStr,
    };
  });

  return {
    name: name,
    first: first,
    grade: grade,
    date: now,
    xp: xp,
    level: lvl,
    streak: streak,
    total: total,
    completed: completed,
    turnedIn: turnedIn,
    unlocked: unlocked,
    badgeCount: badges.length,
    rows: rows,
  };
};


/* ===== Text Progress Report (for sharing) ===== */

DueIt.buildProgressReport = function buildProgressReport(assignments, preferences, streak) {
  var d = DueIt.buildReportData(assignments, preferences, streak);
  var dateStr = d.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  var lines = [];
  lines.push('📊 DueIt Progress Report');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(d.first + (d.grade ? ' (Grade ' + d.grade + ')' : '') + ' — ' + dateStr);
  lines.push('');

  lines.push('⭐ Level ' + d.level.level + ' — ' + d.level.title + '  (' + d.xp + ' XP)');
  if (d.streak >= 2) {
    lines.push('🔥 ' + d.streak + '-day turn-in streak!');
  }
  lines.push('📈 Progress: ' + d.completed + '/' + d.total + ' completed, ' + d.turnedIn + ' turned in');
  if (d.unlocked.length > 0) {
    lines.push('🏆 Badges: ' + d.unlocked.map(function (b) { return b.emoji + ' ' + b.name; }).join(', '));
  }
  lines.push('');

  if (d.rows.length > 0) {
    lines.push('📋 Assignments');
    lines.push('─────────────────────────────────');
    d.rows.forEach(function (r) {
      var statusIcon = r.status === 'Turned In' ? '✅' : (r.status === 'Done' ? '☑️' : (r.status === 'Studied' ? '✅' : '⬜'));
      lines.push(r.icon + ' ' + r.title + '  [' + r.className + ']');
      var detail = '   Due: ' + r.dueDate + ' (' + r.countdown + ') | ' + statusIcon + ' ' + r.status;
      if (r.doneDate) detail += ' | Done: ' + r.doneDate;
      if (r.turnedInDate) detail += ' | Turned In: ' + r.turnedInDate;
      if (r.grade) detail += ' | Grade: ' + r.grade;
      lines.push(detail);
    });
    lines.push('');
  } else {
    lines.push('📋 No assignments yet.');
    lines.push('');
  }

  lines.push('— Sent from DueIt v' + DueIt.APP_VERSION);
  return lines.join('\n');
};


/* ===== Calendar Sync (.ics export) ===== */

DueIt.generateICS = function generateICS(assignments) {
  var typeLabels = { homework: 'Homework', test: 'Test/Quiz', reading: 'Reading', project: 'Project' };

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function toICSDate(dateStr) {
    // Due dates are date-only, so create an all-day event
    var d = new Date(dateStr);
    var y = d.getFullYear();
    var m = pad(d.getMonth() + 1);
    var day = pad(d.getDate());
    return y + '' + m + '' + day;
  }

  function nextDay(dateStr) {
    var d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    var y = d.getFullYear();
    var m = pad(d.getMonth() + 1);
    var day = pad(d.getDate());
    return y + '' + m + '' + day;
  }

  function escapeICS(str) {
    return (str || '').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }

  function nowStamp() {
    var d = new Date();
    return d.getFullYear() + '' + pad(d.getMonth() + 1) + '' + pad(d.getDate()) + 'T' +
           pad(d.getHours()) + '' + pad(d.getMinutes()) + '' + pad(d.getSeconds());
  }

  var lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//DueIt//Homework Planner//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push('X-WR-CALNAME:DueIt Assignments');

  var pending = assignments.filter(function (a) {
    return !a.isComplete && !a.isStudied;
  });

  pending.forEach(function (a) {
    var typeLabel = typeLabels[a.type || 'homework'] || 'Homework';
    var summary = a.title + ' (' + a.className + ' ' + typeLabel + ')';
    var stamp = nowStamp();

    lines.push('BEGIN:VEVENT');
    lines.push('UID:dueit-' + a.id + '@dueit.app');
    lines.push('DTSTAMP:' + stamp);
    lines.push('DTSTART;VALUE=DATE:' + toICSDate(a.dueDate));
    lines.push('DTEND;VALUE=DATE:' + nextDay(a.dueDate));
    lines.push('SUMMARY:' + escapeICS(summary));
    lines.push('DESCRIPTION:' + escapeICS(a.className + ' ' + typeLabel));
    lines.push('STATUS:CONFIRMED');
    // Reminder alarm: 1 day before at 6pm
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-P1D');
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:' + escapeICS(a.title + ' is due tomorrow!'));
    lines.push('END:VALARM');
    // Second alarm: morning of due date
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT3H');
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:' + escapeICS(a.title + ' is due today!'));
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return { content: lines.join('\r\n'), count: pending.length };
};
