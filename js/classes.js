var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

DueIt.addClass = function addClass(classes, name) {
  var trimmed = name.trim();
  if (!trimmed) {
    return { classes: classes, error: 'Class name cannot be empty.' };
  }
  if (classes.indexOf(trimmed) !== -1) {
    return { classes: classes, error: 'Class "' + trimmed + '" already exists.' };
  }
  return { classes: classes.concat([trimmed]), error: null };
};

DueIt.renameClass = function renameClass(classes, assignments, oldName, newName) {
  var trimmed = newName.trim();
  var updatedClasses = classes.map(function (c) { return c === oldName ? trimmed : c; });
  var updatedAssignments = assignments.map(function (a) {
    if (a.className !== oldName) return a;
    return Object.assign({}, a, { className: trimmed, updatedAt: new Date().toISOString() });
  });
  return { classes: updatedClasses, assignments: updatedAssignments };
};

DueIt.removeClass = function removeClass(classes, assignments, name) {
  var updatedClasses = classes.filter(function (c) { return c !== name; });
  var updatedAssignments = assignments.map(function (a) {
    if (a.className !== name) return a;
    return Object.assign({}, a, { className: 'Unclassified', updatedAt: new Date().toISOString() });
  });
  return { classes: updatedClasses, assignments: updatedAssignments };
};
