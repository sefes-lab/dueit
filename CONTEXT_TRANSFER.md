# DueIt — Context Transfer Document

## What Is This App
DueIt is a homework planner PWA for a middle school student (April Shterling, Grade 8). It's built with plain HTML5/CSS/JS — no build step, no framework. Open `index.html` in a browser or deploy to GitHub Pages.

## GitHub
- Account: `sefes-lab`
- Email: `leflyman@gmail.com`
- Repo: `https://github.com/sefes-lab/dueit`
- GitHub Pages: `https://sefes-lab.github.io/dueit/`
- License: All Rights Reserved (proprietary)

## Current Version: 0.58

## Tech Stack
- Plain HTML5 + CSS + JS (no build step, no framework)
- All JS files use a shared `DueIt` global namespace pattern: `var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};`
- No ES module import/export — files loaded via `<script>` tags in `index.html` in dependency order
- `package.json` has `"type": "module"` only for vitest compatibility
- Tests: vitest + fast-check (24 tests, all passing)
- PWA: `manifest.json`, `sw.js` (service worker with cache versioning), SVG icons

## Project Structure
```
index.html          — Main HTML (loads all JS via script tags)
style.css           — All styles (dark/light mode, accent colors, calendar, print)
LICENSE             — All Rights Reserved
CHANGELOG.md        — Version history
README.md           — Project documentation
manifest.json       — PWA manifest
sw.js               — Service worker (offline caching)
icons/icon.svg      — App icon (calendar with stars + DUEIT letters)
icons/icon-maskable.svg — Maskable PWA icon
js/app.js           — Main app wiring, event listeners, initialization
js/storage.js       — localStorage persistence
js/assignments.js   — Assignment CRUD logic
js/classes.js       — Class management
js/validation.js    — Form validation
js/countdown.js     — Due date countdown (local timezone, days only)
js/import-export.js — JSON export/import
js/renderer.js      — DOM rendering (cards, forms, tracker, print)
js/calendar.js      — Calendar view module (monthly grid, dots, tooltips)
js/version.js       — Version constant + version history array
vitest.config.js    — Test config (jsdom environment)
__tests__/smoke.test.js — 24 smoke tests
package.json        — Dev dependencies only (vitest, fast-check)
.gitignore          — Excludes node_modules, .kiro/, .vscode/*, .DS_Store
```

## Key Features (v0.54)
- Assignment CRUD with class, type (Homework/Test/Quiz/Reading/Project), due date
- Progress tracking: Done (👍), Turn In (🫴), Studied (📖 for tests)
- Turn In requires Done first; undoing Done clears Turn In
- Due date countdown by days (local timezone)
- Calendar view toggle (📅/📋) — monthly grid with colored dots, test highlighting, tooltips
- 6 full-theme color schemes that tint backgrounds, surfaces, borders, inputs, and shadows (light/dark variants)
- Confetti on turn-in, streak counter
- Class color dots, urgency glow for due-soon items
- XP & leveling system (10 levels, Freshman→Legend), 10 unlockable achievement badges, weekly progress stats
- Share Progress (📤) — email or copy progress reports with XP, level, badges, stats, upcoming assignments
- Native Web Share API on mobile (📱 Share button)
- Student profile (name, grade, share-to email) in Settings modal (⚙️)
- Default classes: Spanish, Language Arts, US History, Choir, Math, Science
- Personalized header: "April's DueIt"
- Dark/light mode toggle (🌙/☀️)
- Print view (🖨️) with done/turned-in dates
- JSON export/import for data portability
- PWA: installable, works offline
- Service worker uses network-first caching for instant updates

## User Preferences & Rules
- App is for a middle school student — simplicity and portability are priorities
- No build step — must work by opening `index.html` directly (`file://` protocol)
- Version scheme: start at 0.1, minor changes +0.01, major revisions +0.1
- Don't bump version for trivial UI tweaks
- Due dates are date-only (no time), countdown by days only
- Settings in a modal, not on the main page
- Version history in `CHANGELOG.md`, not in the app UI
- Default student: "April Shterling", Grade "8"
- Darker color schemes follow dark mode; lighter follow light mode
- Tests should NOT get strikethrough when studied
- All assignment types show suffix after class name in tracker meta line
- `--clr-on-primary` CSS variable handles text contrast on accent colors (e.g. dark text on orange in light mode)
- Minimize unnecessary questions — just do the work
- Keep version increments and CHANGELOG updated with each meaningful change

## Spec Files (local only, gitignored)
- `.kiro/specs/homework-planner/requirements.md`
- `.kiro/specs/homework-planner/design.md`
- `.kiro/specs/homework-planner/tasks.md`
- `.kiro/specs/homework-planner/.config.kiro`

## Pending Items
- If `.kiro/` was already committed to GitHub, run: `git rm -r --cached .kiro/ && git commit -m "Remove .kiro/ from repo" && git push`
- `.kiro/` is now in `.gitignore` so it won't be re-tracked

## Icon Design Notes
Calendar icon with dark body, grid lines visible, hand-drawn outlined stars (not filled) randomly placed/sized in day cells, "DUEIT" letters in first row of grid boxes (NOT header bar), monochrome blue gradient, no numbers.
