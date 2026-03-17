# DueIt — Homework Planner

A simple, portable homework planner for students. No build step, no frameworks — just open `index.html` in a browser.

## Features

- **Assignment tracking** — Add, edit, delete assignments with class, type, and due date
- **Assignment types** — Homework, Test/Quiz, Reading, Project with distinct icons
- **Test tracking** — Tests get a "Studied" toggle instead of Done/Turn In
- **Calendar view** — Monthly calendar with assignment dots, test highlights, and hover tooltips
- **Due date countdown** — Days remaining based on local timezone, with urgency glow for today/tomorrow
- **Completion workflow** — Mark Done, then Turn In (with confetti); timestamps recorded
- **Turn-in streak** — streak counter for consecutive turn-in days
- **Class management** — Add, rename, remove classes; color-coded dots on cards
- **Color schemes** — 6 accent colors, with light/dark variants
- **Dark/light mode** — Toggle with automatic accent color adjustment
- **Print view** — Printable assignment table with status, dates, and type columns
- **Import/Export** — JSON backup and restore
- **Student profile** — Name and grade stored in preferences, personalized header
- **Settings modal** — Color scheme, profile, class management, import/export

## Getting Started

1. Open `index.html` in any modern browser
2. Works directly from the filesystem (`file://` protocol) — no server needed

## Project Structure

```
index.html          Main app page
style.css           All styles (themes, accents, calendar, layout)
js/
  storage.js        localStorage wrapper
  version.js        Version number and history
  validation.js     Input validation
  countdown.js      Due date countdown logic
  assignments.js    Assignment CRUD and toggles
  classes.js        Class management
  import-export.js  JSON serialization
  calendar.js       Monthly calendar view
  renderer.js       DOM rendering (tracker, forms, class manager)
  app.js            App initialization and event wiring
```

## Running Tests

```bash
npm install
npm test
```

Tests use Vitest and cover validation, assignments, classes, countdown, and import/export logic.

## Version

Current: v0.4 — See CHANGELOG.md for full history.
