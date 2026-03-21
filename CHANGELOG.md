# DueIt — Version History

## v0.58 — 2026-03-21

- "📎 Attach data" checkbox in Share Progress dialog
- When checked, mobile share (📱) includes the JSON data file via Web Share API
- When checked, email share (📧) downloads the JSON file alongside opening the email client, with a note to attach it
- Parent can import the attached JSON into their own DueIt to see full assignment data

## v0.57 — 2026-03-20

- Font picker in Settings header: choose from 6 fonts
  - System Default (clean sans-serif)
  - Nunito (rounded, friendly)
  - Patrick Hand (neat handwriting)
  - Baloo 2 (chunky, playful)
  - Quicksand (geometric, modern)
  - Comic Neue (casual, approachable)
- Fonts load from Google Fonts on demand (no extra weight for unused fonts)
- Font preference saved to localStorage

## v0.56 — 2026-03-20

- Calendar sync: 🔄 button in header exports all pending assignments as a single `.ics` file
- Each event includes assignment title, class, type, and two reminder alarms (1 day before + morning of)
- Unique UIDs per assignment prevent duplicates when re-syncing
- Uses Web Share API on mobile (opens Calendar app directly) or file download on desktop
- Works with Apple Calendar, Google Calendar, Outlook, and any `.ics`-compatible app
- Clean notes field showing class and assignment type

## v0.55 — 2026-03-20

- Unified share and print reports to show the same information
- Share report now includes the complete assignment list (all assignments, not just upcoming 5) with type, class, due date, countdown, status, and completion dates
- Print view now includes gamification summary (level, XP, streak, badges) at the top
- Both reports reflect identical data: gamification summary + full assignment table

## v0.54 — 2026-03-20

- Fix: service worker now uses network-first caching strategy
- CSS and JS updates apply immediately on reload instead of requiring a second visit
- Offline fallback still works — cached assets served when network is unavailable

## v0.53 — 2026-03-20

- Color schemes now tint the entire UI, not just buttons and header
- Backgrounds, cards, borders, input fields, and shadows all shift to match the selected accent color
- Works in both light and dark modes with carefully tuned palettes per accent
- 6 full-theme palettes: blue, pink, green, purple, orange, teal

## v0.52 — 2026-03-20

- Native Web Share API support on mobile (📱 Share button opens system share sheet on iOS/Android)
- mailto body truncation to prevent long reports from being cut off on mobile browsers
- Touch-friendly scrolling in share dialog preview
- Responsive share button layout for narrow screens

## v0.51 — 2026-03-20

- Share Progress button (📤) in header opens a progress report dialog
- Progress report includes XP, level, streak, overall stats, weekly stats, unlocked badges, and upcoming assignments
- Send report via email (opens mail client with pre-filled subject and body)
- Copy report to clipboard for pasting into any messaging app
- "Share Progress To" email field in Settings > Student Profile, saved to preferences
- Share dialog pre-fills recipient from saved preference; also saves new addresses on send

## v0.5 — 2026-03-20

- XP & leveling system: earn XP for completing (10), turning in (20), studying (15), and on-time submissions (10 bonus)
- 10 student levels from "Freshman" to "Legend" with progress bar in tracker sidebar
- Level-up toast notification with confetti burst on level advancement
- 10 unlockable achievement badges (First Seed, High Five, Punctual, Perfect Week, etc.)
- Badges viewable in Settings with locked/unlocked visual states
- Weekly progress stats panel showing completion count, turn-ins, and weekly percentage
- Streak bonus XP (5 per day beyond first)

## v0.4 — 2026-03-16

- Calendar view toggle (📅/📋) in Assignment Tracker
- Monthly calendar grid with colored dots on days with assignments
- Test/Quiz days highlighted with red tint and outlined dots
- Hover tooltips show assignment details for each day
- Month navigation (previous/next) with today indicator
- Legend for test vs regular assignment dots

## v0.31 — 2026-03-16

- Assignment type label shown after class name in tracker meta line (e.g. "Math Test", "Spanish Homework")
- Tests/Quizzes do not get strikethrough styling when marked as Studied

## v0.3 — 2026-03-16

- Assignment type selector: 📝 Homework, 📋 Test/Quiz, 📖 Reading, 🎨 Project
- Tests/Quizzes get a "📖 Studied" toggle instead of Done/Turn In
- Type icons shown on assignment cards and in print view
- Type dropdown shares a row with the Assignment text field

## v0.2 — 2026-03-16

- 6 accent color schemes (blue, coral, teal, purple, orange, green) — pick in Settings
- Confetti burst animation when turning in an assignment
- 🔥 Turn-in streak counter banner (2+ consecutive days)
- Class-colored left border and dot on assignment cards
- Due-tomorrow and due-today urgency glow (pulsing border)
- Fun random empty state messages with emoji

## v0.16 — 2026-03-16

- Track timestamps when assignments are marked Done and Turned In
- Print view includes Done and Turned In date columns (date only, no time)

## v0.15 — 2026-03-16

- Turn In button only appears after assignment is marked Done
- Undoing Done also clears Turn In status
- Clearer button icons: 👍 Done / 🫴 Turn In

## v0.14 — 2026-03-16

- Countdown days remaining now based on local timezone instead of UTC

## v0.13 — 2026-03-16

- Class dropdown default changed from "Unclassified" to "Select" placeholder

## v0.12 — 2026-03-16

- Removed Description field from assignment form
- Renamed "Title" label to "Assignment"

## v0.11 — 2026-03-16

- Print assignments via browser print dialog (🖨️ button)
- Student profile (name, grade) stored in preferences
- Default classes seeded on first run (Spanish, Language Arts, US History, Choir, Math, Science)
- Personalized header: "<First Name>'s DueIt"
- Class and Due Date fields share a row at the top of the form

## v0.1 — 2026-03-16

Initial release.

- Assignment CRUD (create, edit, delete)
- Progress tracking with completion and turn-in status
- Class management via editable dropdown
- Persistent assignment tracker with due date countdown (by days)
- Responsive layout for mobile and desktop
- JSON export/import for data portability
- Dark/light mode toggle
- localStorage persistence
