var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

(function () {
  var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAY_HEADERS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Current displayed month state
  var viewYear = new Date().getFullYear();
  var viewMonth = new Date().getMonth();

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function buildAssignmentMap(assignments) {
    var map = {};
    assignments.forEach(function (a) {
      var key = a.dueDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  DueIt.renderCalendar = function renderCalendar(container, assignments, getClassColor) {
    var map = buildAssignmentMap(assignments);
    var today = new Date();
    var todayKey = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());

    var firstDay = new Date(viewYear, viewMonth, 1).getDay();
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    var html = '<div class="cal-nav">' +
      '<button type="button" class="btn btn-sm btn-secondary cal-prev" aria-label="Previous month">&lsaquo;</button>' +
      '<span class="cal-title">' + MONTH_NAMES[viewMonth] + ' ' + viewYear + '</span>' +
      '<button type="button" class="btn btn-sm btn-secondary cal-next" aria-label="Next month">&rsaquo;</button>' +
    '</div>';

    html += '<table class="cal-grid"><thead><tr>';
    DAY_HEADERS.forEach(function (d) { html += '<th>' + d + '</th>'; });
    html += '</tr></thead><tbody><tr>';

    // Leading blanks
    for (var b = 0; b < firstDay; b++) {
      html += '<td></td>';
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var key = viewYear + '-' + pad(viewMonth + 1) + '-' + pad(day);
      var items = map[key] || [];
      var hasTest = items.some(function (a) { return a.type === 'test'; });
      var isToday = (key === todayKey);

      var cellClasses = ['cal-day'];
      if (isToday) cellClasses.push('cal-today');
      if (items.length > 0) cellClasses.push('cal-has-items');
      if (hasTest) cellClasses.push('cal-has-test');

      // Build tooltip content
      var tooltip = '';
      if (items.length > 0) {
        var typeIcons = { homework: '📝', test: '📋', reading: '📖', project: '🎨' };
        tooltip = items.map(function (a) {
          var icon = typeIcons[a.type || 'homework'] || '📝';
          return icon + ' ' + escHtml(a.className) + ': ' + escHtml(a.title);
        }).join('\n');
      }

      // Dots for assignments
      var dots = '';
      if (items.length > 0) {
        dots = '<div class="cal-dots">';
        items.forEach(function (a) {
          var color = getClassColor ? getClassColor(a.className) : '#4a6cf7';
          var isTestDot = (a.type === 'test');
          dots += '<span class="cal-dot' + (isTestDot ? ' cal-dot-test' : '') + '" style="background:' + color + '"></span>';
        });
        dots += '</div>';
      }

      html += '<td class="' + cellClasses.join(' ') + '"' +
        (tooltip ? ' data-tooltip="' + tooltip.replace(/"/g, '&quot;') + '"' : '') +
        '><span class="cal-num">' + day + '</span>' + dots + '</td>';

      if ((firstDay + day) % 7 === 0 && day < daysInMonth) {
        html += '</tr><tr>';
      }
    }

    // Trailing blanks
    var lastPos = (firstDay + daysInMonth) % 7;
    if (lastPos !== 0) {
      for (var t = lastPos; t < 7; t++) {
        html += '<td></td>';
      }
    }

    html += '</tr></tbody></table>';

    // Legend
    html += '<div class="cal-legend">' +
      '<span class="cal-legend-item"><span class="cal-dot cal-dot-test" style="background:#e74c3c"></span> Test/Quiz</span>' +
      '<span class="cal-legend-item"><span class="cal-dot" style="background:var(--clr-primary)"></span> Assignment</span>' +
    '</div>';

    container.innerHTML = html;

    // Wire nav buttons
    container.querySelector('.cal-prev').addEventListener('click', function () {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      DueIt.renderCalendar(container, assignments, getClassColor);
    });
    container.querySelector('.cal-next').addEventListener('click', function () {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      DueIt.renderCalendar(container, assignments, getClassColor);
    });
  };

  DueIt.resetCalendarView = function () {
    viewYear = new Date().getFullYear();
    viewMonth = new Date().getMonth();
  };
})();
