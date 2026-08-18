// ============================================
// STABLE DATA LAYER - Deploy once, configure from client
// ============================================
const CONFIG = {
  SHEET_NAME: 'Reservas',
  OWNER_EMAIL: 'contacto@anzest.es',
  CONFIRMATION_SUBJECT: 'Confirmacion de reserva - Anzest',
  OWNER_SUBJECT: function(data) {
    return 'Nueva reserva - ' + data.name + ', ' + data.date;
  },
  CONFIRMATION_BODY: function(data) {
    return (
      'Hola ' + data.name + ',\n\n' +
      'Gracias por vuestra reserva! Os esperamos el ' + data.date + ' a las ' + data.time + '. ' +
      data.guests + (parseInt(data.guests) > 1 ? ' personas' : ' persona') + '.\n\n' +
      'Un saludo,\nAnzest'
    );
  },
  OWNER_BODY: function(data) {
    return (
      'Nueva reserva\n\n' +
      'Nombre: ' + data.name + '\n' +
      'Email: ' + (data.email || 'No proporcionado') + '\n' +
      'Fecha: ' + data.date + '\n' +
      'Hora: ' + data.time + '\n' +
      'Personas: ' + data.guests + '\n' +
      'Telefono: ' + (data.phone || 'No proporcionado') + '\n' +
      'Invitado por: ' + (data.invitedBy || 'No proporcionado') + '\n' +
      'Notas: ' + (data.requests || 'Ninguna') + '\n\n' +
      'Enviado: ' + new Date().toLocaleString()
    );
  }
};

// ============================================
// POST router
// ============================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === 'all') {
      return allReservations(data.date);
    }

    if (data.action === 'counts') {
      return slotCounts(data.date);
    }

    if (data.action === 'config') {
      return jsonResponse(getBookingConfig());
    }

    if (data.action === 'check-email') {
      return checkEmailExists(data.email);
    }

    if (data.action === 'submit') {
      return createReservation(data);
    }

    return jsonResponse({ success: false, error: 'unknown action' });

  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function allReservations(date) {
  var sheet = getSheet();
  var rows = sheet.getDataRange().getValues();
  var result = [];

  for (var i = 1; i < rows.length; i++) {
    if (!date || cellDate(rows[i][0]) === date) {
      result.push(rowToObj(rows[i]));
    }
  }

  return jsonResponse({ success: true, reservations: result });
}

function slotCounts(date) {
  var sheet = getSheet();
  var rows = sheet.getDataRange().getValues();
  var counts = {};

  for (var i = 1; i < rows.length; i++) {
    if (cellDate(rows[i][0]) === date) {
      var time = cellTime(rows[i][1]);
      counts[time] = (counts[time] || 0) + 1;
    }
  }

  return jsonResponse({ success: true, counts: counts });
}

function checkEmailExists(email) {
  var target = String(email || '').trim().toLowerCase();
  if (!target) return jsonResponse({ success: true, exists: false });

  var rows = getSheet().getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][4] || '').trim().toLowerCase() === target) {
      return jsonResponse({ success: true, exists: true });
    }
  }
  return jsonResponse({ success: true, exists: false });
}

function createReservation(data) {
  var sheet = getSheet();

  if (isReservationBlocked_(data.date, data.time)) {
    return jsonResponse({
      success: false,
      error: 'blocked',
      message: 'Esa fecha u hora no está disponible.'
    });
  }

  // Atomic capacity check
  if (data.maxPerSlot) {
    var rows = sheet.getDataRange().getValues();
    var count = 0;
    for (var i = 1; i < rows.length; i++) {
      if (cellDate(rows[i][0]) === data.date && cellTime(rows[i][1]) === data.time) {
        count++;
      }
    }
    if (count >= data.maxPerSlot) {
      return jsonResponse({ success: false, error: 'full' });
    }
  }

  sheet.appendRow([
    data.date || '',
    data.time || '',
    data.guests || '',
    data.name || '',
    data.email || '',
    data.phone || '',
    data.invitedBy || '',
    data.requests || '',
    new Date()
  ]);

  if (data.email) {
    GmailApp.sendEmail(data.email, CONFIG.CONFIRMATION_SUBJECT, CONFIG.CONFIRMATION_BODY(data));
  }
  GmailApp.sendEmail(CONFIG.OWNER_EMAIL, CONFIG.OWNER_SUBJECT(data), CONFIG.OWNER_BODY(data));

  return jsonResponse({ success: true });
}

// ============================================
// Helpers
// ============================================
function getSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  return sheet || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function cellDate(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(val);
}

function cellTime(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'HH:mm');
  }
  return String(val);
}

function rowToObj(row) {
  return {
    date: cellDate(row[0]),
    time: cellTime(row[1]),
    guests: row[2],
    name: row[3],
    email: row[4],
    phone: row[5],
    invitedBy: row[6],
    requests: row[7],
    timestamp: row[8]
  };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// Calendario (pestaña "Calendario")
// Fila 2 = periodo abierto. Debajo de "Fecha" = bloqueos.
// Día entero: fecha y horas vacías. Horas: fecha + Desde/Hasta.
// ============================================
var CALENDARIO_SHEET = 'Calendario';
var SLOT_START_MIN = 8 * 60;
var SLOT_END_MIN = 20 * 60;

function setupCalendario() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName(CALENDARIO_SHEET)) return;

  var sh = ss.insertSheet(CALENDARIO_SHEET);
  sh.getRange(1, 1, 2, 2).setValues([
    ['Desde', 'Hasta'],
    ['2026-08-23', '2026-09-15']
  ]);
  sh.getRange(4, 1, 1, 4).setValues([['Fecha', 'Desde', 'Hasta', 'Nota']]);
  sh.setFrozenRows(4);
  sh.setColumnWidths(1, 4, 140);
}

function getBookingConfig() {
  setupCalendario();
  var parsed = readCalendario_(SpreadsheetApp.getActiveSpreadsheet());
  return {
    success: true,
    minDate: parsed.minDate,
    maxDate: parsed.maxDate,
    blockedDays: parsed.days,
    blockedSlots: parsed.slots,
    blockedTimesEveryDay: parsed.everyDay
  };
}

function isReservationBlocked_(date, time) {
  var cfg = getBookingConfig();
  var ymd = toYmd_(date);
  var hm = toHm_(time);
  if (!ymd) return true;
  if (cfg.minDate && ymd < cfg.minDate) return true;
  if (cfg.maxDate && ymd > cfg.maxDate) return true;
  if (cfg.blockedDays.indexOf(ymd) !== -1) return true;
  if (hm && cfg.blockedTimesEveryDay.indexOf(hm) !== -1) return true;
  var daySlots = cfg.blockedSlots[ymd];
  if (hm && daySlots && daySlots.indexOf(hm) !== -1) return true;
  return false;
}

function readCalendario_(ss) {
  var minDate = '2026-08-23';
  var maxDate = '2026-09-15';
  var days = [];
  var slots = {};
  var everyDay = [];
  var sheet = ss.getSheetByName(CALENDARIO_SHEET);
  if (!sheet) return { minDate: minDate, maxDate: maxDate, days: days, slots: slots, everyDay: everyDay };

  var values = sheet.getDataRange().getValues();
  if (values.length >= 2) {
    var from = toYmd_(values[1][0]);
    var to = toYmd_(values[1][1]);
    if (from) minDate = from;
    if (to) maxDate = to;
  }

  var headerRow = -1;
  for (var r = 2; r < values.length; r++) {
    if (String(values[r][0]).trim().toLowerCase() === 'fecha') {
      headerRow = r;
      break;
    }
  }
  if (headerRow === -1) {
    return { minDate: minDate, maxDate: maxDate, days: days, slots: slots, everyDay: everyDay };
  }

  for (var i = headerRow + 1; i < values.length; i++) {
    var ymd = toYmd_(values[i][0]);
    var start = toHm_(values[i][1]);
    var end = toHm_(values[i][2]) || start;
    var times = expandSlots_(start, end);

    if (!ymd && !start) continue;

    if (ymd && !start) {
      if (days.indexOf(ymd) === -1) days.push(ymd);
      continue;
    }

    if (!ymd && times.length) {
      for (var t = 0; t < times.length; t++) {
        if (everyDay.indexOf(times[t]) === -1) everyDay.push(times[t]);
      }
      continue;
    }

    if (!slots[ymd]) slots[ymd] = [];
    for (var s = 0; s < times.length; s++) {
      if (slots[ymd].indexOf(times[s]) === -1) slots[ymd].push(times[s]);
    }
  }

  return { minDate: minDate, maxDate: maxDate, days: days, slots: slots, everyDay: everyDay };
}

function expandSlots_(fromHm, toHm) {
  if (!fromHm) return [];
  var start = hmToMin_(fromHm);
  var end = toHm ? hmToMin_(toHm) : start;
  if (isNaN(start) || isNaN(end) || end < start) return [fromHm];
  var out = [];
  for (var m = start; m <= end; m += 30) {
    if (m < SLOT_START_MIN || m > SLOT_END_MIN) continue;
    out.push(minToHm_(m));
  }
  return out.length ? out : [fromHm];
}

function toYmd_(value) {
  if (value === '' || value === null || value === undefined) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  var s = String(value).trim();
  var iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
  var dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    return dmy[3] + '-' + ('0' + dmy[2]).slice(-2) + '-' + ('0' + dmy[1]).slice(-2);
  }
  return '';
}

function toHm_(value) {
  if (value === '' || value === null || value === undefined) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'HH:mm');
  }
  var s = String(value).trim();
  var m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '';
  return ('0' + m[1]).slice(-2) + ':' + m[2];
}

function hmToMin_(hm) {
  var p = hm.split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function minToHm_(mins) {
  var h = Math.floor(mins / 60);
  var m = mins % 60;
  return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
}
