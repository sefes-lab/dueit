var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

DueIt.addAssignment = function addAssignment(assignments, input) {
  var validation = DueIt.validateAssignment(input);
  if (!validation.valid) {
    return { assignments: assignments, error: validation };
  }
  var now = new Date().toISOString();
  var newAssignment = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    type: input.type || 'homework',
    className: input.className || 'Unclassified',
    dueDate: input.dueDate,
    isComplete: false,
    isTurnedIn: false,
    createdAt: now,
    updatedAt: now,
  };
  return { assignments: assignments.concat([newAssignment]), error: null };
};

DueIt.updateAssignment = function updateAssignment(assignments, id, input) {
  var validation = DueIt.validateAssignment(input);
  if (!validation.valid) {
    return { assignments: assignments, error: validation };
  }
  var now = new Date().toISOString();
  var updated = assignments.map(function (a) {
    if (a.id !== id) return a;
    return Object.assign({}, a, {
      title: input.title.trim(),
      type: input.type || a.type || 'homework',
      className: input.className || 'Unclassified',
      dueDate: input.dueDate,
      updatedAt: now,
    });
  });
  return { assignments: updated, error: null };
};

DueIt.deleteAssignment = function deleteAssignment(assignments, id) {
  return assignments.filter(function (a) { return a.id !== id; });
};

DueIt.toggleComplete = function toggleComplete(assignments, id) {
  return assignments.map(function (a) {
    if (a.id !== id) return a;
    var nowComplete = !a.isComplete;
    var now = new Date().toISOString();
    return Object.assign({}, a, {
      isComplete: nowComplete,
      completedAt: nowComplete ? now : null,
      isTurnedIn: nowComplete ? a.isTurnedIn : false,
      turnedInAt: nowComplete ? a.turnedInAt : null,
      updatedAt: now,
    });
  });
};

DueIt.toggleTurnedIn = function toggleTurnedIn(assignments, id) {
  return assignments.map(function (a) {
    if (a.id !== id) return a;
    var nowTurnedIn = !a.isTurnedIn;
    var now = new Date().toISOString();
    return Object.assign({}, a, {
      isTurnedIn: nowTurnedIn,
      turnedInAt: nowTurnedIn ? now : null,
      updatedAt: now,
    });
  });
};

DueIt.toggleStudied = function toggleStudied(assignments, id) {
  return assignments.map(function (a) {
    if (a.id !== id) return a;
    var nowStudied = !a.isStudied;
    var now = new Date().toISOString();
    return Object.assign({}, a, {
      isStudied: nowStudied,
      studiedAt: nowStudied ? now : null,
      updatedAt: now,
    });
  });
};

DueIt.sortByDueDate = function sortByDueDate(assignments) {
  return assignments.slice().sort(function (a, b) {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

DueIt.setGrade = function setGrade(assignments, id, grade) {
  var numGrade = Number(grade);
  if (isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
    return { assignments: assignments, error: 'Grade must be a number between 0 and 100.' };
  }
  numGrade = Math.round(numGrade);
  var now = new Date().toISOString();
  var updated = assignments.map(function (a) {
    if (a.id !== id) return a;
    return Object.assign({}, a, {
      grade: numGrade,
      gradedAt: now,
      updatedAt: now,
    });
  });
  return { assignments: updated, error: null };
};

DueIt.getLetterGrade = function getLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

DueIt.getGradeColor = function getGradeColor(score) {
  if (score >= 90) return '#00b894';
  if (score >= 80) return '#0984e3';
  if (score >= 70) return '#f39c12';
  if (score >= 60) return '#e17055';
  return '#e74c3c';
};
