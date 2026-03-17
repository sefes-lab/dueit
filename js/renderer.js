var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

function _escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function _escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch (e) {
    return iso;
  }
}

DueIt.renderTracker = function renderTracker(assignments, now, getClassColor) {
  var container = document.getElementById('tracker-list');
  if (!container) return;

  var sorted = DueIt.sortByDueDate(assignments);

  if (sorted.length === 0) {
    var emptyMsgs = [
      '📚✨ No assignments yet — enjoy the free time!',
      '🎉 All clear! Add an assignment to get started.',
      '🌈 Nothing due — what a great day!',
      '🚀 Ready for liftoff! Add your first assignment.',
      '☀️ No homework? Must be a good day!',
    ];
    var msg = emptyMsgs[Math.floor(Math.random() * emptyMsgs.length)];
    container.innerHTML = '<p class="empty-state">' + msg + '</p>';
    return;
  }

  container.innerHTML = sorted.map(function (a) {
    var cd = DueIt.computeCountdown(a.dueDate, now);
    var classes = ['assignment-card'];
    if (cd.isOverdue) classes.push('overdue');
    if (cd.days === 0 && !cd.isOverdue) classes.push('due-today');
    if (cd.days === 1 && !cd.isOverdue) classes.push('due-tomorrow');
    if (a.isComplete) classes.push('completed');

    var countdownClass = cd.isOverdue ? 'overdue-text' : (cd.days === 0 ? 'due-today-text' : '');
    var dotColor = getClassColor ? getClassColor(a.className) : '#4a6cf7';
    var typeIcons = { homework: '📝', test: '📋', reading: '📖', project: '🎨' };
    var typeIcon = typeIcons[a.type || 'homework'] || '📝';
    var isTest = (a.type === 'test');
    var typeLabels = { homework: ' Homework', test: ' Test', reading: ' Reading', project: ' Project' };
    var metaLabel = _escapeHtml(a.className) + (typeLabels[a.type || 'homework'] || '');

    var actionButtons;
    if (isTest) {
      actionButtons =
        '<button class="btn btn-sm btn-secondary toggle-studied-btn" data-id="' + a.id + '">' +
          (a.isStudied ? '↩ Not Studied' : '📖 Studied') +
        '</button>';
    } else {
      actionButtons =
        '<button class="btn btn-sm btn-secondary toggle-complete-btn" data-id="' + a.id + '">' +
          (a.isComplete ? '↩ Not Done' : '👍 Done') +
        '</button>' +
        (a.isComplete
          ? '<button class="btn btn-sm btn-secondary toggle-turned-in-btn" data-id="' + a.id + '">' +
              (a.isTurnedIn ? '↩ Undo' : '🫴 Turn In') +
            '</button>'
          : '');
    }

    return '<div class="' + classes.join(' ') + '" data-id="' + a.id + '" style="border-left:4px solid ' + dotColor + '">' +
      '<div class="assignment-title">' +
        typeIcon + ' ' + _escapeHtml(a.title) +
        (a.isTurnedIn ? '<span class="turned-in-badge">Turned In</span>' : '') +
        (a.isStudied ? '<span class="turned-in-badge" style="background:#f39c12">Studied</span>' : '') +
      '</div>' +
      '<div class="assignment-meta">' +
        '<span class="class-dot" style="background:' + dotColor + '"></span>' +
        metaLabel + ' · ' + _formatDate(a.dueDate) +
      '</div>' +
      '<div class="assignment-countdown ' + countdownClass + '">' +
        cd.label +
      '</div>' +
      '<div class="assignment-actions">' +
        actionButtons +
        '<button class="btn btn-sm btn-secondary edit-btn" data-id="' + a.id + '">✏️</button>' +
        '<button class="btn btn-sm btn-danger delete-btn" data-id="' + a.id + '">🗑</button>' +
      '</div>' +
    '</div>';
  }).join('');
};

DueIt.renderClassDropdown = function renderClassDropdown(classes) {
  var select = document.getElementById('className');
  if (!select) return;
  var current = select.value;
  select.innerHTML = '<option value="" disabled selected>Select</option>';
  classes.forEach(function (c) {
    var opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
  var options = Array.prototype.slice.call(select.options);
  if (options.some(function (o) { return o.value === current; })) {
    select.value = current;
  }
};

DueIt.renderClassManager = function renderClassManager(classes) {
  var list = document.getElementById('class-list');
  if (!list) return;
  if (classes.length === 0) {
    list.innerHTML = '<li class="empty-state">No classes added yet.</li>';
    return;
  }
  list.innerHTML = classes.map(function (c) {
    return '<li>' +
      '<span class="class-name">' + _escapeHtml(c) + '</span>' +
      '<button class="btn btn-sm btn-secondary rename-class-btn" data-name="' + _escapeAttr(c) + '">Rename</button>' +
      '<button class="btn btn-sm btn-danger remove-class-btn" data-name="' + _escapeAttr(c) + '">Remove</button>' +
    '</li>';
  }).join('');
};

DueIt.populateFormForEdit = function populateFormForEdit(assignment) {
  document.getElementById('edit-id').value = assignment.id;
  document.getElementById('title').value = assignment.title;
  document.getElementById('assignmentType').value = assignment.type || 'homework';
  document.getElementById('className').value = assignment.className;
  document.getElementById('dueDate').value = assignment.dueDate.slice(0, 10);
  document.getElementById('form-heading').textContent = 'Edit Assignment';
  document.getElementById('form-submit-btn').textContent = 'Save Changes';
  document.getElementById('form-cancel-btn').hidden = false;
};

DueIt.clearForm = function clearForm() {
  document.getElementById('assignment-form').reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('form-heading').textContent = 'New Assignment';
  document.getElementById('form-submit-btn').textContent = 'Add Assignment';
  document.getElementById('form-cancel-btn').hidden = true;
  DueIt.clearFieldErrors();
};

DueIt.showFieldError = function showFieldError(fieldId, message) {
  var el = document.getElementById(fieldId + '-error');
  if (el) el.textContent = message;
};

DueIt.clearFieldErrors = function clearFieldErrors() {
  var els = document.querySelectorAll('.field-error');
  for (var i = 0; i < els.length; i++) { els[i].textContent = ''; }
};
