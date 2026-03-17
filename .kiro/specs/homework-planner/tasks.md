# Implementation Plan: DueIt — Homework Planner

## Overview

Implement DueIt as a vanilla HTML5 + CSS + JavaScript single-page application with no build step. Business logic lives in pure JS modules under `js/`, DOM rendering is isolated in `renderer.js`, and `app.js` wires everything together. All data persists in localStorage. Tests use Vitest + fast-check via Node.js. The existing React/TypeScript `src/` directory is removed and replaced with static files.

## Tasks

- [x] 1. Clean up old React scaffolding and set up project structure
  - [x] 1.1 Remove React/TypeScript source files and config
    - Delete `src/` directory (App.tsx, main.tsx, types.ts, constants.ts, version.ts, hooks/, components/, services/, utils/, assets/, etc.)
    - Delete `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `eslint.config.js`
    - Delete `public/vite.svg` and `src/vite-env.d.ts`
    - Keep `package.json` for dev dependencies (Vitest, fast-check) only
    - _Requirements: N/A (cleanup)_

  - [x] 1.2 Create `js/version.js` with app version and history
    - Export `APP_VERSION = '0.1'` and `VERSION_HISTORY` array
    - Initial entry: `{ version: '0.1', date: '2025-07-11', description: 'Initial release — assignment CRUD, class management, countdown tracker, JSON export/import, responsive layout' }`
    - _Requirements: 11.2, 11.3, 11.4_

  - [x] 1.3 Create `js/storage.js` with localStorage abstraction
    - Export `load(key)`, `save(key, data)`, `clearAll()` functions
    - Export `STORAGE_KEYS` object with `ASSIGNMENTS`, `CLASSES`, `PREFERENCES` keys
    - Handle `QuotaExceededError` and unavailable localStorage gracefully
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 1.4 Write property test for localStorage persistence round trip
    - **Property 14: LocalStorage persistence round trip**
    - **Validates: Requirements 12.1, 12.2, 12.3**

- [x] 2. Implement validation and countdown modules
  - [x] 2.1 Create `js/validation.js`
    - Export `validateAssignment(input)` returning `{ valid, errors }`
    - Reject empty/whitespace title or missing due date
    - Export `validateImportData(data)` returning `{ valid, errors }`
    - Validate required fields, types, and structure of `PlannerData` schema
    - _Requirements: 1.3, 8.1, 8.2_

  - [ ]* 2.2 Write property tests for validation
    - **Property 2: Invalid assignments are rejected**
    - **Validates: Requirements 1.3**
    - **Property 12: Import validation accepts valid and rejects invalid data**
    - **Validates: Requirements 8.1, 8.2**

  - [x] 2.3 Create `js/countdown.js`
    - Export `computeCountdown(dueDateISO, now)` returning `{ isOverdue, days, hours, label }`
    - Return days/hours and label like "2d 5h" for future dates, `isOverdue: true` and label "Overdue" for past dates
    - _Requirements: 5.3, 5.4_

  - [ ]* 2.4 Write property test for countdown computation
    - **Property 9: Countdown computation is correct**
    - **Validates: Requirements 5.3, 5.4**

- [x] 3. Implement assignment and class business logic modules
  - [x] 3.1 Create `js/assignments.js`
    - Export `addAssignment(assignments, input)` — validates input, generates UUID via `crypto.randomUUID()`, returns `{ assignments, error }`
    - Export `updateAssignment(assignments, id, input)` — validates input, returns `{ assignments, error }`
    - Export `deleteAssignment(assignments, id)` — returns new array without the assignment
    - Export `toggleComplete(assignments, id)` and `toggleTurnedIn(assignments, id)` — return new array with toggled flag
    - Export `sortByDueDate(assignments)` — returns sorted copy ascending by dueDate
    - _Requirements: 1.2, 1.3, 2.2, 2.4, 3.1, 3.2, 3.3, 3.4, 5.5_

  - [ ]* 3.2 Write property tests for assignment CRUD
    - **Property 1: Valid assignment creation grows the list**
    - **Validates: Requirements 1.2**
    - **Property 3: Editing an assignment preserves identity and applies changes**
    - **Validates: Requirements 2.2**
    - **Property 4: Deleting an assignment removes exactly one item**
    - **Validates: Requirements 2.4**
    - **Property 5: Status flags are independent**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [ ]* 3.3 Write property test for assignment sorting
    - **Property 10: Assignments are sorted by due date ascending**
    - **Validates: Requirements 5.5**

  - [x] 3.4 Create `js/classes.js`
    - Export `addClass(classes, name)` — returns `{ classes, error }`
    - Export `renameClass(classes, assignments, oldName, newName)` — returns `{ classes, assignments }`
    - Export `removeClass(classes, assignments, name)` — returns `{ classes, assignments }` with affected assignments set to "Unclassified"
    - _Requirements: 4.2, 4.3, 4.5_

  - [ ]* 3.5 Write property tests for class management
    - **Property 6: Adding a class grows the class list**
    - **Validates: Requirements 4.2**
    - **Property 7: Renaming a class propagates to all assignments**
    - **Validates: Requirements 4.3**
    - **Property 8: Removing a class unclassifies associated assignments**
    - **Validates: Requirements 4.5**

- [x] 4. Implement JSON export/import module
  - [x] 4.1 Create `js/import-export.js`
    - Export `serializePlannerData(data)` — returns JSON string with `appVersion` from `APP_VERSION`
    - Export `deserializePlannerData(json)` — parses JSON, validates via `validateImportData`, returns `{ data, error }`
    - Export `triggerExportDownload(data)` — creates Blob, triggers download via `URL.createObjectURL` and a temporary `<a>` element
    - Export `readFileAsText(file)` — returns `Promise<string>` from FileReader
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 11.6_

  - [ ]* 4.2 Write property tests for export/import
    - **Property 11: Export produces valid JSON containing all data**
    - **Validates: Requirements 7.1, 7.2**
    - **Property 13: Export-import round trip preserves data**
    - **Validates: Requirements 9.1, 9.2**
    - **Property 15: Export includes app version**
    - **Validates: Requirements 11.6**

- [x] 5. Checkpoint — Ensure all business logic tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npx vitest --run` to verify all pure-function module tests pass

- [x] 6. Build the HTML structure and CSS styling
  - [x] 6.1 Create `index.html` with full page structure
    - Header with app title "DueIt"
    - Main content area with assignment form (title, description, class dropdown, due date fields), class manager section, import/export controls
    - Assignment Tracker sidebar panel with assignment list container
    - Version History toggleable panel
    - Footer displaying current app version with link to version history
    - Reusable `<dialog>` element for confirmation prompts (delete assignment, remove class, import overwrite)
    - Load `style.css` and `js/app.js` (as `type="module"`)
    - _Requirements: 1.1, 1.4, 4.1, 5.1, 5.2, 11.1, 11.5_

  - [x] 6.2 Create `style.css` with responsive layout
    - Mobile-first base styles with touch-friendly controls (min 44px tap targets)
    - Desktop breakpoint at 768px: sidebar layout with Assignment Tracker alongside main content
    - Flexible layouts using CSS Grid/Flexbox with relative sizing
    - Visual distinction for completed assignments (e.g., strikethrough or muted color)
    - Visual distinction for turned-in assignments (e.g., badge or color change)
    - Styling for validation error messages, confirmation dialogs, form elements
    - Overdue countdown styling (e.g., red text)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 3.2, 3.3_

- [x] 7. Implement renderer module (DOM manipulation)
  - [x] 7.1 Create `js/renderer.js`
    - Export `renderTracker(assignments, now)` — renders sorted assignment cards with countdown timers into the tracker panel
    - Export `renderClassDropdown(classes)` — populates the class `<select>` options
    - Export `renderClassManager(classes)` — renders the class list with edit/remove buttons
    - Export `renderVersionHistory(history)` — renders version log entries into the version history panel
    - Export `populateFormForEdit(assignment)` — fills the assignment form fields for editing
    - Export `clearForm()` — resets the assignment form to empty state
    - Export `showFieldError(fieldId, message)` and `clearFieldErrors()` — inline validation error display
    - _Requirements: 1.1, 1.3, 2.1, 4.1, 5.2, 5.3, 5.4, 11.4, 11.5_

- [x] 8. Wire everything together in app.js
  - [x] 8.1 Create `js/app.js` entry point
    - Load state from localStorage on init (assignments, classes, preferences)
    - Bind event listeners: form submit (create/edit), delete buttons, complete/turned-in toggles, class add/rename/remove, export button, import file input, version history toggle
    - On every state mutation: update in-memory state, persist to localStorage, re-render affected DOM sections
    - Set up `setInterval` to refresh countdown timers every 60 seconds
    - Wire confirmation `<dialog>` for delete assignment, remove class, and import overwrite
    - Handle corrupted localStorage data: log error, clear corrupted key, start with empty state, display notice
    - Handle unavailable localStorage: display warning, disable auto-save, prompt user to use export/import
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 3.2, 3.3, 3.4, 4.2, 4.3, 4.4, 4.5, 7.1, 7.3, 8.3, 8.4, 12.1, 12.2, 12.3_

- [x] 9. Checkpoint — Ensure app works end-to-end
  - Ensure all tests pass with `npx vitest --run`
  - Verify `index.html` can be opened directly in a browser and all features work
  - Ask the user if questions arise

- [x] 10. Update project configuration for test-only Node usage
  - [x] 10.1 Update `package.json` for test-only dependencies
    - Keep only `vitest` and `fast-check` as dev dependencies
    - Remove all React, TypeScript, Vite, eslint, and related dependencies
    - Update test script to `"test": "vitest --run"`
    - _Requirements: N/A (test infrastructure)_

  - [x] 10.2 Create `vitest.config.js` for test runner
    - Configure test include pattern: `__tests__/**/*.test.js`
    - Enable globals
    - Replace existing `vitest.config.ts`
    - _Requirements: N/A (test infrastructure)_

  - [ ]* 10.3 Write unit tests for key behaviors
    - Test assignment form validation with specific valid and invalid inputs
    - Test countdown with known dates (exactly 2 days out, at due date, 1 minute past)
    - Test localStorage quota exceeded handling
    - Test corrupted localStorage data recovery
    - Test version constant and history structure
    - _Requirements: 1.3, 5.3, 5.4, 11.2, 11.4, 12.1_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass with `npx vitest --run`
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The app requires no build step — open `index.html` in a browser to run
- Node.js is only needed for running tests via Vitest
- All business logic modules are pure functions with no DOM dependencies, directly testable in Node
