// Per-subject parsers for Lulo Bank notification emails. Each parser reads
// the plain-text body of a known subject and returns a partial transaction
// object (transaction_type, accounts/category fields, amount, merchant_raw,
// transaction_date). GmailIngestion.gs fills in the remaining fields
// (id, merchant, source, status, created_at).

/**
 * Routes a Lulo Bank email to the matching parser based on its subject.
 * Returns a parsed transaction object, or null if the subject isn't one of
 * the recognized transactional types.
 */
function parseLuloEmail(subject, body) {
  if (subject.indexOf('Compra recurrente') !== -1) {
    return parseCompraRecurrente_(body);
  }
  if (subject.indexOf('Compra realizada') !== -1) {
    return parseCompraRealizada_(body);
  }
  if (subject.indexOf('Pago PSE exitoso') !== -1) {
    return parsePagoPSE_(body);
  }
  if (subject.indexOf('Sacaste plata') !== -1) {
    return parseSacastePlata_(body);
  }
  if (subject.indexOf('Bre-B exitoso') !== -1) {
    return parseBrebSalida_(body);
  }
  if (subject.indexOf('Recibiste dinero') !== -1 || subject.indexOf('Recibiste plata por Bre-B') !== -1) {
    return parseDineroRecibido_(body);
  }
  return null;
}

function parseCompraRealizada_(body) {
  var match = body.match(/Realizaste una compra en (.+?) por \$([\d]+(?:[.,]\d{2,3})*)/);
  if (!match) throw new Error('Compra realizada: pattern did not match');
  return {
    transaction_type: 'Expense',
    account_from: 'Lulo Bank',
    amount: parseAmount_(match[2]),
    merchant_raw: match[1].trim(),
    transaction_date: parseFecha_(body)
  };
}

function parseCompraRecurrente_(body) {
  var match = body.match(/por \$([\d]+(?:[.,]\d{2,3})*) con tu tarjeta[\s\S]*?en\s+(.+?)\s+Fecha/);
  if (!match) throw new Error('Compra recurrente: pattern did not match');
  return {
    transaction_type: 'Expense',
    account_from: 'Lulo Bank',
    amount: parseAmount_(match[1]),
    merchant_raw: match[2].trim(),
    transaction_date: parseFecha_(body)
  };
}

function parsePagoPSE_(body) {
  var match = body.match(/Hiciste un pago a (.+?) por \$([\d]+(?:[.,]\d{2,3})*)/);
  if (!match) throw new Error('Pago PSE: pattern did not match');
  return {
    transaction_type: 'Expense',
    account_from: 'PSE',
    amount: parseAmount_(match[2]),
    merchant_raw: match[1].trim(),
    transaction_date: parseFecha_(body)
  };
}

function parseSacastePlata_(body) {
  var match = body.match(/retiro sin tarjeta en cajero (.+?) por \$([\d]+(?:[.,]\d{2,3})*)/);
  if (!match) throw new Error('Sacaste plata: pattern did not match');
  return {
    transaction_type: 'Transfer',
    account_from: 'Lulo Bank',
    account_to: 'Efectivo',
    transfer_purpose: 'Internal Transfer',
    amount: parseAmount_(match[2]),
    description: 'Retiro en cajero ' + match[1].trim(),
    transaction_date: parseFecha_(body)
  };
}

function parseBrebSalida_(body) {
  var match = body.match(/Realizaste una transferencia a (.+?) por \$([\d]+(?:[.,]\d{2,3})*)/);
  if (!match) throw new Error('Bre-B salida: pattern did not match');
  return {
    transaction_type: 'Expense',
    account_from: 'Lulo Bank',
    amount: parseAmount_(match[2]),
    merchant_raw: match[1].trim(),
    transaction_date: parseFecha_(body)
  };
}

function parseDineroRecibido_(body) {
  var match = body.match(/Recibiste de (.+?) \$([\d]+(?:[.,]\d{2,3})*)/);
  if (match) {
    return {
      transaction_type: 'Income',
      account_to: 'Lulo Bank',
      amount: parseAmount_(match[2]),
      merchant_raw: match[1].trim(),
      transaction_date: parseFecha_(body)
    };
  }

  match = body.match(/Recibiste \$([\d]+(?:[.,]\d{2,3})*) de (.+?) Origen/);
  if (match) {
    return {
      transaction_type: 'Income',
      account_to: 'Lulo Bank',
      amount: parseAmount_(match[1]),
      merchant_raw: match[2].trim(),
      transaction_date: parseFecha_(body)
    };
  }

  throw new Error('Dinero recibido: no pattern matched');
}

/**
 * Converts a Colombian-formatted amount (e.g. "1.234.567", "69.990",
 * "216826.00") into a plain number. A trailing ".00"/",00" is treated as
 * redundant cents and dropped; any other "."/"," is a thousands separator.
 */
function parseAmount_(raw) {
  var cleaned = raw.replace(/[.,]00$/, '');
  cleaned = cleaned.replace(/[.,]/g, '');
  return parseInt(cleaned, 10);
}

var SPANISH_MONTHS_ = {
  'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
  'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
  'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
};

/**
 * Extracts "Fecha D de <mes> de YYYY" from the email body and converts it
 * to ISO 8601 (YYYY-MM-DD), per CLAUDE.md's date storage convention.
 */
function parseFecha_(body) {
  var match = body.match(/Fecha (\d{1,2}) de (\w+) de (\d{4})/i);
  if (!match) throw new Error('No Fecha field found in email body');
  var day = match[1].padStart(2, '0');
  var month = SPANISH_MONTHS_[match[2].toLowerCase()];
  if (!month) throw new Error('Unrecognized Spanish month: ' + match[2]);
  var year = match[3];
  return year + '-' + month + '-' + day;
}
