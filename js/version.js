var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

DueIt.APP_VERSION = '0.63';

DueIt.VERSION_HISTORY = [
  {
    version: '0.63',
    date: '2026-04-30',
    description:
      'Tiered badge system: 13 tiered badges with 4 levels each (bronze ★, silver ★★, gold ★★★, diamond ★★★★) plus 8 single-unlock badges; tier borders and star indicators; progressive descriptions showing current and next thresholds',
  },
  {
    version: '0.62',
    date: '2026-04-30',
    description:
      'Grade tracking: record grades (0–100) on turned-in assignments and studied tests; color-coded grade badges on cards (A green, B blue, C orange, D orange, F red); grade XP with tier bonuses and 1.5x multiplier for tests/projects; 10 new achievement badges (First Grade, Perfect Score, Honor Roll, Grade Tracker, Straight A\'s, Test Ace, Project Pro, Bookworm Bonus, Well Rounded Scholar, Grade Streak); grades in print and share reports',
  },
  {
    version: '0.61',
    date: '2026-04-27',
    description:
      'In-app help: ❓ button in header opens a help guide; content adapts to current mode — Student guide covers XP, badges, and assignment workflow; Parent guide covers progress summary, data exchange, and smart merge',
  },
  {
    version: '0.6',
    date: '2026-03-21',
    description:
      'Parent Mode: toggle between Student and Parent views via header pill button; Parent mode hides gamification (XP, badges, streaks, weekly stats) and shows a progress summary (total, completed, overdue); header reorganized with ⬆️ Share and ⬇️ Import icons; Calendar Sync moved to Settings under new Data & Sync section; smart merge on import (timestamp-based conflict resolution keeps newer records); Export uses Web Share API on mobile',
  },
  {
    version: '0.58',
    date: '2026-03-21',
    description:
      'Attach Data option in Share dialog: checkbox to include JSON export with progress report; mobile share includes file via Web Share API; email share downloads JSON for manual attachment',
  },
  {
    version: '0.57',
    date: '2026-03-20',
    description:
      'Font picker: choose from 6 fonts in Settings (System Default, Nunito, Patrick Hand, Baloo 2, Quicksand, Comic Neue); fonts load from Google Fonts on demand; preference saved',
  },
  {
    version: '0.56',
    date: '2026-03-20',
    description:
      'Calendar sync: 🔄 button exports all pending assignments as a single .ics file with reminder alarms (1 day before + morning of); uses Web Share API on mobile or direct download on desktop; unique UIDs prevent duplicates on re-sync',
  },
  {
    version: '0.55',
    date: '2026-03-20',
    description:
      'Unified share and print reports: both now show gamification summary (level, XP, streak, badges) plus the complete assignment list with status, due dates, and completion dates',
  },
  {
    version: '0.54',
    date: '2026-03-20',
    description:
      'Fix: switched service worker to network-first caching so CSS and JS updates apply immediately without needing a second reload',
  },
  {
    version: '0.53',
    date: '2026-03-20',
    description:
      'Full-theme color schemes: accent colors now tint backgrounds, surfaces, borders, input fields, and shadows in both light and dark modes',
  },
  {
    version: '0.52',
    date: '2026-03-20',
    description:
      'Mobile share improvements: native Web Share API support (📱 Share button on iOS/Android), mailto body truncation for long reports, touch-friendly scrolling in share dialog, responsive button layout',
  },
  {
    version: '0.51',
    date: '2026-03-20',
    description:
      'Share Progress: email progress reports with XP, level, badges, weekly stats, and upcoming assignments; configurable recipient email in Settings; copy-to-clipboard option',
  },
  {
    version: '0.5',
    date: '2026-03-20',
    description:
      'Gamification: XP & leveling system (earn XP for completing/turning in assignments, on-time bonuses), 10 unlockable achievement badges, weekly progress stats panel, level-up toast with confetti',
  },
  {
    version: '0.4',
    date: '2026-03-16',
    description:
      'Calendar view in Assignment Tracker — toggle between list and monthly calendar; assignment dots on due dates; test/quiz days highlighted; hover tooltips show items due; month navigation',
  },
  {
    version: '0.31',
    date: '2026-03-16',
    description:
      'Assignment type shown after class name in tracker meta line (e.g. "Math Test", "Spanish Homework"); tests do not get strikethrough when studied',
  },
  {
    version: '0.3',
    date: '2026-03-16',
    description:
      'Assignment types (Homework, Test/Quiz, Reading, Project); tests get Studied toggle instead of Done/Turn In; type icons on cards and print view',
  },
  {
    version: '0.2',
    date: '2026-03-16',
    description:
      'GUI fun pack: 6 accent color schemes, confetti on turn-in, turn-in streak counter, class color dots, due-date urgency glow, fun random empty states',
  },
  {
    version: '0.16',
    date: '2026-03-16',
    description:
      'Track done/turned-in timestamps; print view includes Done and Turned In date columns',
  },
  {
    version: '0.15',
    date: '2026-03-16',
    description:
      'Turn In requires Done first; clearer icons (👍 Done, 🫴 Turn In); undoing Done also clears Turn In',
  },
  {
    version: '0.14',
    date: '2026-03-16',
    description:
      'Countdown now based on local timezone instead of UTC',
  },
  {
    version: '0.13',
    date: '2026-03-16',
    description:
      'Class dropdown default changed from Unclassified to Select placeholder',
  },
  {
    version: '0.12',
    date: '2026-03-16',
    description:
      'Removed description field; renamed Title label to Assignment',
  },
  {
    version: '0.11',
    date: '2026-03-16',
    description:
      'Print and save — print assignments or save a printable HTML file; student profile and default classes in preferences',
  },
  {
    version: '0.1',
    date: '2026-03-16',
    description:
      'Initial release — assignment CRUD, class management, countdown tracker, JSON export/import, responsive layout',
  },
];
