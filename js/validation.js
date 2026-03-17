var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

DueIt.validateAssignment = function validateAssignment(input) {
  var errors = [];
  if (!input || typeof input.title !== 'string' || input.title.trim() === '') {
    errors.push('Title is required.');
  }
  if (!input || typeof input.dueDate !== 'string' || input.dueDate.trim() === '') {
    errors.push('Due date is required.');
  }
  return { valid: errors.length === 0, errors: errors };
};

DueIt.validateImportData = function validateImportData(data) {
  var errors = [];
  if (!data || typeof data !== 'object') {
    errors.push('Import data must be an object.');
    return { valid: false, errors: errors };
  }
  if (typeof data.version !== 'number') {
    errors.push('Missing or invalid required field: version (must be a number).');
  }
  if (typeof data.appVersion !== 'string') {
    errors.push('Missing or invalid required field: appVersion (must be a string).');
  }
  if (!Array.isArray(data.assignments)) {
    errors.push('Missing or invalid required field: assignments (must be an array).');
  } else {
    for (var i = 0; i < data.assignments.length; i++) {
      var a = data.assignments[i];
      if (!a || typeof a !== 'object') {
        errors.push('assignments[' + i + '] must be an object.');
        continue;
      }
      if (typeof a.id !== 'string') errors.push('assignments[' + i + '].id must be a string.');
      if (typeof a.title !== 'string') errors.push('assignments[' + i + '].title must be a string.');
      if (typeof a.dueDate !== 'string') errors.push('assignments[' + i + '].dueDate must be a string.');
      if (typeof a.isComplete !== 'boolean') errors.push('assignments[' + i + '].isComplete must be a boolean.');
      if (typeof a.isTurnedIn !== 'boolean') errors.push('assignments[' + i + '].isTurnedIn must be a boolean.');
    }
  }
  if (!Array.isArray(data.classes)) {
    errors.push('Missing or invalid required field: classes (must be an array).');
  } else {
    for (var j = 0; j < data.classes.length; j++) {
      if (typeof data.classes[j] !== 'string') {
        errors.push('classes[' + j + '] must be a string.');
      }
    }
  }
  if (data.preferences !== undefined && data.preferences !== null && typeof data.preferences !== 'object') {
    errors.push('preferences must be an object if provided.');
  }
  return { valid: errors.length === 0, errors: errors };
};
