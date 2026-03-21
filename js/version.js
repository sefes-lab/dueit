var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

DueIt.APP_VERSION = '0.54';

DueIt.VERSION_HISTORY = [
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
