var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

/* ===== XP & Level System ===== */

var XP_VALUES = {
  COMPLETE: 10,
  TURN_IN: 20,
  STUDIED: 15,
  ON_TIME: 10,       // bonus for turning in before due date
  STREAK_BONUS: 5,   // per streak day beyond 1
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


/* ===== Progress Report (for sharing) ===== */

DueIt.buildProgressReport = function buildProgressReport(assignments, preferences, streak) {
  var name = (preferences.studentName || '').trim();
  var grade = (preferences.studentGrade || '').trim();
  var first = name.split(' ')[0] || 'Student';
  var now = new Date();
  var dateStr = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // XP & Level
  var xp = DueIt.computeXP(assignments);
  var lvl = DueIt.computeLevel(xp);

  // Overall stats
  var total = assignments.length;
  var completed = assignments.filter(function (a) { return a.isComplete || a.isStudied; }).length;
  var turnedIn = assignments.filter(function (a) { return a.isTurnedIn; }).length;
  var onTime = assignments.filter(function (a) {
    if (!a.isTurnedIn || !a.turnedInAt || !a.dueDate) return false;
    return new Date(a.turnedInAt) <= new Date(a.dueDate + 'T23:59:59');
  }).length;

  // Weekly stats
  var weekly = DueIt.computeWeeklyStats(assignments);

  // Badges
  var badges = DueIt.computeBadges(assignments);
  var unlocked = badges.filter(function (b) { return b.unlocked; });

  // Upcoming (not complete, sorted by due date)
  var upcoming = DueIt.sortByDueDate(
    assignments.filter(function (a) { return !a.isComplete && !a.isStudied; })
  ).slice(0, 5);

  // Build the report
  var lines = [];
  lines.push('📊 DueIt Progress Report');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(first + (grade ? ' (Grade ' + grade + ')' : '') + ' — ' + dateStr);
  lines.push('');

  // Level & XP
  lines.push('⭐ Level ' + lvl.level + ' — ' + lvl.title);
  lines.push('   ' + xp + ' XP earned');
  if (streak >= 2) {
    lines.push('🔥 ' + streak + '-day turn-in streak!');
  }
  lines.push('');

  // Overall
  lines.push('📈 Overall Progress');
  lines.push('   Assignments: ' + total);
  lines.push('   Completed:   ' + completed + '/' + total + (total > 0 ? ' (' + Math.round(completed / total * 100) + '%)' : ''));
  lines.push('   Turned In:   ' + turnedIn);
  lines.push('   On Time:     ' + onTime);
  lines.push('');

  // This week
  if (weekly.total > 0) {
    lines.push('📅 This Week');
    lines.push('   Done: ' + weekly.completed + '/' + weekly.total + ' (' + weekly.completionRate + '%)');
    lines.push('   Turned In: ' + weekly.turnedIn);
    lines.push('');
  }

  // Badges
  if (unlocked.length > 0) {
    lines.push('🏆 Badges Unlocked (' + unlocked.length + '/' + badges.length + ')');
    unlocked.forEach(function (b) {
      lines.push('   ' + b.emoji + ' ' + b.name);
    });
    lines.push('');
  }

  // Upcoming
  if (upcoming.length > 0) {
    lines.push('📋 Coming Up');
    upcoming.forEach(function (a) {
      var cd = DueIt.computeCountdown(a.dueDate, now);
      var typeIcons = { homework: '📝', test: '📋', reading: '📖', project: '🎨' };
      var icon = typeIcons[a.type || 'homework'] || '📝';
      lines.push('   ' + icon + ' ' + a.title + ' (' + a.className + ') — ' + cd.label);
    });
    lines.push('');
  }

  lines.push('— Sent from DueIt v' + DueIt.APP_VERSION);

  return lines.join('\n');
};
