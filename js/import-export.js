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
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'dueit-export-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

DueIt.readFileAsText = function readFileAsText(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(new Error('Could not read the selected file.')); };
    reader.readAsText(file);
  });
};
