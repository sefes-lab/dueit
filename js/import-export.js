var DueIt = (typeof globalThis !== 'undefined' ? globalThis : window).DueIt || {};
(typeof globalThis !== 'undefined' ? globalThis : window).DueIt = DueIt;

DueIt.serializePlannerData = function serializePlannerData(data) {
  var exportData = {
    version: 1,
    appVersion: DueIt.APP_VERSION,
    assignments: data.assignments,
    classes: data.classes,
    preferences: data.preferences || {},
  };
  return JSON.stringify(exportData, null, 2);
};

DueIt.deserializePlannerData = function deserializePlannerData(json) {
  var parsed;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    return { data: null, error: 'The selected file is not valid JSON.' };
  }
  var validation = DueIt.validateImportData(parsed);
  if (!validation.valid) {
    return { data: null, error: validation.errors.join(' ') };
  }
  return { data: parsed, error: null };
};

DueIt.triggerExportDownload = function triggerExportDownload(data) {
  var json = DueIt.serializePlannerData(data);
  var blob = new Blob([json], { type: 'application/json' });
  var file = new File([blob], 'dueit-data.json', { type: 'application/json' });

  // Try Web Share API with file (mobile)
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ title: 'DueIt Data', files: [file] }).catch(function () {
      _downloadBlob(blob);
    });
  } else {
    _downloadBlob(blob);
  }
};

function _downloadBlob(blob) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'dueit-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

DueIt.mergeImportData = function mergeImportData(local, imported) {
  var localMap = {};
  local.assignments.forEach(function (a) { localMap[a.id] = a; });

  var merged = [];
  var seen = {};

  // Process imported assignments
  (imported.assignments || []).forEach(function (a) {
    seen[a.id] = true;
    var existing = localMap[a.id];
    if (!existing) {
      merged.push(a);
    } else {
      var importedTime = new Date(a.updatedAt || 0).getTime();
      var localTime = new Date(existing.updatedAt || 0).getTime();
      merged.push(importedTime > localTime ? a : existing);
    }
  });

  // Retain local-only assignments
  local.assignments.forEach(function (a) {
    if (!seen[a.id]) merged.push(a);
  });

  // Union classes (no duplicates)
  var classSet = {};
  (local.classes || []).forEach(function (c) { classSet[c] = true; });
  (imported.classes || []).forEach(function (c) { classSet[c] = true; });

  return {
    assignments: merged,
    classes: Object.keys(classSet),
    preferences: local.preferences,
  };
};

DueIt.readFileAsText = function readFileAsText(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(new Error('Could not read the selected file.')); };
    reader.readAsText(file);
  });
};
