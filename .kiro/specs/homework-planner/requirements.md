# Requirements Document

## Introduction

DueIt is a responsive web application designed for students to manage their academic assignments. It allows students to input assignments, associate them with classes, track progress through completion and submission stages, and view upcoming due dates with countdown timers. The application supports JSON-based export and import for data portability and preference storage, and is designed to work seamlessly on laptops and mobile devices (Android and iPhone).

## Glossary

- **Planner**: The DueIt web application
- **Assignment**: A homework task with a title, description, associated class, due date, completion status, and turn-in status
- **Class**: An academic course or subject that assignments belong to
- **Class_Dropdown**: An editable dropdown component that allows the student to select or manage available classes
- **Assignment_Tracker**: A persistent, always-visible panel displaying all active assignments with due dates and countdown timers
- **Countdown_Timer**: A display showing the remaining time until an assignment's due date
- **Export_File**: A JSON file containing all assignments, classes, and user preferences
- **App_Version**: The current version number of the DueIt application, following a numeric versioning scheme (e.g., 0.1, 0.11, 0.2)
- **Version_History**: A viewable log of all version changes, including version number, date, and description of changes
- **Student**: The end user of the Planner

## Requirements

### Requirement 1: Create Assignments

**User Story:** As a Student, I want to create new assignments with relevant details, so that I can keep track of all my homework in one place.

#### Acceptance Criteria

1. THE Planner SHALL provide an input form for creating assignments with fields for title, description, class, and due date.
2. WHEN the Student submits a valid assignment form, THE Planner SHALL save the assignment and display it in the Assignment_Tracker.
3. IF the Student submits an assignment form with a missing title or due date, THEN THE Planner SHALL display a validation error indicating the missing fields.
4. WHEN the Student selects a class for an assignment, THE Class_Dropdown SHALL display all available classes as selectable options.

### Requirement 2: Edit and Delete Assignments

**User Story:** As a Student, I want to edit or delete existing assignments, so that I can keep my assignment list accurate and up to date.

#### Acceptance Criteria

1. WHEN the Student selects an assignment for editing, THE Planner SHALL populate the input form with the existing assignment details.
2. WHEN the Student submits an edited assignment form, THE Planner SHALL update the assignment and reflect the changes in the Assignment_Tracker.
3. WHEN the Student requests deletion of an assignment, THE Planner SHALL prompt for confirmation before removing the assignment.
4. WHEN the Student confirms deletion, THE Planner SHALL remove the assignment from the Assignment_Tracker.

### Requirement 3: Track Assignment Progress

**User Story:** As a Student, I want to mark assignments as complete and turned in, so that I can track my progress through each stage of my homework.

#### Acceptance Criteria

1. THE Planner SHALL maintain two independent status flags for each assignment: completion status and turn-in status.
2. WHEN the Student marks an assignment as complete, THE Planner SHALL update the completion status and visually distinguish the assignment from incomplete assignments.
3. WHEN the Student marks an assignment as turned in, THE Planner SHALL update the turn-in status and visually distinguish the assignment from assignments not yet turned in.
4. THE Planner SHALL allow the Student to unmark completion status and turn-in status independently.

### Requirement 4: Manage Classes

**User Story:** As a Student, I want to add, edit, and remove classes from a dropdown list, so that I can organize my assignments by course.

#### Acceptance Criteria

1. THE Class_Dropdown SHALL display all saved classes as selectable options.
2. WHEN the Student adds a new class name, THE Class_Dropdown SHALL save the class and include it in the list of options.
3. WHEN the Student edits an existing class name, THE Planner SHALL update the class name across all assignments associated with that class.
4. WHEN the Student removes a class, THE Planner SHALL prompt for confirmation and warn that associated assignments will become unclassified.
5. IF the Student confirms class removal, THEN THE Planner SHALL remove the class and set the class field of associated assignments to unclassified.

### Requirement 5: Persistent Assignment Tracker with Countdown

**User Story:** As a Student, I want to always see my upcoming assignments with due dates and countdowns, so that I have a constant reminder of what is due and when.

#### Acceptance Criteria

1. THE Assignment_Tracker SHALL remain visible on screen at all times during application use.
2. THE Assignment_Tracker SHALL display each active assignment's title, class, due date, and Countdown_Timer.
3. THE Countdown_Timer SHALL display the remaining days and hours until the assignment's due date.
4. WHEN an assignment's due date has passed, THE Countdown_Timer SHALL display "Overdue" instead of a countdown.
5. THE Assignment_Tracker SHALL sort assignments by due date in ascending order, with the nearest due date first.

### Requirement 6: Responsive Web Design

**User Story:** As a Student, I want to use the planner on my laptop, Android phone, or iPhone, so that I can manage my homework from any device.

#### Acceptance Criteria

1. THE Planner SHALL render a usable layout on viewports ranging from 320px to 1920px wide.
2. WHILE the viewport width is 768px or less, THE Planner SHALL display a mobile-optimized layout with touch-friendly controls.
3. WHILE the viewport width is greater than 768px, THE Planner SHALL display a desktop layout with the Assignment_Tracker visible alongside the main content area.
4. THE Planner SHALL use relative sizing and flexible layouts to adapt to varying screen dimensions.

### Requirement 7: JSON Export

**User Story:** As a Student, I want to export all my data to a JSON file, so that I can back up my planner or transfer it to another device.

#### Acceptance Criteria

1. WHEN the Student requests an export, THE Planner SHALL generate an Export_File containing all assignments, classes, and user preferences.
2. THE Planner SHALL format the Export_File as valid JSON conforming to a documented schema.
3. WHEN the Export_File is generated, THE Planner SHALL trigger a file download in the Student's browser.

### Requirement 8: JSON Import

**User Story:** As a Student, I want to import a previously exported JSON file, so that I can restore my planner data on a new device or after clearing data.

#### Acceptance Criteria

1. WHEN the Student provides an Export_File for import, THE Planner SHALL validate the file against the documented JSON schema.
2. IF the provided file does not conform to the JSON schema, THEN THE Planner SHALL display a descriptive error message and reject the import.
3. WHEN a valid Export_File is imported, THE Planner SHALL replace the current data with the imported assignments, classes, and preferences.
4. THE Planner SHALL prompt the Student for confirmation before replacing existing data during import.

### Requirement 9: JSON Round-Trip Integrity

**User Story:** As a Student, I want my exported data to be perfectly restorable on import, so that I never lose information during transfer.

#### Acceptance Criteria

1. FOR ALL valid Planner data sets, exporting to an Export_File and then importing that Export_File SHALL produce a data set equivalent to the original.
2. THE Planner SHALL preserve all assignment fields, class definitions, and user preferences through the export-import round trip.

### Requirement 11: Application Version Tracking

**User Story:** As a Student, I want to see the current version of DueIt and view a history of changes, so that I know what version I am using and what has changed over time.

#### Acceptance Criteria

1. THE Planner SHALL display the current App_Version in the application UI (e.g., in a footer or about section).
2. THE Planner SHALL start at version 0.1 upon initial release.
3. THE Planner SHALL follow a versioning scheme where minor changes increment by 0.01 (e.g., 0.1 → 0.11) and major revisions increment by 0.1 (e.g., 0.1 → 0.2).
4. THE Planner SHALL maintain a Version_History log containing the version number, date, and a brief description for each release.
5. THE Planner SHALL provide a viewable Version_History page or panel accessible from the main UI.
6. THE Export_File SHALL include the App_Version in the exported JSON data.

### Requirement 12: Data Persistence

**User Story:** As a Student, I want my assignments and settings to be saved automatically, so that I do not lose data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN the Student creates, edits, or deletes an assignment, THE Planner SHALL persist the change to local browser storage.
2. WHEN the Student modifies classes or preferences, THE Planner SHALL persist the change to local browser storage.
3. WHEN the Planner is loaded in the browser, THE Planner SHALL restore all previously saved assignments, classes, and preferences from local browser storage.