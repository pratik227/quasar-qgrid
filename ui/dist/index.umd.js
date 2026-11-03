/*!
 * quasar-ui-qgrid v1.1.0
 * (c) 2026 pratikpatelpp802@gmail.com
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('quasar')) :
  typeof define === 'function' && define.amd ? define(['vue', 'quasar'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.QGrid = factory(global.Vue, global.Quasar));
})(this, (function (vue, quasar) { 'use strict';

  /**
   * QGrid - pure (framework agnostic) helpers.
   *
   * Everything in here is hot-path code (it runs on every filter change over
   * every row), so it is written with plain loops and pre-compiled predicates.
   * Keep it free of Vue / Quasar imports so it can be unit tested & benchmarked
   * in plain Node, and keep the syntax buble-compatible (no for..of, no ?. / ??).
   */

  var GROUP_FILTER_KEY = '__qgrid_group';

  /* ------------------------------------------------------------------ columns */

  /** Key under which a column's filter state is stored (backwards compatible: the field name). */
  function fieldKey (col) {
    if (col.filter_key !== void 0) { return col.filter_key }
    return typeof col.field === 'string' ? col.field : col.name
  }

  function getRawValue (row, col) {
    if (typeof col.field === 'function') { return col.field(row) }
    return row[col.field === void 0 ? col.name : col.field]
  }

  /** Same semantics as QTable's internal getCellValue (field + format). */
  function getCellValue (row, col) {
    var val = getRawValue(row, col);
    return typeof col.format === 'function' ? col.format(val, row) : val
  }

  function filterTypeOf (col) {
    return col.filter_type || 'text'
  }

  /**
   * Historically date columns were declared with `format: 'DD/MM/YYYY'` (a string),
   * but QTable expects `format` to be a function and throws on global search /
   * default rendering. Move string formats to `date_format` (non-destructively).
   */
  function normalizeColumn (col) {
    if (typeof col.format === 'string') {
      var copy = Object.assign({}, col);
      copy.date_format = col.date_format || col.format;
      delete copy.format;
      return copy
    }
    return col
  }

  /* ------------------------------------------------------------------- tokens */

  function toToken (val) {
    return String(val).toLowerCase()
  }

  var collator = typeof Intl !== 'undefined' && Intl.Collator
    ? new Intl.Collator(void 0, { numeric: true, sensitivity: 'base' })
    : null;

  function compareLabels (a, b) {
    if (collator !== null) { return collator.compare(a.label, b.label) }
    return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0)
  }

  /**
   * Distinct, sorted `{ label, value }` options of a column (array values are
   * flattened, so tag-like fields get one option per tag). `value` is the
   * lower-cased token the select filters compare against.
   */
  function buildOptions (rows, col) {
    if (Array.isArray(col.filter_options)) {
      return col.filter_options.map(function (opt) {
        var isObj = opt !== null && typeof opt === 'object';
        var label = isObj ? opt.label : opt;
        var value = isObj && opt.value !== void 0 ? opt.value : label;
        return { label: String(label), value: toToken(value) }
      })
    }

    var seen = new Map();
    var add = function (val) {
      if (val === null || val === void 0 || val === '') { return }
      var token = toToken(val);
      if (seen.has(token) === false) {
        seen.set(token, { label: String(val), value: token });
      }
    };

    for (var i = 0; i < rows.length; i++) {
      var val = getRawValue(rows[i], col);
      if (Array.isArray(val)) {
        for (var j = 0; j < val.length; j++) { add(val[j]); }
      }
      else {
        add(val);
      }
    }

    var options = Array.from(seen.values());
    options.sort(compareLabels);
    return options
  }

  /* -------------------------------------------------------------------- dates */

  var MASK_TOKEN_RE = /YYYY|YY|MMMM|MMM|MM|M|DDDD|DDD|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|SSS|SS|S|A|a/g;
  var PART_RE = /\d+|[A-Za-z]+/g;
  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  var FIXED_WIDTH = { YYYY: 4, YY: 2, MM: 2, DD: 2, HH: 2, hh: 2, mm: 2, ss: 2, SSS: 3 };
  var maskCache = Object.create(null);

  function tokenizeMask (mask) {
    var tokens = maskCache[mask];
    if (tokens === void 0) {
      tokens = maskCache[mask] = mask.match(MASK_TOKEN_RE) || [];
    }
    return tokens
  }

  /**
   * Lenient, moment-like parser: walks the mask tokens and the value's numeric /
   * word parts in order, so both '05/03/2024' and '5/3/2024' match 'DD/MM/YYYY',
   * and compact values like '20240305' match 'YYYYMMDD'. Returns a timestamp or NaN.
   */
  function parseWithMask (str, mask) {
    var tokens = tokenizeMask(mask);
    var parts = str.match(PART_RE);
    if (tokens.length === 0 || parts === null) { return NaN }

    var year = new Date().getFullYear(), month = 1, day = 1;
    var hour = 0, minute = 0, second = 0, ms = 0, meridiem = null;
    var dayOfYear = false;
    var p = 0, offset = 0;

    for (var t = 0; t < tokens.length; t++) {
      var token = tokens[t];
      var part = parts[p];
      if (part === void 0) { return NaN }

      var isWordToken = token === 'MMMM' || token === 'MMM' || token === 'dddd' || token === 'ddd' || token === 'A' || token === 'a';

      if (isWordToken) {
        if (/^\d/.test(part)) { return NaN }
        if (token === 'MMMM' || token === 'MMM') {
          month = MONTHS.indexOf(part.slice(0, 3).toLowerCase()) + 1;
          if (month === 0) { return NaN }
        }
        else if (token === 'A' || token === 'a') {
          meridiem = part.toLowerCase();
        }
        p++;
        offset = 0;
        continue
      }

      if (/^\d/.test(part) === false) { return NaN }

      // fixed-width tokens may need to split a compact numeric part (eg. 'YYYYMMDD')
      var width = FIXED_WIDTH[token];
      var rest = part.slice(offset);
      var chunk = (void 0);
      if (width !== void 0 && rest.length > width) {
        chunk = rest.slice(0, width);
        offset += width;
      }
      else {
        chunk = rest;
        p++;
        offset = 0;
      }

      var num = parseInt(chunk, 10);
      switch (token) {
        case 'YYYY': year = num; break
        case 'YY': year = num + (num > 68 ? 1900 : 2000); break
        case 'MM': case 'M': month = num; break
        case 'DDDD': case 'DDD': month = 1; day = num; dayOfYear = true; break
        case 'DD': case 'D': day = num; break
        case 'HH': case 'H': case 'hh': case 'h': hour = num; break
        case 'mm': case 'm': minute = num; break
        case 'ss': case 's': second = num; break
        default: ms = parseInt((chunk + '00').slice(0, 3), 10); // S, SS, SSS
      }
    }

    if (meridiem !== null) {
      if (meridiem.charAt(0) === 'p' && hour < 12) { hour += 12; }
      else if (meridiem.charAt(0) === 'a' && hour === 12) { hour = 0; }
    }

    if (month < 1 || month > 12 || day < 1 || day > (dayOfYear ? 366 : 31) || hour > 23 || minute > 59 || second > 59) {
      return NaN
    }

    var date = new Date(year, month - 1, day, hour, minute, second, ms);
    // reject roll-overs such as 31/02 (moment treats them as invalid too)
    if (dayOfYear === false && date.getDate() !== day) { return NaN }
    return date.getTime()
  }

  /** Date | timestamp | string (parsed with `mask` when given, else ISO/RFC) -> timestamp | NaN */
  function parseDate (value, mask) {
    if (value === null || value === void 0 || value === '') { return NaN }
    if (value instanceof Date) { return value.getTime() }
    if (typeof value === 'number') { return value }

    var str = String(value).trim();
    if (mask) {
      var ts = parseWithMask(str, mask);
      if (isNaN(ts) === false) { return ts }
    }
    return Date.parse(str)
  }

  /** QDate range model ('YYYY/MM/DD' string | { from, to } | null) -> { from, to } */
  function normalizeDateRange (val) {
    if (val === null || val === void 0 || val === '') { return { from: '', to: '' } }
    if (typeof val === 'string') { return { from: val, to: val } }
    return { from: val.from || '', to: val.to || '' }
  }

  function dayBounds (fromStr, toStr) {
    var start = parseWithMask(fromStr, 'YYYY/MM/DD');
    var endDay = parseWithMask(toStr, 'YYYY/MM/DD');
    if (isNaN(start) || isNaN(endDay)) { return null }
    var end = new Date(endDay);
    end.setHours(23, 59, 59, 999);
    return { start: start, end: end.getTime() }
  }

  /* ------------------------------------------------------------------ numbers */

  function toNumber (val) {
    if (typeof val === 'number') { return val }
    if (val === null || val === void 0 || val === '') { return NaN }
    return parseFloat(val)
  }

  /* ------------------------------------------------------------------ filters */

  function isFilterValueActive (col, val) {
    var type = filterTypeOf(col);
    if (type === 'date') {
      var range = normalizeDateRange(val);
      return range.from !== '' && range.to !== ''
    }
    if (type === 'number_range') {
      return val !== null && typeof val === 'object' &&
        (isNaN(toNumber(val.from)) === false || isNaN(toNumber(val.to)) === false)
    }
    if (type === 'text') {
      return val !== null && val !== void 0 && val !== ''
    }
    return false
  }

  /**
   * Compiles the column (text / date / number range) filters into predicates.
   * Everything that does not depend on the row (lower-casing the needle, parsing
   * the date range...) happens here, once per filter change, not once per row.
   *
   * @param {Array} columns
   * @param {Object} filterData   key -> filter value
   * @param {Function} getDateCache  key -> Map(raw value -> timestamp)
   */
  function compileColumnFilters (columns, filterData, getDateCache) {
    var predicates = [];

    var loop = function ( i ) {
      var col = columns[i];
      var key = fieldKey(col);
      var val = filterData[key];
      if (isFilterValueActive(col, val) === false) { return }

      var type = filterTypeOf(col);

      if (type === 'text') {
        var needle = String(val).toLowerCase();
        predicates.push(function (row) {
          var cell = getRawValue(row, col);
          return cell !== null && cell !== void 0 && String(cell).toLowerCase().indexOf(needle) !== -1
        });
      }
      else if (type === 'date') {
        var range = normalizeDateRange(val);
        var bounds = dayBounds(range.from, range.to);
        if (bounds === null) { return }
        var start = bounds.start, end = bounds.end;
        var mask = col.date_format;
        var cache = getDateCache(key + '|' + (mask || ''));
        predicates.push(function (row) {
          var cell = getRawValue(row, col);
          if (cell === null || cell === void 0 || cell === '') { return false }
          var ts = cache.get(cell);
          if (ts === void 0) {
            ts = parseDate(cell, mask);
            cache.set(cell, ts);
          }
          return ts >= start && ts <= end
        });
      }
      else if (type === 'number_range') {
        var from = toNumber(val.from), to = toNumber(val.to);
        var hasFrom = isNaN(from) === false, hasTo = isNaN(to) === false;
        predicates.push(function (row) {
          var num = toNumber(getRawValue(row, col));
          if (isNaN(num)) { return false }
          return (hasFrom === false || num >= from) && (hasTo === false || num <= to)
        });
      }
    };

    for (var i = 0; i < columns.length; i++) loop( i );

    return predicates
  }

  /** Compiles the multi-select (filter row "select" + header filter) value filters. */
  function compileSelectFilters (columns, selections) {
    var predicates = [];

    var loop = function ( i ) {
      var col = columns[i];
      var selected = selections[fieldKey(col)];
      if (!selected || selected.length === 0) { return }

      var set = new Set(selected);
      predicates.push(function (row) {
        var cell = getRawValue(row, col);
        if (cell === null || cell === void 0) { return false }
        if (Array.isArray(cell)) {
          for (var j = 0; j < cell.length; j++) {
            if (set.has(toToken(cell[j]))) { return true }
          }
          return false
        }
        return set.has(toToken(cell))
      });
    };

    for (var i = 0; i < columns.length; i++) loop( i );

    return predicates
  }

  function applyPredicates (rows, predicates) {
    var len = predicates.length;
    if (len === 0) { return rows }

    var out = [];
    rowLoop:
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      for (var j = 0; j < len; j++) {
        if (predicates[j](row) === false) { continue rowLoop }
      }
      out.push(row);
    }
    return out
  }

  /* ----------------------------------------------------------------- grouping */

  /** -> Map(groupName -> rows), in first-seen order */
  function groupRows (rows, col) {
    var groups = new Map();
    for (var i = 0; i < rows.length; i++) {
      var val = getRawValue(rows[i], col);
      var key = val === null || val === void 0 ? '' : String(val);
      var bucket = groups.get(key);
      if (bucket === void 0) { groups.set(key, [rows[i]]); }
      else { bucket.push(rows[i]); }
    }
    return groups
  }

  /* -------------------------------------------------------------- aggregation */

  function aggregate (rows, col) {
    var agg = col.aggregate;
    if (typeof agg === 'function') {
      return agg(rows.map(function (row) { return getRawValue(row, col); }), rows, col)
    }

    var count = 0, numeric = 0, sum = 0, min = Infinity, max = -Infinity;
    for (var i = 0; i < rows.length; i++) {
      var val = getRawValue(rows[i], col);
      if (val === null || val === void 0 || val === '') { continue }
      count++;
      var num = toNumber(val);
      if (isNaN(num)) { continue }
      numeric++;
      sum += num;
      if (num < min) { min = num; }
      if (num > max) { max = num; }
    }

    switch (agg) {
      case 'count': return count
      case 'sum': return numeric === 0 ? null : sum
      case 'avg': return numeric === 0 ? null : sum / numeric
      case 'min': return numeric === 0 ? null : min
      case 'max': return numeric === 0 ? null : max
      default: return null
    }
  }

  function formatAggregate (value) {
    if (value === null || value === void 0 || (typeof value === 'number' && isNaN(value))) { return '—' }
    if (typeof value === 'number') {
      return value.toLocaleString(void 0, { maximumFractionDigits: 2 })
    }
    return String(value)
  }

  /* -------------------------------------------------------------------- misc */

  /** Moves an array item in place (move semantics, unlike a swap). */
  function moveItem (arr, from, to) {
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) { return false }
    var item = arr.splice(from, 1)[0];
    arr.splice(to, 0, item);
    return true
  }

  function csvCell (val) {
    var str = val === null || val === void 0 ? '' : String(val);
    return '"' + str.split('"').join('""') + '"'
  }

  /** RFC 4180 CSV with a UTF-8 BOM (so Excel opens non-ASCII text correctly). */
  function toCsv (rows, cols) {
    var lines = [cols.map(function (col) { return csvCell(col.label !== void 0 ? col.label : col.name); }).join(',')];
    var loop = function ( i ) {
      var row = rows[i];
      lines.push(cols.map(function (col) { return csvCell(getCellValue(row, col)); }).join(','));
    };

    for (var i = 0; i < rows.length; i++) loop( i );
    return '﻿' + lines.join('\r\n')
  }

  /**
   * QGrid - tiny, dependency-free .xlsx (Office Open XML) writer.
   *
   * Produces a single-sheet workbook with typed cells (numbers stay numbers,
   * booleans stay booleans, Date objects become real Excel dates), a bold frozen
   * header row and auto-sized columns. The package is a "stored" (uncompressed)
   * zip, which every spreadsheet app reads; it keeps this file ~3 KB minified.
   */

  var XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  /* --------------------------------------------------------------------- zip */

  var crcTable = null;

  function getCrcTable () {
    if (crcTable === null) {
      crcTable = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        }
        crcTable[n] = c >>> 0;
      }
    }
    return crcTable
  }

  function crc32 (bytes) {
    var table = getCrcTable();
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) {
      crc = table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  var DOS_DATE = (1 << 5) | 1; // 1980-01-01

  /** files: [{ name, data: Uint8Array }] -> Uint8Array (zip, "stored" method) */
  function zipStore (files) {
    var encoder = new TextEncoder();
    var entries = files.map(function (file) {
      var name = encoder.encode(file.name);
      return { name: name, data: file.data, crc: crc32(file.data) }
    });

    var localSize = 0, centralSize = 0;
    entries.forEach(function (entry) {
      localSize += 30 + entry.name.length + entry.data.length;
      centralSize += 46 + entry.name.length;
    });

    var out = new Uint8Array(localSize + centralSize + 22);
    var view = new DataView(out.buffer);
    var pos = 0;

    entries.forEach(function (entry) {
      entry.offset = pos;
      view.setUint32(pos, 0x04034B50, true);
      view.setUint16(pos + 4, 20, true); // version needed
      view.setUint16(pos + 6, 0x0800, true); // UTF-8 names
      view.setUint16(pos + 8, 0, true); // stored
      view.setUint16(pos + 10, 0, true); // time
      view.setUint16(pos + 12, DOS_DATE, true);
      view.setUint32(pos + 14, entry.crc, true);
      view.setUint32(pos + 18, entry.data.length, true);
      view.setUint32(pos + 22, entry.data.length, true);
      view.setUint16(pos + 26, entry.name.length, true);
      view.setUint16(pos + 28, 0, true);
      out.set(entry.name, pos + 30);
      out.set(entry.data, pos + 30 + entry.name.length);
      pos += 30 + entry.name.length + entry.data.length;
    });

    var centralStart = pos;
    entries.forEach(function (entry) {
      view.setUint32(pos, 0x02014B50, true);
      view.setUint16(pos + 4, 20, true); // version made by
      view.setUint16(pos + 6, 20, true); // version needed
      view.setUint16(pos + 8, 0x0800, true);
      view.setUint16(pos + 10, 0, true);
      view.setUint16(pos + 12, 0, true);
      view.setUint16(pos + 14, DOS_DATE, true);
      view.setUint32(pos + 16, entry.crc, true);
      view.setUint32(pos + 20, entry.data.length, true);
      view.setUint32(pos + 24, entry.data.length, true);
      view.setUint16(pos + 28, entry.name.length, true);
      view.setUint16(pos + 30, 0, true); // extra
      view.setUint16(pos + 32, 0, true); // comment
      view.setUint16(pos + 34, 0, true); // disk
      view.setUint16(pos + 36, 0, true); // internal attrs
      view.setUint32(pos + 38, 0, true); // external attrs
      view.setUint32(pos + 42, entry.offset, true);
      out.set(entry.name, pos + 46);
      pos += 46 + entry.name.length;
    });

    view.setUint32(pos, 0x06054B50, true);
    view.setUint16(pos + 4, 0, true);
    view.setUint16(pos + 6, 0, true);
    view.setUint16(pos + 8, entries.length, true);
    view.setUint16(pos + 10, entries.length, true);
    view.setUint32(pos + 12, pos - centralStart, true);
    view.setUint32(pos + 16, centralStart, true);
    view.setUint16(pos + 20, 0, true);

    return out
  }

  /* -------------------------------------------------------------------- xlsx */

  // characters that are not allowed in XML 1.0 documents
  var INVALID_XML_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

  function escapeXml (str) {
    return str
      .replace(INVALID_XML_RE, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function columnLetter (index) {
    var letters = '';
    var n = index + 1;
    while (n > 0) {
      var rem = (n - 1) % 26;
      letters = String.fromCharCode(65 + rem) + letters;
      n = Math.floor((n - 1) / 26);
    }
    return letters
  }

  function sanitizeSheetName (name) {
    var clean = String(name || '').replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 31);
    return clean || 'Sheet1'
  }

  var MAX_CELL_CHARS = 32767;

  function stringCell (ref, str, style) {
    var text = str.length > MAX_CELL_CHARS ? str.slice(0, MAX_CELL_CHARS) : str;
    return '<c r="' + ref + '" t="inlineStr"' + (style ? ' s="' + style + '"' : '') +
      '><is><t xml:space="preserve">' + escapeXml(text) + '</t></is></c>'
  }

  /** -> [xml, displayLength] */
  function cellXml (ref, value) {
    if (value === null || value === void 0 || value === '') { return ['', 0] }

    if (typeof value === 'number') {
      if (isFinite(value) === false) { return ['', 0] }
      return ['<c r="' + ref + '"><v>' + value + '</v></c>', String(value).length]
    }

    if (typeof value === 'boolean') {
      return ['<c r="' + ref + '" t="b"><v>' + (value ? 1 : 0) + '</v></c>', 5]
    }

    if (value instanceof Date) {
      var time = value.getTime();
      if (isNaN(time)) { return ['', 0] }
      // Excel serial date (days since 1899-12-30), in local time
      var serial = (time - value.getTimezoneOffset() * 60000) / 86400000 + 25569;
      return ['<c r="' + ref + '" s="2"><v>' + serial + '</v></c>', 10]
    }

    var str = Array.isArray(value) ? value.join(', ') : String(value);
    return [stringCell(ref, str, 0), str.length]
  }

  var CONTENT_TYPES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    '</Types>';

  var ROOT_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>';

  var WORKBOOK_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>';

  // style 0: default, 1: bold (header), 2: date
  var STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font>' +
    '<font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>' +
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '<xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '</styleSheet>';

  function workbookXml (sheetName) {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets><sheet name="' + escapeXml(sanitizeSheetName(sheetName)) + '" sheetId="1" r:id="rId1"/></sheets>' +
      '</workbook>'
  }

  /**
   * @param {Array} rows   row objects
   * @param {Array} cols   QTable-like column definitions (label, field, format)
   * @param {Object} [opts] { sheetName }
   * @returns {Uint8Array} the .xlsx file contents
   */
  function toXlsx (rows, cols, opts) {
    var sheetName = opts && opts.sheetName;
    var widths = cols.map(function (col) { return String(col.label !== void 0 ? col.label : col.name).length; });
    var sheetRows = [];

    // header
    var header = '<row r="1">';
    for (var c = 0; c < cols.length; c++) {
      var label = cols[c].label !== void 0 ? cols[c].label : cols[c].name;
      header += stringCell(columnLetter(c) + '1', String(label), 1);
    }
    sheetRows.push(header + '</row>');

    var letters = cols.map(function (col, c) { return columnLetter(c); });

    for (var r = 0; r < rows.length; r++) {
      var rowNum = r + 2;
      var xml = '<row r="' + rowNum + '">';
      for (var c$1 = 0; c$1 < cols.length; c$1++) {
        var res = cellXml(letters[c$1] + rowNum, getCellValue(rows[r], cols[c$1]));
        xml += res[0];
        if (res[1] > widths[c$1]) { widths[c$1] = res[1]; }
      }
      sheetRows.push(xml + '</row>');
    }

    var lastRef = (cols.length > 0 ? letters[cols.length - 1] : 'A') + (rows.length + 1);
    var colsXml = cols.length === 0
      ? ''
      : '<cols>' + widths.map(function (w, c) { return '<col min="' + (c + 1) + '" max="' + (c + 1) + '" width="' + Math.min(Math.max(w + 2, 8), 60) + '" customWidth="1"/>'; }
      ).join('') + '</cols>';

    var sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<dimension ref="A1:' + lastRef + '"/>' +
      '<sheetViews><sheetView workbookViewId="0">' +
      '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' +
      '</sheetView></sheetViews>' +
      '<sheetFormatPr defaultRowHeight="15"/>' +
      colsXml +
      '<sheetData>' + sheetRows.join('') + '</sheetData>' +
      '</worksheet>';

    var encoder = new TextEncoder();
    return zipStore([
      { name: '[Content_Types].xml', data: encoder.encode(CONTENT_TYPES) },
      { name: '_rels/.rels', data: encoder.encode(ROOT_RELS) },
      { name: 'xl/workbook.xml', data: encoder.encode(workbookXml(sheetName)) },
      { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(WORKBOOK_RELS) },
      { name: 'xl/styles.xml', data: encoder.encode(STYLES) },
      { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheet) }
    ])
  }

  /**
   * Inline SVG icons (Quasar QIcon "svg path" format) so QGrid renders correctly
   * whatever icon set / icon fonts the host app uses.
   *
   * Paths: Google Material Icons (Apache License 2.0), as distributed by
   * @quasar/extras/material-icons. Override any of them with the `icons` prop.
   */
  var ICONS = {
    search: 'M0 0h24v24H0z@@fill:none;&&M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    filter: 'M0,0h24 M24,24H0@@fill:none;&&M4.25,5.61C6.27,8.2,10,13,10,13v6c0,0.55,0.45,1,1,1h2c0.55,0,1-0.45,1-1v-6c0,0,3.72-4.8,5.74-7.39 C20.25,4.95,19.78,4,18.95,4H5.04C4.21,4,3.74,4.95,4.25,5.61z&&M0,0h24v24H0V0z@@fill:none;',
    clearFilters: 'M0 0 H24 V24 H0 V0 z@@fill:none;&&M19.79,5.61C20.3,4.95,19.83,4,19,4H6.83l7.97,7.97L19.79,5.61z&&M2.81,2.81L1.39,4.22L10,13v6c0,0.55,0.45,1,1,1h2c0.55,0,1-0.45,1-1v-2.17l5.78,5.78l1.41-1.41L2.81,2.81z',
    close: 'M0 0h24v24H0z@@fill:none;&&M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    cancel: 'M0 0h24v24H0z@@fill:none;&&M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z',
    fullscreen: 'M0 0h24v24H0z@@fill:none;&&M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
    fullscreenExit: 'M0 0h24v24H0z@@fill:none;&&M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',
    filterRowOn: 'M0 0h24v24H0z@@fill:none;&&M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z',
    filterRowOff: 'M0 0 H24 V24 H0 V0 z@@fill:none;&&M10.83,8H21V6H8.83L10.83,8z M15.83,13H18v-2h-4.17L15.83,13z M14,16.83V18h-4v-2h3.17l-3-3H6v-2h2.17l-3-3H3V6h0.17 L1.39,4.22l1.41-1.41l18.38,18.38l-1.41,1.41L14,16.83z',
    date: 'M0 0h24v24H0z@@fill:none;&&M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
    numberRange: 'M20 10V8h-4V4h-2v4h-4V4H8v4H4v2h4v4H4v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4h-4v-4h4v4z',
    expand: 'M0 0h24v24H0z@@fill:none;&&M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    collapse: 'M0 0h24v24H0z@@fill:none;&&M19 13H5v-2h14v2z',
    detailOpen: 'M0 0h24v24H0z@@fill:none;&&M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
    detailClosed: 'M0 0h24v24H0z@@fill:none;&&M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    columns: 'M0 0 H24 V24 H0 V0 z@@fill:none;&&M14.67,5v14H9.33V5H14.67z M15.67,19H21V5h-5.33V19z M8.33,19V5H3v14H8.33z',
    csv: 'M0 0h24v24H0z@@fill:none;&&M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    excel: 'M0 0h24v24H0z@@fill:none;&&M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z'
  };

  var DEFAULT_LABELS = {
    search: 'Search',
    selectAll: 'Select All',
    clear: 'Clear',
    close: 'Close',
    groupBy: 'Group By Field',
    groupedColumn: 'Grouped Column Values',
    exportCsv: 'Export CSV',
    exportExcel: 'Export Excel',
    fullscreen: 'Toggle Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    columns: 'Columns',
    showAllColumns: 'Show all columns',
    clearFilters: 'Clear filters',
    filterValues: 'Search values',
    noValues: 'No values',
    from: 'From',
    to: 'To',
    expand: 'Expand',
    collapse: 'Collapse',
    downloadDenied: 'Browser denied file download...',
    sum: 'Sum',
    avg: 'Avg',
    min: 'Min',
    max: 'Max',
    count: 'Count',
    total: 'Total'
  };

  var STATE_VERSION = 1;

  // QTable slots QGrid renders itself (everything else is forwarded as-is)
  var OWN_SLOTS = ['header', 'body', 'top_right', 'top-right', 'loading', 'detail', 'bottom-row'];

  // renders a slot with the *original* QTable scope object, so getters/setters
  // like `props.selected` / `props.expand` keep working inside user slots
  var SlotProxy = function (props) { return props.render(props.scope); };
  SlotProxy.props = ['render', 'scope'];

  var script = vue.defineComponent({
    name: 'QGrid',

    components: { SlotProxy: SlotProxy },

    inheritAttrs: false,

    props: {
      data: { type: Array, default: function () { return []; } },
      columns: { type: Array, default: function () { return []; } },
      row_key: { type: [String, Function], default: 'name' },
      file_name: String,
      csv_download: Boolean,
      excel_download: Boolean,
      columns_filter: Boolean,
      columns_filter_toggle: Boolean,
      filter_input_props: Object,
      filter_debounce: { type: [Number, String], default: 0 },
      header_filter: Boolean,
      draggable: Boolean,
      draggable_columns: Boolean,
      ignore_rows: Array,
      ignore_cols: Array,
      classes: [String, Array, Object],
      separator: String,
      dense: Boolean,
      dark: { type: Boolean, default: null },
      flat: Boolean,
      bordered: Boolean,
      square: Boolean,
      selection: { type: String, default: 'none' },
      selected: Array,
      fullscreen: Boolean,
      global_search: Boolean,
      global_filter: [String, Object],
      groupby_filter: Boolean,
      visible_columns: Array,
      pagination: Object,
      ssr_pagination: Boolean,
      loading: Boolean,
      // v1.1+
      column_chooser: Boolean,
      clear_filters: Boolean,
      server_side_filters: Boolean,
      virtual_scroll: Boolean,
      sticky_header: Boolean,
      height: String,
      state_key: String,
      labels: Object,
      icons: Object
    },

    emits: [
      'selected-val', 'update:selected', 'dragged_column', 'dragged_row', 'row-click',
      'OnRequest', 'FilteredData', 'update:pagination', 'update:visible_columns',
      'cell-edit', 'state-change'
    ],

    setup: function setup (props, ref$1) {
      var slots = ref$1.slots;
      var emit = ref$1.emit;
      var attrs = ref$1.attrs;

      var $q = quasar.useQuasar();
      var scope = vue.effectScope();
      var tableRef = vue.ref(null);
      var uuid = quasar.uid();

      // bumped on internal in-place mutations (drag, edit) so non-reactive data still refreshes
      var dataVersion = vue.ref(0);

      var mergedLabels = vue.computed(function () { return Object.assign({}, DEFAULT_LABELS, props.labels); });
      var mergedIcons = vue.computed(function () { return Object.assign({}, ICONS, props.icons); });
      var selectionMode = vue.computed(function () { return props.selection || 'none'; });

      var hasHeaderSlot = vue.computed(function () { return slots.header !== void 0; });
      var hasDefaultSlot = vue.computed(function () { return slots.body !== void 0; });
      var hasTopRightSlot = vue.computed(function () { return slots.top_right !== void 0; });
      var hasDetailSlot = vue.computed(function () { return slots.detail !== void 0; });
      var forwardedSlots = vue.computed(function () { return Object.keys(slots).filter(function (name) { return OWN_SLOTS.indexOf(name) === -1 && name.indexOf('body-cell-') !== 0 && name.indexOf('header-cell-') !== 0; }
      ); });

      /* ------------------------------------------------------------ columns */

      var normalizedColumns = vue.computed(function () { return (props.columns || []).map(normalizeColumn); });
      var columnOrder = vue.ref(null);

      var orderedColumns = vue.computed(function () {
        var cols = normalizedColumns.value;
        var order = columnOrder.value;
        if (order === null) { return cols }
        var byName = new Map(cols.map(function (col) { return [col.name, col]; }));
        var out = [];
        order.forEach(function (name) {
          var col = byName.get(name);
          if (col !== void 0) {
            out.push(col);
            byName.delete(name);
          }
        });
        byName.forEach(function (col) { return out.push(col); });
        return out
      });

      var columnsByKey = vue.computed(function () {
        var map = Object.create(null);
        orderedColumns.value.forEach(function (col) { map[fieldKey(col)] = col; });
        return map
      });

      /* ----------------------------------------------------------- grouping */

      var groupByPlaceholder = { label: DEFAULT_LABELS.groupBy, value: '' };
      var selected_group_by_filed = vue.ref(groupByPlaceholder);

      var gorupby_option = vue.computed(function () { return [{ label: mergedLabels.value.groupBy, value: '' }].concat(
          orderedColumns.value
            .filter(function (col) { return col.grouping === true; })
            .map(function (col) { return ({ label: col.label, value: col.field }); })
        ); }
      );

      var groupField = vue.computed(function () { return props.groupby_filter && selected_group_by_filed.value && selected_group_by_filed.value.value
          ? selected_group_by_filed.value.value
          : ''; }
      );
      var isGrouped = vue.computed(function () { return groupField.value !== ''; });
      var groupColumn = vue.computed(function () { return orderedColumns.value.find(function (col) { return col.field === groupField.value; }) || { name: groupField.value, field: groupField.value }; }
      );

      var groupedColumnDef = vue.computed(function () { return ({
        name: 'Grouped',
        required: true,
        label: mergedLabels.value.groupedColumn,
        align: 'left',
        field: 'name',
        sortable: true,
        filter_key: GROUP_FILTER_KEY
      }); });

      // the columns handed to QTable (name kept for backwards compatibility)
      var final_column = vue.computed(function () { return isGrouped.value ? [groupedColumnDef.value] : orderedColumns.value; });

      var subColumns = vue.computed(function () { return orderedColumns.value.filter(function (col) { return col.field !== groupField.value && isColumnVisible(col); }); }
      );

      function setGroupBy (field) {
        var opt = gorupby_option.value.find(function (o) { return o.value === field; });
        selected_group_by_filed.value = opt || groupByPlaceholder;
      }

      /* ------------------------------------------------------- filter state */

      var filter_data = vue.reactive({});
      var column_options_selected = vue.reactive({});
      var headerSearch = vue.reactive({});
      var filter = vue.ref('');
      var showFilterRow = vue.ref(true);

      function emptyFilterValue (col) {
        var type = filterTypeOf(col);
        return type === 'date' || type === 'number_range' ? { from: '', to: '' } : ''
      }

      function initFilterState () {
        orderedColumns.value.forEach(function (col) {
          var key = fieldKey(col);
          var type = filterTypeOf(col);
          var current = filter_data[key];
          if ((type === 'date' || type === 'number_range') && (current === null || typeof current !== 'object')) {
            filter_data[key] = type === 'date' ? normalizeDateRange(current) : { from: '', to: '' };
          }
          else if (current === void 0) {
            filter_data[key] = '';
          }
          if (Array.isArray(column_options_selected[key]) === false) { column_options_selected[key] = []; }
          if (headerSearch[key] === void 0) { headerSearch[key] = ''; }
        });
        if (filter_data[GROUP_FILTER_KEY] === void 0) { filter_data[GROUP_FILTER_KEY] = ''; }
      }

      initFilterState();

      vue.watch(function () { return props.columns; }, function () {
        columnOrder.value = null;
        initFilterState();
      });
      vue.watch(normalizedColumns, initFilterState);

      var filterKey = function (col) { return fieldKey(col); };
      var isFilterActive = function (col) { return isFilterValueActive(col, filter_data[fieldKey(col)]); };
      var resetFilter = function (col) { filter_data[fieldKey(col)] = emptyFilterValue(col); };

      function setDateFilter (key, val) {
        filter_data[key] = normalizeDateRange(val);
      }

      function dateLabel (key) {
        var range = normalizeDateRange(filter_data[key]);
        if (range.from === '') { return '' }
        return range.from === range.to ? range.from : range.from + ' - ' + range.to
      }

      function numberLabel (key) {
        var val = filter_data[key] || {};
        var hasFrom = isNaN(toNumber(val.from)) === false;
        var hasTo = isNaN(toNumber(val.to)) === false;
        if (hasFrom && hasTo) { return val.from + ' - ' + val.to }
        if (hasFrom) { return '≥ ' + val.from }
        if (hasTo) { return '≤ ' + val.to }
        return ''
      }

      var filterInputPropsComputed = vue.computed(function () {
        var styleProps = ['filled', 'outlined', 'standout', 'borderless'];
        var custom = props.filter_input_props;
        var hasStyle = custom && styleProps.some(function (p) { return p in custom; });
        return Object.assign(hasStyle ? {} : { filled: true }, { color: 'teal', dark: props.dark }, custom)
      });

      function toggleFilterRow () {
        showFilterRow.value = !showFilterRow.value;
      }

      function setGlobalSearch (val) {
        filter.value = val === null || val === void 0 ? '' : val;
      }

      /* ------------------------------------------------------ select values */

      // lazily created, cached per column; stopped together on unmount
      var optionComputeds = new Map();
      var selectedSetComputeds = new Map();

      function getColumnOptions (key) {
        var c = optionComputeds.get(key);
        if (c === void 0) {
          c = scope.run(function () { return vue.computed(function () {
            // eslint-disable-next-line no-unused-expressions
            dataVersion.value;
            var col = columnsByKey.value[key];
            return col === void 0 ? [] : buildOptions(props.data || [], col)
          }); });
          optionComputeds.set(key, c);
        }
        return c.value
      }

      function selectedSet (key) {
        var c = selectedSetComputeds.get(key);
        if (c === void 0) {
          c = scope.run(function () { return vue.computed(function () { return new Set(column_options_selected[key] || []); }); });
          selectedSetComputeds.set(key, c);
        }
        return c.value
      }

      function headerOptions (col) {
        var key = fieldKey(col);
        var options = getColumnOptions(key);
        var needle = (headerSearch[key] || '').toLowerCase();
        return needle === '' ? options : options.filter(function (opt) { return opt.label.toLowerCase().indexOf(needle) !== -1; })
      }

      var selectionCount = function (key) { return (column_options_selected[key] || []).length; };
      var isOptionSelected = function (key, value) { return selectedSet(key).has(value); };

      function toggleOption (key, value) {
        var current = column_options_selected[key] || [];
        column_options_selected[key] = selectedSet(key).has(value)
          ? current.filter(function (v) { return v !== value; })
          : current.concat(value);
      }

      function selectAllState (key, options) {
        if (options.length === 0) { return false }
        var set = selectedSet(key);
        var count = 0;
        for (var i = 0; i < options.length; i++) {
          if (set.has(options[i].value)) { count++; }
        }
        return count === 0 ? false : (count === options.length ? true : null)
      }

      function toggleAll (key, options) {
        var set = selectedSet(key);
        var values = options.map(function (opt) { return opt.value; });
        if (selectAllState(key, options) === true) {
          var remove = new Set(values);
          column_options_selected[key] = (column_options_selected[key] || []).filter(function (v) { return remove.has(v) === false; });
        }
        else {
          column_options_selected[key] = (column_options_selected[key] || []).concat(values.filter(function (v) { return set.has(v) === false; }));
        }
      }

      function clearSelection (key) {
        column_options_selected[key] = [];
      }

      /* ------------------------------------------------------ data pipeline */

      var dateCaches = Object.create(null);
      var getDateCache = function (key) { return dateCaches[key] || (dateCaches[key] = new Map()); };
      vue.watch(function () { return props.data; }, function () { dateCaches = Object.create(null); });

      var clientFiltering = vue.computed(function () { return props.server_side_filters !== true; });

      var columnPredicates = vue.computed(function () { return clientFiltering.value ? compileColumnFilters(orderedColumns.value, filter_data, getDateCache) : []; }
      );
      var selectPredicates = vue.computed(function () { return clientFiltering.value ? compileSelectFilters(orderedColumns.value, column_options_selected) : []; }
      );

      // text / date / number range filters (name kept for backwards compatibility)
      var getFilteredData = vue.computed(function () { return applyPredicates(props.data || [], columnPredicates.value); });

      // + select / header value filters (name kept for backwards compatibility)
      var getFilteredValuesData = vue.computed(function () {
        var rows = applyPredicates(getFilteredData.value, selectPredicates.value);
        // after an in-place mutation of a non-reactive array, hand QTable a new reference
        return dataVersion.value > 0 && rows === props.data ? rows.slice() : rows
      });

      var groups = vue.computed(function () { return isGrouped.value ? groupRows(getFilteredValuesData.value, groupColumn.value) : null; }
      );

      var tableRows = vue.computed(function () {
        if (groups.value === null) { return getFilteredValuesData.value }
        var needle = String(filter_data[GROUP_FILTER_KEY] || '').toLowerCase();
        var out = [];
        groups.value.forEach(function (rows, name) {
          if (needle === '' || name.toLowerCase().indexOf(needle) !== -1) {
            out.push({ name: name, __qgrid_count: rows.length });
          }
        });
        return out
      });

      var groupRowsOf = function (name) { return (groups.value !== null && groups.value.get(name)) || []; };
      var effectiveRowKey = vue.computed(function () { return isGrouped.value ? 'name' : (props.row_key || 'name'); });
      var group_pagination = { rowsPerPage: 0 };

      vue.watch(
        function () { return [tableRows.value, tableRows.value.length]; },
        function () { emit('FilteredData', tableRows.value); },
        { immediate: true }
      );

      var filtersActive = vue.computed(function () {
        if (filter.value) { return true }
        return orderedColumns.value.some(function (col) { return isFilterValueActive(col, filter_data[fieldKey(col)]) || selectionCount(fieldKey(col)) > 0; }
        ) || Boolean(filter_data[GROUP_FILTER_KEY])
      });

      function clearFilters () {
        orderedColumns.value.forEach(function (col) {
          var key = fieldKey(col);
          filter_data[key] = emptyFilterValue(col);
          column_options_selected[key] = [];
        });
        filter_data[GROUP_FILTER_KEY] = '';
        filter.value = '';
      }

      /** Serializable description of the active filters (sent with OnRequest). */
      function getFilterModel () {
        var model = {};
        orderedColumns.value.forEach(function (col) {
          var key = fieldKey(col);
          var type = filterTypeOf(col);
          var val = filter_data[key];
          if (type !== 'select' && isFilterValueActive(col, val)) {
            model[key] = {
              type: type,
              value: type === 'date'
                ? normalizeDateRange(val)
                : (type === 'number_range' ? { from: val.from, to: val.to } : val)
            };
          }
          var sel = column_options_selected[key];
          if (sel && sel.length > 0) {
            model[key] = Object.assign(model[key] || { type: type }, { values: sel.slice() });
          }
        });
        return model
      }

      var ignoredRowSet = vue.computed(function () {
        var list = props.ignore_rows;
        if (!list || list.length === 0) { return null }
        var rows = getFilteredValuesData.value;
        var set = new Set();
        list.forEach(function (i) { if (rows[i] !== void 0) { set.add(rows[i]); } });
        return set
      });

      var rowClass = function (row) { return ignoredRowSet.value !== null && ignoredRowSet.value.has(row) ? 'ignore-elements' : ''; };
      var isIgnoredCol = function (index) { return Boolean(props.ignore_cols && props.ignore_cols.indexOf(index) !== -1); };

      var fullColspan = function (cols) { return cols.length + (selectionMode.value !== 'none' ? 1 : 0) + (hasDetailSlot.value && !isGrouped.value ? 1 : 0); };

      function cellText (val) {
        if (val === null || val === void 0) { return '' }
        return Array.isArray(val) ? val.join(', ') : val
      }

      /* --------------------------------------------------- visible columns */

      var innerVisibleColumns = vue.ref(null);
      vue.watch(function () { return props.visible_columns; }, function () { innerVisibleColumns.value = null; });

      var effectiveVisibleColumns = vue.computed(function () { return innerVisibleColumns.value !== null ? innerVisibleColumns.value : props.visible_columns; }
      );

      function isColumnVisible (col) {
        var visible = effectiveVisibleColumns.value;
        return col.required === true || !visible || visible.indexOf(col.name) !== -1
      }

      function setVisibleColumns (names) {
        innerVisibleColumns.value = names;
        emit('update:visible_columns', names);
      }

      function toggleColumn (col) {
        var current = effectiveVisibleColumns.value || orderedColumns.value.map(function (c) { return c.name; });
        setVisibleColumns(current.indexOf(col.name) !== -1
          ? current.filter(function (name) { return name !== col.name; })
          : current.concat(col.name));
      }

      function showAllColumns () {
        setVisibleColumns(orderedColumns.value.map(function (c) { return c.name; }));
      }

      /* ------------------------------------------------------- pagination */

      var innerPagination = vue.ref(Object.assign(props.virtual_scroll ? { rowsPerPage: 0 } : {}, props.pagination));

      vue.watch(function () { return props.pagination; }, function (val) {
        if (props.ssr_pagination !== true && val) {
          innerPagination.value = Object.assign({}, innerPagination.value, val);
        }
      }, { deep: true });

      function onPaginationUpdate (val) {
        if (props.ssr_pagination !== true) { innerPagination.value = val; }
        emit('update:pagination', val);
      }

      // all $attrs are forwarded to QTable, so any QTable prop / event works on QGrid
      function tableBindings () {
        var bindings = Object.assign({}, attrs, {
          pagination: props.ssr_pagination === true ? props.pagination : innerPagination.value,
          'onUpdate:pagination': onPaginationUpdate
        });
        if (props.virtual_scroll === true) {
          bindings.virtualScroll = true;
          if (attrs['rows-per-page-options'] === void 0 && attrs.rowsPerPageOptions === void 0) {
            bindings.rowsPerPageOptions = [0];
          }
        }
        if (props.height) {
          bindings.style = [attrs.style, { height: props.height }];
        }
        return bindings
      }

      var rootClass = vue.computed(function () { return ({
        'qgrid--sticky-header': props.sticky_header === true || props.virtual_scroll === true,
        'qgrid--dense': props.dense === true
      }); });

      var hasTopRight = vue.computed(function () { return props.excel_download || props.csv_download || props.fullscreen || props.global_search ||
        props.groupby_filter || props.column_chooser || props.clear_filters ||
        (props.columns_filter && props.columns_filter_toggle) || hasTopRightSlot.value; }
      );

      /* -------------------------------------------------------- selection */

      var selected_prop = vue.ref(props.selected || []);
      vue.watch(function () { return props.selected; }, function (val) { selected_prop.value = val || []; });
      vue.watch(selected_prop, function (val) {
        emit('selected-val', val);
        emit('update:selected', val);
      });

      /* ----------------------------------------------------------- events */

      function rowClick (row, evt, pageIndex) {
        emit('row-click', row, evt, pageIndex);
      }

      function onRequest (data) {
        emit('OnRequest', Object.assign({}, data, { filters: getFilterModel() }));
      }

      if (props.server_side_filters === true) {
        var timer = null;
        vue.watch(function () { return JSON.stringify(getFilterModel()); }, function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            var table = tableRef.value;
            if (table !== null && typeof table.requestServerInteraction === 'function') {
              table.requestServerInteraction({
                pagination: Object.assign({}, props.ssr_pagination ? props.pagination : innerPagination.value, { page: 1 })
              });
            }
          }, 300);
        });
        vue.onBeforeUnmount(function () { return clearTimeout(timer); });
      }

      /* ------------------------------------------------------- aggregation */

      var hasAggregates = vue.computed(function () { return orderedColumns.value.some(function (col) { return col.aggregate !== void 0; }); });

      function aggregateRows () {
        var table = tableRef.value;
        if (isGrouped.value || table === null || table.filteredSortedRows === void 0) {
          return getFilteredValuesData.value
        }
        return table.filteredSortedRows
      }

      function aggregateLabel (col) {
        if (col.aggregate_label !== void 0) { return col.aggregate_label }
        return typeof col.aggregate === 'string'
          ? (mergedLabels.value[col.aggregate] || col.aggregate)
          : mergedLabels.value.total
      }

      function aggregateText (col) {
        var value = aggregate(aggregateRows(), col);
        return typeof col.aggregate_format === 'function' ? col.aggregate_format(value) : formatAggregate(value)
      }

      /* ---------------------------------------------------------- editing */

      var editError = vue.ref('');

      function validateCell (col, val, row) {
        if (typeof col.validate !== 'function') { return true }
        var res = col.validate(val, row);
        if (res === true || res === void 0) {
          editError.value = '';
          return true
        }
        editError.value = typeof res === 'string' ? res : 'Invalid value';
        return false
      }

      function onCellSave (row, col, val, initial) {
        if (typeof col.field === 'string') {
          row[col.field] = val;
        }
        else if (col.field === void 0) {
          row[col.name] = val;
        }
        dataVersion.value++;
        emit('cell-edit', { row: row, column: col, field: col.field, value: val, old_value: initial });
      }

      /* ----------------------------------------------------------- export */

      function exportTable (type) {
        var isExcel = type === 'xlsx' || type === 'excel';
        var cols = orderedColumns.value.filter(isColumnVisible);
        var rows = aggregateRows();
        var name = props.file_name || 'table-export';

        var status = isExcel
          ? quasar.exportFile(name + '.xlsx', toXlsx(rows, cols, { sheetName: name }), XLSX_MIME)
          : quasar.exportFile(name + '.csv', toCsv(rows, cols), 'text/csv;charset=utf-8');

        if (status !== true) {
          if (typeof $q.notify === 'function') {
            $q.notify({ message: mergedLabels.value.downloadDenied, color: 'negative', icon: 'warning' });
          }
          else {
            console.warn('[QGrid] ' + mergedLabels.value.downloadDenied);
          }
        }
        return status
      }

      /* ------------------------------------------------------- drag & drop */

      var sortableLib = null;
      var rowSortable = null, rowSortableEl = null;
      var colSortable = null, colSortableEl = null;
      var unmounted = false;

      function loadSortable () {
        if (sortableLib !== null) { return Promise.resolve(sortableLib) }
        return Promise.resolve().then(function () { return sortable_esm; }).then(function (mod) {
          sortableLib = mod.default || mod;
          return sortableLib
        })
      }

      function getTableParts () {
        var table = tableRef.value;
        var el = table !== null ? table.$el : null;
        if (!el || typeof el.querySelector !== 'function') { return { tbody: null, headRow: null } }
        return {
          tbody: el.querySelector('.q-table__middle > table > tbody') || el.querySelector('tbody'),
          headRow: el.querySelector('.q-table__middle > table > thead > tr') || el.querySelector('thead > tr')
        }
      }

      // Sortable moves the DOM node; put it back and let Vue render the new order
      function revertDomMove (evt) {
        var anchor = evt.item.__qgridAnchor;
        if (anchor !== void 0 && evt.from) {
          evt.from.insertBefore(evt.item, anchor && anchor.parentNode === evt.from ? anchor : null);
        }
        delete evt.item.__qgridAnchor;
      }

      var rememberAnchor = function (evt) { evt.item.__qgridAnchor = evt.item.nextSibling; };
      var preventIgnored = function (evt) { return evt.related && evt.related.classList && evt.related.classList.contains('ignore-elements') ? false : void 0; };

      function onRowDragEnd (evt) {
        revertDomMove(evt);
        var oldIndex = evt.oldDraggableIndex, newIndex = evt.newDraggableIndex;
        if (oldIndex === newIndex || isGrouped.value) { return }

        var table = tableRef.value;
        var pageRows = table !== null && table.computedRows !== void 0 ? table.computedRows : tableRows.value;
        var dragged = pageRows[oldIndex], target = pageRows[newIndex];
        var data = props.data;
        var from = data.indexOf(dragged), to = data.indexOf(target);
        if (from === -1 || to === -1) { return }

        moveItem(data, from, to);
        dataVersion.value++;
        emit('dragged_row', { dragged_row: dragged, old_index: from, new_index: to });
      }

      function onColumnDragEnd (evt) {
        revertDomMove(evt);
        var oldIndex = evt.oldDraggableIndex, newIndex = evt.newDraggableIndex;
        if (oldIndex === newIndex || isGrouped.value) { return }

        var all = orderedColumns.value;
        var visible = all.filter(isColumnVisible);
        var dragged = visible[oldIndex], target = visible[newIndex];
        if (dragged === void 0 || target === void 0) { return }

        var from = all.indexOf(dragged), to = all.indexOf(target);
        var names = all.map(function (col) { return col.name; });
        moveItem(names, from, to);
        columnOrder.value = names;

        // keep the historical behaviour: the parent's columns array is reordered in place
        var source = props.columns;
        if (Array.isArray(source)) {
          var reordered = names.map(function (name) { return source.find(function (col) { return col.name === name; }); }).filter(Boolean);
          if (reordered.length === source.length) { source.splice.apply(source, [0, source.length].concat(reordered)); }
        }

        emit('dragged_column', { dragged_column: dragged, old_index: from, new_index: to });
      }

      function destroyRowSortable () {
        if (rowSortable !== null) { rowSortable.destroy(); }
        rowSortable = rowSortableEl = null;
      }

      function destroyColSortable () {
        if (colSortable !== null) { colSortable.destroy(); }
        colSortable = colSortableEl = null;
      }

      function syncSortables () {
        if (unmounted) { return }
        var wantRows = props.draggable === true && props.virtual_scroll !== true;
        var wantCols = props.draggable_columns === true;

        if (!wantRows) { destroyRowSortable(); }
        if (!wantCols) { destroyColSortable(); }
        if (!wantRows && !wantCols) { return }

        loadSortable().then(function (Sortable) {
          if (unmounted) { return }
          var parts = getTableParts();

          if (wantRows && parts.tbody !== null && parts.tbody !== rowSortableEl) {
            destroyRowSortable();
            rowSortableEl = parts.tbody;
            rowSortable = Sortable.create(parts.tbody, {
              draggable: 'tr:not(.qgrid__static-row)',
              filter: '.ignore-elements',
              preventOnFilter: false,
              onStart: rememberAnchor,
              onMove: preventIgnored,
              onEnd: onRowDragEnd
            });
          }

          if (wantCols && parts.headRow !== null && parts.headRow !== colSortableEl) {
            destroyColSortable();
            colSortableEl = parts.headRow;
            colSortable = Sortable.create(parts.headRow, {
              draggable: hasHeaderSlot.value ? 'th:not(.ignore-elements)' : 'th[data-col]',
              filter: '.ignore-elements, .q-btn',
              preventOnFilter: false,
              onStart: rememberAnchor,
              onMove: preventIgnored,
              onEnd: onColumnDragEnd
            });
          }
        });
      }

      vue.watch(function () { return [props.draggable, props.draggable_columns, props.virtual_scroll]; }, function () { return vue.nextTick(syncSortables); });

      /* ------------------------------------------------- state persistence */

      function getState () {
        var pagination = props.ssr_pagination === true ? (props.pagination || {}) : innerPagination.value;
        return {
          version: STATE_VERSION,
          filters: JSON.parse(JSON.stringify(filter_data)),
          selections: JSON.parse(JSON.stringify(column_options_selected)),
          search: filter.value,
          columnOrder: columnOrder.value,
          visibleColumns: innerVisibleColumns.value,
          groupBy: groupField.value,
          showFilterRow: showFilterRow.value,
          sortBy: pagination.sortBy === void 0 ? null : pagination.sortBy,
          descending: pagination.descending === true,
          rowsPerPage: pagination.rowsPerPage
        }
      }

      function setState (state) {
        if (!state || typeof state !== 'object') { return }
        var cols = columnsByKey.value;
        if (state.filters) {
          Object.keys(state.filters).forEach(function (key) {
            if (cols[key] !== void 0 || key === GROUP_FILTER_KEY) { filter_data[key] = state.filters[key]; }
          });
        }
        if (state.selections) {
          Object.keys(state.selections).forEach(function (key) {
            if (cols[key] !== void 0 && Array.isArray(state.selections[key])) { column_options_selected[key] = state.selections[key]; }
          });
        }
        if (typeof state.search === 'string') { filter.value = state.search; }
        if (Array.isArray(state.columnOrder)) { columnOrder.value = state.columnOrder; }
        if (Array.isArray(state.visibleColumns)) { innerVisibleColumns.value = state.visibleColumns; }
        if (typeof state.groupBy === 'string') { setGroupBy(state.groupBy); }
        if (typeof state.showFilterRow === 'boolean') { showFilterRow.value = state.showFilterRow; }
        if (props.ssr_pagination !== true) {
          var patch = {};
          if (state.sortBy !== void 0) { patch.sortBy = state.sortBy; }
          if (typeof state.descending === 'boolean') { patch.descending = state.descending; }
          if (typeof state.rowsPerPage === 'number') { patch.rowsPerPage = state.rowsPerPage; }
          innerPagination.value = Object.assign({}, innerPagination.value, patch);
        }
      }

      var storageKey = function () { return 'qgrid:' + props.state_key; };

      function readStoredState () {
        try {
          var raw = window.localStorage.getItem(storageKey());
          var state = raw ? JSON.parse(raw) : null;
          return state && state.version === STATE_VERSION ? state : null
        }
        catch (e) {
          return null
        }
      }

      function resetState () {
        clearFilters();
        columnOrder.value = null;
        innerVisibleColumns.value = null;
        setGroupBy('');
        showFilterRow.value = true;
        if (props.state_key) {
          try { window.localStorage.removeItem(storageKey()); }
          catch (e) {}
        }
      }

      var stateTimer = null;
      vue.watch(function () { return JSON.stringify(getState()); }, function (json) {
        emit('state-change', JSON.parse(json));
        if (!props.state_key) { return }
        clearTimeout(stateTimer);
        stateTimer = setTimeout(function () {
          try { window.localStorage.setItem(storageKey(), json); }
          catch (e) {}
        }, 250);
      });

      /* -------------------------------------------------------- lifecycle */

      vue.onMounted(function () {
        // restored on mount (not during setup) so SSR hydration stays consistent
        if (props.state_key) {
          var state = readStoredState();
          if (state !== null) { setState(state); }
        }
        syncSortables();
      });

      vue.onUpdated(function () {
        if (rowSortable !== null || colSortable !== null) { syncSortables(); }
      });

      vue.onBeforeUnmount(function () {
        unmounted = true;
        clearTimeout(stateTimer);
        destroyRowSortable();
        destroyColSortable();
        scope.stop();
      });

      return {
        tableRef: tableRef,
        uuid: uuid,
        mergedLabels: mergedLabels,
        mergedIcons: mergedIcons,
        selectionMode: selectionMode,
        hasHeaderSlot: hasHeaderSlot,
        hasDefaultSlot: hasDefaultSlot,
        hasTopRightSlot: hasTopRightSlot,
        hasDetailSlot: hasDetailSlot,
        hasTopRight: hasTopRight,
        forwardedSlots: forwardedSlots,
        rootClass: rootClass,
        tableBindings: tableBindings,

        orderedColumns: orderedColumns,
        final_column: final_column,
        subColumns: subColumns,
        isColumnVisible: isColumnVisible,
        effectiveVisibleColumns: effectiveVisibleColumns,
        toggleColumn: toggleColumn,
        showAllColumns: showAllColumns,

        gorupby_option: gorupby_option,
        selected_group_by_filed: selected_group_by_filed,
        setGroupBy: setGroupBy,
        isGrouped: isGrouped,
        groupRowsOf: groupRowsOf,
        group_pagination: group_pagination,
        effectiveRowKey: effectiveRowKey,

        filter: filter,
        setGlobalSearch: setGlobalSearch,
        filter_data: filter_data,
        column_options_selected: column_options_selected,
        headerSearch: headerSearch,
        showFilterRow: showFilterRow,
        toggleFilterRow: toggleFilterRow,
        filterInputPropsComputed: filterInputPropsComputed,
        filterKey: filterKey,
        filterTypeOf: filterTypeOf,
        isFilterActive: isFilterActive,
        resetFilter: resetFilter,
        setDateFilter: setDateFilter,
        dateLabel: dateLabel,
        numberLabel: numberLabel,
        filtersActive: filtersActive,
        clearFilters: clearFilters,
        getFilterModel: getFilterModel,

        getColumnOptions: getColumnOptions,
        headerOptions: headerOptions,
        selectionCount: selectionCount,
        isOptionSelected: isOptionSelected,
        toggleOption: toggleOption,
        selectAllState: selectAllState,
        toggleAll: toggleAll,
        clearSelection: clearSelection,

        getFilteredData: getFilteredData,
        getFilteredValuesData: getFilteredValuesData,
        tableRows: tableRows,
        rowClass: rowClass,
        isIgnoredCol: isIgnoredCol,
        fullColspan: fullColspan,
        cellText: cellText,
        getRawValue: getRawValue,

        selected_prop: selected_prop,
        rowClick: rowClick,
        onRequest: onRequest,

        hasAggregates: hasAggregates,
        aggregateLabel: aggregateLabel,
        aggregateText: aggregateText,

        editError: editError,
        validateCell: validateCell,
        onCellSave: onCellSave,

        exportTable: exportTable,
        getState: getState,
        setState: setState,
        resetState: resetState
      }
    }
  });

  var _hoisted_1 = { class: "qgrid__label" };
  var _hoisted_2 = { class: "row items-center no-wrap q-pl-md q-pr-xs q-pt-xs" };
  var _hoisted_3 = { class: "qgrid__menu-title ellipsis" };
  var _hoisted_4 = { class: "q-px-sm q-pb-xs" };
  var _hoisted_5 = {
    key: 1,
    class: "qgrid__menu-empty"
  };
  var _hoisted_6 = { class: "row justify-end q-pa-xs" };
  var _hoisted_7 = { class: "row items-center justify-end" };
  var _hoisted_8 = {
    key: 1,
    class: "qgrid__toolbar row items-center no-wrap"
  };
  var _hoisted_9 = { class: "qgrid__group-name" };
  var _hoisted_10 = { class: "qgrid__agg-label" };
  var _hoisted_11 = { class: "qgrid__agg-value" };

  function render(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_q_checkbox = vue.resolveComponent("q-checkbox");
    var _component_q_th = vue.resolveComponent("q-th");
    var _component_q_badge = vue.resolveComponent("q-badge");
    var _component_q_space = vue.resolveComponent("q-space");
    var _component_q_btn = vue.resolveComponent("q-btn");
    var _component_q_icon = vue.resolveComponent("q-icon");
    var _component_q_input = vue.resolveComponent("q-input");
    var _component_q_item_section = vue.resolveComponent("q-item-section");
    var _component_q_item = vue.resolveComponent("q-item");
    var _component_q_separator = vue.resolveComponent("q-separator");
    var _component_q_virtual_scroll = vue.resolveComponent("q-virtual-scroll");
    var _component_q_menu = vue.resolveComponent("q-menu");
    var _component_q_tr = vue.resolveComponent("q-tr");
    var _component_slot_proxy = vue.resolveComponent("slot-proxy");
    var _component_q_select = vue.resolveComponent("q-select");
    var _component_q_date = vue.resolveComponent("q-date");
    var _component_q_popup_proxy = vue.resolveComponent("q-popup-proxy");
    var _component_q_tooltip = vue.resolveComponent("q-tooltip");
    var _component_q_item_label = vue.resolveComponent("q-item-label");
    var _component_q_list = vue.resolveComponent("q-list");
    var _component_q_td = vue.resolveComponent("q-td");
    var _component_q_popup_edit = vue.resolveComponent("q-popup-edit");
    var _component_q_table = vue.resolveComponent("q-table");
    var _directive_close_popup = vue.resolveDirective("close-popup");

    return (vue.openBlock(), vue.createElementBlock("div", {
      class: vue.normalizeClass(["qgrid", _ctx.rootClass])
    }, [
      vue.createVNode(_component_q_table, vue.mergeProps({
        ref: "tableRef",
        id: _ctx.uuid
      }, _ctx.tableBindings(), {
        loading: _ctx.loading,
        rows: _ctx.tableRows,
        columns: _ctx.final_column,
        "row-key": _ctx.effectiveRowKey,
        class: _ctx.classes,
        "visible-columns": _ctx.effectiveVisibleColumns,
        separator: _ctx.separator,
        dense: _ctx.dense,
        dark: _ctx.dark,
        flat: _ctx.flat,
        bordered: _ctx.bordered,
        square: _ctx.square,
        selection: _ctx.selectionMode,
        selected: _ctx.selected_prop,
        "onUpdate:selected": _cache[7] || (_cache[7] = function ($event) { return ((_ctx.selected_prop) = $event); }),
        filter: _ctx.global_filter || _ctx.filter,
        onRequest: _ctx.onRequest
      }), vue.createSlots({
        header: vue.withCtx(function (props) { return [
          (!_ctx.hasHeaderSlot)
            ? (vue.openBlock(), vue.createBlock(_component_q_tr, {
                key: "qgrid-header",
                props: props,
                class: "qgrid__header-row"
              }, {
                default: vue.withCtx(function () { return [
                  (_ctx.selectionMode !== 'none')
                    ? (vue.openBlock(), vue.createBlock(_component_q_th, {
                        key: 0,
                        "auto-width": "",
                        class: "ignore-elements"
                      }, {
                        default: vue.withCtx(function () { return [
                          (_ctx.selectionMode === 'multiple')
                            ? (vue.openBlock(), vue.createBlock(_component_q_checkbox, {
                                key: 0,
                                modelValue: props.selected,
                                "onUpdate:modelValue": function ($event) { return ((props.selected) = $event); },
                                "indeterminate-value": "some",
                                dense: _ctx.dense,
                                "aria-label": _ctx.mergedLabels.selectAll
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "dense", "aria-label"]))
                            : vue.createCommentVNode("", true)
                        ]; }),
                        _: 2
                      }, 1024))
                    : vue.createCommentVNode("", true),
                  (_ctx.hasDetailSlot && !_ctx.isGrouped)
                    ? (vue.openBlock(), vue.createBlock(_component_q_th, {
                        key: 1,
                        "auto-width": "",
                        class: "ignore-elements"
                      }))
                    : vue.createCommentVNode("", true),
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col, colIndex) {
                    return (vue.openBlock(), vue.createBlock(_component_q_th, {
                      key: col.name,
                      props: props,
                      "data-col": col.name,
                      class: vue.normalizeClass(_ctx.isIgnoredCol(colIndex) ? 'ignore-elements' : '')
                    }, {
                      default: vue.withCtx(function () { return [
                        vue.renderSlot(_ctx.$slots, 'header-cell-' + col.name, {
                          col: col,
                          cols: props.cols,
                          sort: props.sort
                        }, function () { return [
                          vue.createElementVNode("span", _hoisted_1, vue.toDisplayString(col.label), 1)
                        ]; }),
                        (_ctx.header_filter && col.show_filter && !_ctx.isGrouped)
                          ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                              key: 0,
                              flat: "",
                              round: "",
                              dense: "",
                              size: "sm",
                              class: vue.normalizeClass(["qgrid__header-filter-btn", { 'qgrid__header-filter-btn--active': _ctx.selectionCount(_ctx.filterKey(col)) > 0 }]),
                              icon: _ctx.mergedIcons.filter,
                              "aria-label": _ctx.mergedLabels.filterValues + ': ' + col.label,
                              onClick: _cache[1] || (_cache[1] = vue.withModifiers(function () {}, ["stop"]))
                            }, {
                              default: vue.withCtx(function () { return [
                                (_ctx.selectionCount(_ctx.filterKey(col)) > 0)
                                  ? (vue.openBlock(), vue.createBlock(_component_q_badge, {
                                      key: 0,
                                      floating: "",
                                      rounded: "",
                                      color: "negative",
                                      class: "qgrid__badge",
                                      label: _ctx.selectionCount(_ctx.filterKey(col))
                                    }, null, 8, ["label"]))
                                  : vue.createCommentVNode("", true),
                                vue.createVNode(_component_q_menu, {
                                  anchor: "bottom right",
                                  self: "top right",
                                  onHide: function ($event) { return (_ctx.headerSearch[_ctx.filterKey(col)] = ''); }
                                }, {
                                  default: vue.withCtx(function () { return [
                                    vue.createElementVNode("div", {
                                      class: "qgrid__menu",
                                      onClick: _cache[0] || (_cache[0] = vue.withModifiers(function () {}, ["stop"]))
                                    }, [
                                      vue.createElementVNode("div", _hoisted_2, [
                                        vue.createElementVNode("div", _hoisted_3, vue.toDisplayString(col.label), 1),
                                        vue.createVNode(_component_q_space),
                                        vue.withDirectives(vue.createVNode(_component_q_btn, {
                                          flat: "",
                                          round: "",
                                          dense: "",
                                          size: "sm",
                                          icon: _ctx.mergedIcons.close,
                                          "aria-label": _ctx.mergedLabels.close
                                        }, null, 8, ["icon", "aria-label"]), [
                                          [_directive_close_popup]
                                        ])
                                      ]),
                                      vue.createElementVNode("div", _hoisted_4, [
                                        vue.createVNode(_component_q_input, {
                                          modelValue: _ctx.headerSearch[_ctx.filterKey(col)],
                                          "onUpdate:modelValue": function ($event) { return ((_ctx.headerSearch[_ctx.filterKey(col)]) = $event); },
                                          dense: "",
                                          outlined: "",
                                          clearable: "",
                                          autofocus: "",
                                          placeholder: _ctx.mergedLabels.filterValues,
                                          dark: _ctx.dark
                                        }, {
                                          prepend: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_icon, {
                                              name: _ctx.mergedIcons.search,
                                              size: "18px"
                                            }, null, 8, ["name"])
                                          ]; }),
                                          _: 1
                                        }, 8, ["modelValue", "onUpdate:modelValue", "placeholder", "dark"])
                                      ]),
                                      vue.createVNode(_component_q_item, {
                                        tag: "label",
                                        dense: "",
                                        class: "qgrid__menu-item",
                                        dark: _ctx.dark
                                      }, {
                                        default: vue.withCtx(function () { return [
                                          vue.createVNode(_component_q_item_section, { side: "" }, {
                                            default: vue.withCtx(function () { return [
                                              vue.createVNode(_component_q_checkbox, {
                                                dense: "",
                                                "model-value": _ctx.selectAllState(_ctx.filterKey(col), _ctx.headerOptions(col)),
                                                "onUpdate:modelValue": function ($event) { return (_ctx.toggleAll(_ctx.filterKey(col), _ctx.headerOptions(col))); }
                                              }, null, 8, ["model-value", "onUpdate:modelValue"])
                                            ]; }),
                                            _: 2
                                          }, 1024),
                                          vue.createVNode(_component_q_item_section, { class: "text-weight-medium" }, {
                                            default: vue.withCtx(function () { return [
                                              vue.createTextVNode(vue.toDisplayString(_ctx.mergedLabels.selectAll), 1)
                                            ]; }),
                                            _: 1
                                          })
                                        ]; }),
                                        _: 2
                                      }, 1032, ["dark"]),
                                      vue.createVNode(_component_q_separator, { dark: _ctx.dark }, null, 8, ["dark"]),
                                      (_ctx.headerOptions(col).length > 0)
                                        ? (vue.openBlock(), vue.createBlock(_component_q_virtual_scroll, {
                                            key: 0,
                                            class: "qgrid__menu-list",
                                            items: _ctx.headerOptions(col),
                                            "virtual-scroll-item-size": 32
                                          }, {
                                            default: vue.withCtx(function (ref) {
                                              var item = ref.item;

                                              return [
                                              (vue.openBlock(), vue.createBlock(_component_q_item, {
                                                key: item.value,
                                                tag: "label",
                                                dense: "",
                                                class: "qgrid__menu-item",
                                                dark: _ctx.dark
                                              }, {
                                                default: vue.withCtx(function () { return [
                                                  vue.createVNode(_component_q_item_section, { side: "" }, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createVNode(_component_q_checkbox, {
                                                        dense: "",
                                                        "model-value": _ctx.isOptionSelected(_ctx.filterKey(col), item.value),
                                                        "onUpdate:modelValue": function ($event) { return (_ctx.toggleOption(_ctx.filterKey(col), item.value)); }
                                                      }, null, 8, ["model-value", "onUpdate:modelValue"])
                                                    ]; }),
                                                    _: 2
                                                  }, 1024),
                                                  vue.createVNode(_component_q_item_section, { class: "ellipsis" }, {
                                                    default: vue.withCtx(function () { return [
                                                      vue.createTextVNode(vue.toDisplayString(item.label), 1)
                                                    ]; }),
                                                    _: 2
                                                  }, 1024)
                                                ]; }),
                                                _: 2
                                              }, 1032, ["dark"]))
                                            ];
                                    }),
                                            _: 2
                                          }, 1032, ["items"]))
                                        : (vue.openBlock(), vue.createElementBlock("div", _hoisted_5, vue.toDisplayString(_ctx.mergedLabels.noValues), 1)),
                                      vue.createVNode(_component_q_separator, { dark: _ctx.dark }, null, 8, ["dark"]),
                                      vue.createElementVNode("div", _hoisted_6, [
                                        vue.withDirectives(vue.createVNode(_component_q_btn, {
                                          flat: "",
                                          dense: "",
                                          "no-caps": "",
                                          size: "sm",
                                          color: "primary",
                                          label: _ctx.mergedLabels.clear,
                                          onClick: function ($event) { return (_ctx.clearSelection(_ctx.filterKey(col))); }
                                        }, null, 8, ["label", "onClick"]), [
                                          [_directive_close_popup]
                                        ])
                                      ])
                                    ])
                                  ]; }),
                                  _: 2
                                }, 1032, ["onHide"])
                              ]; }),
                              _: 2
                            }, 1032, ["class", "icon", "aria-label"]))
                          : vue.createCommentVNode("", true)
                      ]; }),
                      _: 2
                    }, 1032, ["props", "data-col", "class"]))
                  }), 128))
                ]; }),
                _: 2
              }, 1032, ["props"]))
            : (vue.openBlock(), vue.createBlock(_component_slot_proxy, {
                key: "qgrid-header-slot",
                render: _ctx.$slots.header,
                scope: props
              }, null, 8, ["render", "scope"])),
          (_ctx.columns_filter && _ctx.showFilterRow)
            ? (vue.openBlock(), vue.createBlock(_component_q_tr, {
                key: "qgrid-filters",
                props: props,
                class: "ignore-elements qgrid__filter-row"
              }, {
                default: vue.withCtx(function () { return [
                  (_ctx.selectionMode !== 'none')
                    ? (vue.openBlock(), vue.createBlock(_component_q_th, {
                        key: 0,
                        "auto-width": ""
                      }))
                    : vue.createCommentVNode("", true),
                  (_ctx.hasDetailSlot && !_ctx.isGrouped)
                    ? (vue.openBlock(), vue.createBlock(_component_q_th, {
                        key: 1,
                        "auto-width": ""
                      }))
                    : vue.createCommentVNode("", true),
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col) {
                    return (vue.openBlock(), vue.createBlock(_component_q_th, {
                      key: col.name,
                      class: "qgrid__filter-cell"
                    }, {
                      default: vue.withCtx(function () { return [
                        (_ctx.filterTypeOf(col) === 'select')
                          ? (vue.openBlock(), vue.createBlock(_component_q_select, vue.mergeProps({
                              key: 0,
                              modelValue: _ctx.column_options_selected[_ctx.filterKey(col)],
                              "onUpdate:modelValue": function ($event) { return ((_ctx.column_options_selected[_ctx.filterKey(col)]) = $event); },
                              options: _ctx.getColumnOptions(_ctx.filterKey(col)),
                              multiple: "",
                              "emit-value": "",
                              "map-options": "",
                              dense: "",
                              "options-dense": ""
                            }, { ref_for: true }, _ctx.filterInputPropsComputed, {
                              "aria-label": col.label
                            }), {
                              append: vue.withCtx(function () { return [
                                (_ctx.selectionCount(_ctx.filterKey(col)) > 0)
                                  ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                      key: 0,
                                      name: _ctx.mergedIcons.cancel,
                                      class: "cursor-pointer",
                                      onClick: vue.withModifiers(function ($event) { return (_ctx.clearSelection(_ctx.filterKey(col))); }, ["stop"])
                                    }, null, 8, ["name", "onClick"]))
                                  : vue.createCommentVNode("", true)
                              ]; }),
                              "before-options": vue.withCtx(function () { return [
                                vue.createVNode(_component_q_item, {
                                  tag: "label",
                                  dense: "",
                                  class: "sticky-top qgrid__select-all"
                                }, {
                                  default: vue.withCtx(function () { return [
                                    vue.createVNode(_component_q_item_section, { side: "" }, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_checkbox, {
                                          dense: "",
                                          "model-value": _ctx.selectAllState(_ctx.filterKey(col), _ctx.getColumnOptions(_ctx.filterKey(col))),
                                          "onUpdate:modelValue": function ($event) { return (_ctx.toggleAll(_ctx.filterKey(col), _ctx.getColumnOptions(_ctx.filterKey(col)))); }
                                        }, null, 8, ["model-value", "onUpdate:modelValue"])
                                      ]; }),
                                      _: 2
                                    }, 1024),
                                    vue.createVNode(_component_q_item_section, null, {
                                      default: vue.withCtx(function () { return [
                                        vue.createTextVNode(vue.toDisplayString(_ctx.mergedLabels.selectAll), 1)
                                      ]; }),
                                      _: 1
                                    })
                                  ]; }),
                                  _: 2
                                }, 1024)
                              ]; }),
                              option: vue.withCtx(function (scope) { return [
                                vue.createVNode(_component_q_item, vue.mergeProps({ ref_for: true }, scope.itemProps, { dense: "" }), {
                                  default: vue.withCtx(function () { return [
                                    vue.createVNode(_component_q_item_section, { side: "" }, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_checkbox, {
                                          dense: "",
                                          "model-value": scope.selected,
                                          "onUpdate:modelValue": function ($event) { return (scope.toggleOption(scope.opt)); }
                                        }, null, 8, ["model-value", "onUpdate:modelValue"])
                                      ]; }),
                                      _: 2
                                    }, 1024),
                                    vue.createVNode(_component_q_item_section, null, {
                                      default: vue.withCtx(function () { return [
                                        vue.createTextVNode(vue.toDisplayString(scope.opt.label), 1)
                                      ]; }),
                                      _: 2
                                    }, 1024)
                                  ]; }),
                                  _: 2
                                }, 1040)
                              ]; }),
                              _: 2
                            }, 1040, ["modelValue", "onUpdate:modelValue", "options", "aria-label"]))
                          : (_ctx.filterTypeOf(col) === 'date')
                            ? (vue.openBlock(), vue.createBlock(_component_q_input, vue.mergeProps({
                                key: 1,
                                dense: "",
                                readonly: ""
                              }, { ref_for: true }, _ctx.filterInputPropsComputed, {
                                "model-value": _ctx.dateLabel(_ctx.filterKey(col)),
                                "aria-label": col.label
                              }), {
                                append: vue.withCtx(function () { return [
                                  (_ctx.isFilterActive(col))
                                    ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                        key: 0,
                                        name: _ctx.mergedIcons.cancel,
                                        class: "cursor-pointer",
                                        onClick: vue.withModifiers(function ($event) { return (_ctx.resetFilter(col)); }, ["stop"])
                                      }, null, 8, ["name", "onClick"]))
                                    : vue.createCommentVNode("", true),
                                  vue.createVNode(_component_q_icon, {
                                    name: _ctx.mergedIcons.date,
                                    class: "cursor-pointer"
                                  }, {
                                    default: vue.withCtx(function () { return [
                                      vue.createVNode(_component_q_popup_proxy, {
                                        cover: "",
                                        "transition-show": "scale",
                                        "transition-hide": "scale"
                                      }, {
                                        default: vue.withCtx(function () { return [
                                          vue.createVNode(_component_q_date, {
                                            range: "",
                                            "model-value": _ctx.filter_data[_ctx.filterKey(col)],
                                            dark: _ctx.dark,
                                            "onUpdate:modelValue": function (val) { return _ctx.setDateFilter(_ctx.filterKey(col), val); }
                                          }, {
                                            default: vue.withCtx(function () { return [
                                              vue.createElementVNode("div", _hoisted_7, [
                                                vue.withDirectives(vue.createVNode(_component_q_btn, {
                                                  label: _ctx.mergedLabels.close,
                                                  "no-caps": "",
                                                  color: "primary",
                                                  flat: ""
                                                }, null, 8, ["label"]), [
                                                  [_directive_close_popup]
                                                ])
                                              ])
                                            ]; }),
                                            _: 1
                                          }, 8, ["model-value", "dark", "onUpdate:modelValue"])
                                        ]; }),
                                        _: 2
                                      }, 1024)
                                    ]; }),
                                    _: 2
                                  }, 1032, ["name"])
                                ]; }),
                                _: 2
                              }, 1040, ["model-value", "aria-label"]))
                            : (_ctx.filterTypeOf(col) === 'number_range')
                              ? (vue.openBlock(), vue.createBlock(_component_q_input, vue.mergeProps({
                                  key: 2,
                                  dense: "",
                                  readonly: ""
                                }, { ref_for: true }, _ctx.filterInputPropsComputed, {
                                  "model-value": _ctx.numberLabel(_ctx.filterKey(col)),
                                  "aria-label": col.label
                                }), {
                                  append: vue.withCtx(function () { return [
                                    (_ctx.isFilterActive(col))
                                      ? (vue.openBlock(), vue.createBlock(_component_q_icon, {
                                          key: 0,
                                          name: _ctx.mergedIcons.cancel,
                                          class: "cursor-pointer",
                                          onClick: vue.withModifiers(function ($event) { return (_ctx.resetFilter(col)); }, ["stop"])
                                        }, null, 8, ["name", "onClick"]))
                                      : vue.createCommentVNode("", true),
                                    vue.createVNode(_component_q_icon, {
                                      name: _ctx.mergedIcons.numberRange,
                                      class: "cursor-pointer"
                                    }, {
                                      default: vue.withCtx(function () { return [
                                        vue.createVNode(_component_q_popup_proxy, {
                                          cover: "",
                                          class: "row no-wrap q-pa-sm q-gutter-x-sm",
                                          "transition-show": "scale",
                                          "transition-hide": "scale"
                                        }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_input, vue.mergeProps({
                                              modelValue: _ctx.filter_data[_ctx.filterKey(col)].from,
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[_ctx.filterKey(col)].from) = $event); },
                                              modelModifiers: { number: true },
                                              type: "number",
                                              label: _ctx.mergedLabels.from
                                            }, { ref_for: true }, _ctx.filterInputPropsComputed), null, 16, ["modelValue", "onUpdate:modelValue", "label"]),
                                            vue.createVNode(_component_q_input, vue.mergeProps({
                                              modelValue: _ctx.filter_data[_ctx.filterKey(col)].to,
                                              "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[_ctx.filterKey(col)].to) = $event); },
                                              modelModifiers: { number: true },
                                              type: "number",
                                              label: _ctx.mergedLabels.to
                                            }, { ref_for: true }, _ctx.filterInputPropsComputed), null, 16, ["modelValue", "onUpdate:modelValue", "label"])
                                          ]; }),
                                          _: 2
                                        }, 1024)
                                      ]; }),
                                      _: 2
                                    }, 1032, ["name"])
                                  ]; }),
                                  _: 2
                                }, 1040, ["model-value", "aria-label"]))
                              : (vue.openBlock(), vue.createBlock(_component_q_input, vue.mergeProps({
                                  key: 3,
                                  modelValue: _ctx.filter_data[_ctx.filterKey(col)],
                                  "onUpdate:modelValue": function ($event) { return ((_ctx.filter_data[_ctx.filterKey(col)]) = $event); },
                                  dense: ""
                                }, { ref_for: true }, _ctx.filterInputPropsComputed, {
                                  debounce: _ctx.filter_debounce,
                                  "aria-label": col.label
                                }), vue.createSlots({ _: 2 }, [
                                  (_ctx.filter_data[_ctx.filterKey(col)])
                                    ? {
                                        name: "append",
                                        fn: vue.withCtx(function () { return [
                                          vue.createVNode(_component_q_icon, {
                                            name: _ctx.mergedIcons.cancel,
                                            class: "cursor-pointer",
                                            onClick: vue.withModifiers(function ($event) { return (_ctx.filter_data[_ctx.filterKey(col)] = ''); }, ["stop"])
                                          }, null, 8, ["name", "onClick"])
                                        ]; }),
                                        key: "0"
                                      }
                                    : undefined
                                ]), 1040, ["modelValue", "onUpdate:modelValue", "debounce", "aria-label"]))
                      ]; }),
                      _: 2
                    }, 1024))
                  }), 128))
                ]; }),
                _: 2
              }, 1032, ["props"]))
            : vue.createCommentVNode("", true)
        ]; }),
        body: vue.withCtx(function (props) { return [
          (!_ctx.hasDefaultSlot)
            ? (vue.openBlock(), vue.createBlock(_component_q_tr, {
                key: props.key + ':row',
                props: props,
                class: vue.normalizeClass(["qgrid__row", _ctx.rowClass(props.row)]),
                onClick: function ($event) { return (_ctx.rowClick(props.row, $event, props.pageIndex)); }
              }, {
                default: vue.withCtx(function () { return [
                  (_ctx.selectionMode !== 'none')
                    ? (vue.openBlock(), vue.createBlock(_component_q_td, {
                        key: 0,
                        "auto-width": ""
                      }, {
                        default: vue.withCtx(function () { return [
                          vue.createVNode(_component_q_checkbox, {
                            modelValue: props.selected,
                            "onUpdate:modelValue": function ($event) { return ((props.selected) = $event); },
                            color: "primary",
                            dense: _ctx.dense
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "dense"])
                        ]; }),
                        _: 2
                      }, 1024))
                    : vue.createCommentVNode("", true),
                  (_ctx.hasDetailSlot && !_ctx.isGrouped)
                    ? (vue.openBlock(), vue.createBlock(_component_q_td, {
                        key: 1,
                        "auto-width": ""
                      }, {
                        default: vue.withCtx(function () { return [
                          vue.createVNode(_component_q_btn, {
                            flat: "",
                            round: "",
                            dense: "",
                            size: "sm",
                            icon: props.expand ? _ctx.mergedIcons.detailOpen : _ctx.mergedIcons.detailClosed,
                            "aria-label": props.expand ? _ctx.mergedLabels.collapse : _ctx.mergedLabels.expand,
                            "aria-expanded": props.expand ? 'true' : 'false',
                            onClick: vue.withModifiers(function ($event) { return (props.expand = !props.expand); }, ["stop"])
                          }, null, 8, ["icon", "aria-label", "aria-expanded", "onClick"])
                        ]; }),
                        _: 2
                      }, 1024))
                    : vue.createCommentVNode("", true),
                  (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col, colIndex) {
                    return (vue.openBlock(), vue.createBlock(_component_q_td, {
                      key: col.name,
                      props: props
                    }, {
                      default: vue.withCtx(function () { return [
                        (_ctx.isGrouped && colIndex === 0)
                          ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                              vue.createVNode(_component_q_btn, {
                                size: "sm",
                                color: "accent",
                                round: "",
                                dense: "",
                                class: "q-mr-sm",
                                icon: props.expand ? _ctx.mergedIcons.collapse : _ctx.mergedIcons.expand,
                                "aria-label": props.expand ? _ctx.mergedLabels.collapse : _ctx.mergedLabels.expand,
                                onClick: vue.withModifiers(function ($event) { return (props.expand = !props.expand); }, ["stop"])
                              }, null, 8, ["icon", "aria-label", "onClick"]),
                              vue.createElementVNode("span", _hoisted_9, vue.toDisplayString(props.row.name === '' ? '—' : props.row.name), 1),
                              vue.createVNode(_component_q_badge, {
                                rounded: "",
                                class: "qgrid__group-count q-ml-sm",
                                label: props.row.__qgrid_count
                              }, null, 8, ["label"])
                            ], 64))
                          : vue.renderSlot(_ctx.$slots, 'body-cell-' + col.name, {
                              row: props.row,
                              col: col,
                              value: col.value,
                              keyValue: props.key,
                              pageIndex: props.pageIndex
                            }, function () { return [
                              vue.createTextVNode(vue.toDisplayString(_ctx.cellText(col.value)), 1)
                            ]; }, undefined, 1),
                        (col.editable && !_ctx.isGrouped)
                          ? (vue.openBlock(), vue.createBlock(_component_q_popup_edit, {
                              key: 2,
                              "model-value": _ctx.getRawValue(props.row, col),
                              validate: function (val) { return _ctx.validateCell(col, val, props.row); },
                              buttons: col.edit_buttons === true,
                              onSave: function (val, initial) { return _ctx.onCellSave(props.row, col, val, initial); },
                              onHide: _cache[6] || (_cache[6] = function ($event) { return (_ctx.editError = ''); })
                            }, {
                              default: vue.withCtx(function (scope) { return [
                                (col.edit_type === 'select')
                                  ? (vue.openBlock(), vue.createBlock(_component_q_select, {
                                      key: 0,
                                      modelValue: scope.value,
                                      "onUpdate:modelValue": [function ($event) { return ((scope.value) = $event); }, scope.set],
                                      options: col.edit_options || _ctx.getColumnOptions(_ctx.filterKey(col)).map(function (o) { return o.label; }),
                                      dense: "",
                                      autofocus: "",
                                      "options-dense": "",
                                      "emit-value": "",
                                      "map-options": "",
                                      error: _ctx.editError !== '',
                                      "error-message": _ctx.editError
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "error", "error-message"]))
                                  : (col.edit_type === 'number')
                                    ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                                        key: 1,
                                        modelValue: scope.value,
                                        "onUpdate:modelValue": function ($event) { return ((scope.value) = $event); },
                                        modelModifiers: { number: true },
                                        type: "number",
                                        dense: "",
                                        autofocus: "",
                                        error: _ctx.editError !== '',
                                        "error-message": _ctx.editError,
                                        onKeyup: vue.withKeys(scope.set, ["enter"])
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "error", "error-message", "onKeyup"]))
                                    : (vue.openBlock(), vue.createBlock(_component_q_input, {
                                        key: 2,
                                        modelValue: scope.value,
                                        "onUpdate:modelValue": function ($event) { return ((scope.value) = $event); },
                                        dense: "",
                                        autofocus: "",
                                        type: col.edit_type === 'textarea' ? 'textarea' : 'text',
                                        error: _ctx.editError !== '',
                                        "error-message": _ctx.editError,
                                        onKeyup: vue.withKeys(vue.withModifiers(function ($event) { return (col.edit_type === 'textarea' ? void 0 : scope.set()); }, ["stop"]), ["enter"])
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "error", "error-message", "onKeyup"]))
                              ]; }),
                              _: 2
                            }, 1032, ["model-value", "validate", "buttons", "onSave"]))
                          : vue.createCommentVNode("", true)
                      ]; }),
                      _: 2
                    }, 1032, ["props"]))
                  }), 128))
                ]; }),
                _: 2
              }, 1032, ["props", "class", "onClick"]))
            : (vue.openBlock(), vue.createBlock(_component_slot_proxy, {
                key: props.key + ':slot',
                render: _ctx.$slots.body,
                scope: props
              }, null, 8, ["render", "scope"])),
          (_ctx.isGrouped)
            ? vue.withDirectives((vue.openBlock(), vue.createBlock(_component_q_tr, {
                key: props.key + ':group',
                props: props,
                class: "qgrid__static-row qgrid__group-detail ignore-elements"
              }, {
                default: vue.withCtx(function () { return [
                  vue.createVNode(_component_q_td, {
                    colspan: _ctx.fullColspan(props.cols),
                    class: "q-pa-none"
                  }, {
                    default: vue.withCtx(function () { return [
                      (props.expand)
                        ? (vue.openBlock(), vue.createBlock(_component_q_table, {
                            key: 0,
                            flat: "",
                            "hide-bottom": "",
                            dense: _ctx.dense,
                            dark: _ctx.dark,
                            rows: _ctx.groupRowsOf(props.row.name),
                            columns: _ctx.subColumns,
                            "row-key": _ctx.row_key || 'name',
                            pagination: _ctx.group_pagination
                          }, null, 8, ["dense", "dark", "rows", "columns", "row-key", "pagination"]))
                        : vue.createCommentVNode("", true)
                    ]; }),
                    _: 2
                  }, 1032, ["colspan"])
                ]; }),
                _: 2
              }, 1032, ["props"])), [
                [vue.vShow, props.expand]
              ])
            : (_ctx.hasDetailSlot)
              ? vue.withDirectives((vue.openBlock(), vue.createBlock(_component_q_tr, {
                  key: props.key + ':detail',
                  props: props,
                  class: "qgrid__static-row qgrid__detail-row ignore-elements"
                }, {
                  default: vue.withCtx(function () { return [
                    vue.createVNode(_component_q_td, {
                      colspan: _ctx.fullColspan(props.cols)
                    }, {
                      default: vue.withCtx(function () { return [
                        (props.expand)
                          ? vue.renderSlot(_ctx.$slots, "detail", {
                              row: props.row,
                              cols: props.cols,
                              keyValue: props.key,
                              pageIndex: props.pageIndex
                            }, undefined, undefined, 0)
                          : vue.createCommentVNode("", true)
                      ]; }),
                      _: 2
                    }, 1032, ["colspan"])
                  ]; }),
                  _: 2
                }, 1032, ["props"])), [
                  [vue.vShow, props.expand]
                ])
              : vue.createCommentVNode("", true)
        ]; }),
        _: 2
      }, [
        (_ctx.hasTopRight)
          ? {
              name: "top-right",
              fn: vue.withCtx(function (props) { return [
                (_ctx.hasTopRightSlot)
                  ? vue.renderSlot(_ctx.$slots, "top_right", {
                      excel_download: _ctx.excel_download,
                      csv_download: _ctx.csv_download,
                      fullscreen: _ctx.fullscreen,
                      global_search: _ctx.global_search,
                      groupby_filter: _ctx.groupby_filter,
                      toggleFullscreen: props.toggleFullscreen,
                      inFullscreen: props.inFullscreen,
                      exportTable: _ctx.exportTable,
                      gorupby_option: _ctx.gorupby_option,
                      selected_group_by_filed: _ctx.selected_group_by_filed,
                      set_group_by: _ctx.setGroupBy,
                      filter: _ctx.filter,
                      set_filter: _ctx.setGlobalSearch,
                      show_filter_row: _ctx.showFilterRow,
                      toggle_filter_row: _ctx.toggleFilterRow,
                      clear_filters: _ctx.clearFilters,
                      filters_active: _ctx.filtersActive,
                      visible_columns: _ctx.effectiveVisibleColumns,
                      toggle_column: _ctx.toggleColumn
                    }, undefined, undefined, 0)
                  : (vue.openBlock(), vue.createElementBlock("div", _hoisted_8, [
                      (_ctx.global_search)
                        ? (vue.openBlock(), vue.createBlock(_component_q_input, {
                            key: 0,
                            modelValue: _ctx.filter,
                            "onUpdate:modelValue": _cache[2] || (_cache[2] = function ($event) { return ((_ctx.filter) = $event); }),
                            filled: "",
                            borderless: "",
                            dense: "",
                            debounce: "300",
                            class: "qgrid__search q-mr-sm",
                            placeholder: _ctx.mergedLabels.search,
                            dark: _ctx.dark,
                            "aria-label": _ctx.mergedLabels.search
                          }, {
                            append: vue.withCtx(function () { return [
                              vue.createVNode(_component_q_icon, {
                                name: _ctx.mergedIcons.search
                              }, null, 8, ["name"])
                            ]; }),
                            _: 1
                          }, 8, ["modelValue", "placeholder", "dark", "aria-label"]))
                        : vue.createCommentVNode("", true),
                      (_ctx.groupby_filter)
                        ? (vue.openBlock(), vue.createBlock(_component_q_select, {
                            key: 1,
                            modelValue: _ctx.selected_group_by_filed,
                            "onUpdate:modelValue": _cache[3] || (_cache[3] = function ($event) { return ((_ctx.selected_group_by_filed) = $event); }),
                            outlined: "",
                            dense: "",
                            "options-dense": "",
                            class: "qgrid__group-select q-mr-sm",
                            options: _ctx.gorupby_option,
                            dark: _ctx.dark
                          }, null, 8, ["modelValue", "options", "dark"]))
                        : vue.createCommentVNode("", true),
                      (_ctx.clear_filters && _ctx.filtersActive)
                        ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                            key: 2,
                            flat: "",
                            dense: "",
                            "no-caps": "",
                            class: "q-mr-xs",
                            icon: _ctx.mergedIcons.clearFilters,
                            label: _ctx.$q.screen.gt.xs ? _ctx.mergedLabels.clearFilters : void 0,
                            "aria-label": _ctx.mergedLabels.clearFilters,
                            onClick: _ctx.clearFilters
                          }, null, 8, ["icon", "label", "aria-label", "onClick"]))
                        : vue.createCommentVNode("", true),
                      (_ctx.excel_download)
                        ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                            key: 3,
                            unelevated: "",
                            dense: "",
                            "no-caps": "",
                            class: "qgrid__export-btn bg-grey-2 text-grey-9 q-mr-sm",
                            icon: _ctx.mergedIcons.excel,
                            "aria-label": _ctx.mergedLabels.exportExcel,
                            onClick: _cache[4] || (_cache[4] = function ($event) { return (_ctx.exportTable('xlsx')); })
                          }, {
                            default: vue.withCtx(function () { return [
                              vue.createVNode(_component_q_tooltip, {
                                disable: _ctx.$q.platform.is.mobile
                              }, {
                                default: vue.withCtx(function () { return [
                                  vue.createTextVNode(vue.toDisplayString(_ctx.mergedLabels.exportExcel), 1)
                                ]; }),
                                _: 1
                              }, 8, ["disable"])
                            ]; }),
                            _: 1
                          }, 8, ["icon", "aria-label"]))
                        : vue.createCommentVNode("", true),
                      (_ctx.csv_download)
                        ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                            key: 4,
                            unelevated: "",
                            dense: "",
                            "no-caps": "",
                            class: "qgrid__export-btn bg-primary text-white",
                            icon: _ctx.mergedIcons.csv,
                            "aria-label": _ctx.mergedLabels.exportCsv,
                            onClick: _cache[5] || (_cache[5] = function ($event) { return (_ctx.exportTable('csv')); })
                          }, {
                            default: vue.withCtx(function () { return [
                              vue.createVNode(_component_q_tooltip, {
                                disable: _ctx.$q.platform.is.mobile
                              }, {
                                default: vue.withCtx(function () { return [
                                  vue.createTextVNode(vue.toDisplayString(_ctx.mergedLabels.exportCsv), 1)
                                ]; }),
                                _: 1
                              }, 8, ["disable"])
                            ]; }),
                            _: 1
                          }, 8, ["icon", "aria-label"]))
                        : vue.createCommentVNode("", true),
                      (_ctx.column_chooser)
                        ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                            key: 5,
                            flat: "",
                            round: "",
                            dense: "",
                            class: "q-ml-sm",
                            icon: _ctx.mergedIcons.columns,
                            "aria-label": _ctx.mergedLabels.columns
                          }, {
                            default: vue.withCtx(function () { return [
                              vue.createVNode(_component_q_tooltip, {
                                disable: _ctx.$q.platform.is.mobile
                              }, {
                                default: vue.withCtx(function () { return [
                                  vue.createTextVNode(vue.toDisplayString(_ctx.mergedLabels.columns), 1)
                                ]; }),
                                _: 1
                              }, 8, ["disable"]),
                              vue.createVNode(_component_q_menu, {
                                anchor: "bottom right",
                                self: "top right"
                              }, {
                                default: vue.withCtx(function () { return [
                                  vue.createVNode(_component_q_list, {
                                    dense: "",
                                    class: "qgrid__menu",
                                    dark: _ctx.dark
                                  }, {
                                    default: vue.withCtx(function () { return [
                                      vue.createVNode(_component_q_item_label, {
                                        header: "",
                                        class: "qgrid__menu-title"
                                      }, {
                                        default: vue.withCtx(function () { return [
                                          vue.createTextVNode(vue.toDisplayString(_ctx.mergedLabels.columns), 1)
                                        ]; }),
                                        _: 1
                                      }),
                                      (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.orderedColumns, function (col) {
                                        return (vue.openBlock(), vue.createBlock(_component_q_item, {
                                          key: col.name,
                                          tag: "label",
                                          dense: "",
                                          disable: col.required === true,
                                          class: "qgrid__menu-item"
                                        }, {
                                          default: vue.withCtx(function () { return [
                                            vue.createVNode(_component_q_item_section, { side: "" }, {
                                              default: vue.withCtx(function () { return [
                                                vue.createVNode(_component_q_checkbox, {
                                                  dense: "",
                                                  "model-value": _ctx.isColumnVisible(col),
                                                  disable: col.required === true,
                                                  "onUpdate:modelValue": function ($event) { return (_ctx.toggleColumn(col)); }
                                                }, null, 8, ["model-value", "disable", "onUpdate:modelValue"])
                                              ]; }),
                                              _: 2
                                            }, 1024),
                                            vue.createVNode(_component_q_item_section, null, {
                                              default: vue.withCtx(function () { return [
                                                vue.createTextVNode(vue.toDisplayString(col.label), 1)
                                              ]; }),
                                              _: 2
                                            }, 1024)
                                          ]; }),
                                          _: 2
                                        }, 1032, ["disable"]))
                                      }), 128)),
                                      vue.createVNode(_component_q_separator, { dark: _ctx.dark }, null, 8, ["dark"]),
                                      vue.createVNode(_component_q_item, {
                                        clickable: "",
                                        dense: "",
                                        class: "text-primary",
                                        onClick: _ctx.showAllColumns
                                      }, {
                                        default: vue.withCtx(function () { return [
                                          vue.createVNode(_component_q_item_section, null, {
                                            default: vue.withCtx(function () { return [
                                              vue.createTextVNode(vue.toDisplayString(_ctx.mergedLabels.showAllColumns), 1)
                                            ]; }),
                                            _: 1
                                          })
                                        ]; }),
                                        _: 1
                                      }, 8, ["onClick"])
                                    ]; }),
                                    _: 1
                                  }, 8, ["dark"])
                                ]; }),
                                _: 1
                              })
                            ]; }),
                            _: 1
                          }, 8, ["icon", "aria-label"]))
                        : vue.createCommentVNode("", true),
                      (_ctx.fullscreen)
                        ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                            key: 6,
                            flat: "",
                            round: "",
                            dense: "",
                            class: "q-ml-sm",
                            icon: props.inFullscreen ? _ctx.mergedIcons.fullscreenExit : _ctx.mergedIcons.fullscreen,
                            "aria-label": props.inFullscreen ? _ctx.mergedLabels.exitFullscreen : _ctx.mergedLabels.fullscreen,
                            onClick: props.toggleFullscreen
                          }, {
                            default: vue.withCtx(function () { return [
                              vue.withDirectives((vue.openBlock(), vue.createBlock(_component_q_tooltip, {
                                disable: _ctx.$q.platform.is.mobile
                              }, {
                                default: vue.withCtx(function () { return [
                                  vue.createTextVNode(vue.toDisplayString(props.inFullscreen ? _ctx.mergedLabels.exitFullscreen : _ctx.mergedLabels.fullscreen), 1)
                                ]; }),
                                _: 2
                              }, 1032, ["disable"])), [
                                [_directive_close_popup]
                              ])
                            ]; }),
                            _: 2
                          }, 1032, ["icon", "aria-label", "onClick"]))
                        : vue.createCommentVNode("", true),
                      (_ctx.columns_filter && _ctx.columns_filter_toggle)
                        ? (vue.openBlock(), vue.createBlock(_component_q_btn, {
                            key: 7,
                            flat: "",
                            round: "",
                            dense: "",
                            class: "q-ml-sm",
                            icon: _ctx.showFilterRow ? _ctx.mergedIcons.filterRowOff : _ctx.mergedIcons.filterRowOn,
                            "aria-label": _ctx.showFilterRow ? _ctx.mergedLabels.hideFilters : _ctx.mergedLabels.showFilters,
                            onClick: _ctx.toggleFilterRow
                          }, {
                            default: vue.withCtx(function () { return [
                              vue.withDirectives((vue.openBlock(), vue.createBlock(_component_q_tooltip, {
                                disable: _ctx.$q.platform.is.mobile
                              }, {
                                default: vue.withCtx(function () { return [
                                  vue.createTextVNode(vue.toDisplayString(_ctx.showFilterRow ? _ctx.mergedLabels.hideFilters : _ctx.mergedLabels.showFilters), 1)
                                ]; }),
                                _: 1
                              }, 8, ["disable"])), [
                                [_directive_close_popup]
                              ])
                            ]; }),
                            _: 1
                          }, 8, ["icon", "aria-label", "onClick"]))
                        : vue.createCommentVNode("", true)
                    ]))
              ]; }),
              key: "0"
            }
          : undefined,
        (_ctx.hasAggregates && !_ctx.isGrouped && !_ctx.$slots['bottom-row'])
          ? {
              name: "bottom-row",
              fn: vue.withCtx(function (props) { return [
                vue.createVNode(_component_q_tr, { class: "qgrid__static-row qgrid__aggregate-row ignore-elements" }, {
                  default: vue.withCtx(function () { return [
                    (_ctx.selectionMode !== 'none')
                      ? (vue.openBlock(), vue.createBlock(_component_q_td, {
                          key: 0,
                          "auto-width": ""
                        }))
                      : vue.createCommentVNode("", true),
                    (_ctx.hasDetailSlot && !_ctx.isGrouped)
                      ? (vue.openBlock(), vue.createBlock(_component_q_td, {
                          key: 1,
                          "auto-width": ""
                        }))
                      : vue.createCommentVNode("", true),
                    (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(props.cols, function (col) {
                      return (vue.openBlock(), vue.createBlock(_component_q_td, {
                        key: col.name,
                        class: vue.normalizeClass('text-' + (col.align || 'right'))
                      }, {
                        default: vue.withCtx(function () { return [
                          (col.aggregate !== void 0)
                            ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
                                vue.createElementVNode("span", _hoisted_10, vue.toDisplayString(_ctx.aggregateLabel(col)), 1),
                                vue.createElementVNode("span", _hoisted_11, vue.toDisplayString(_ctx.aggregateText(col)), 1)
                              ], 64))
                            : vue.createCommentVNode("", true)
                        ]; }),
                        _: 2
                      }, 1032, ["class"]))
                    }), 128))
                  ]; }),
                  _: 2
                }, 1024)
              ]; }),
              key: "1"
            }
          : undefined,
        (_ctx.$slots.loading)
          ? {
              name: "loading",
              fn: vue.withCtx(function () { return [
                vue.renderSlot(_ctx.$slots, "loading")
              ]; }),
              key: "2"
            }
          : undefined,
        vue.renderList(_ctx.forwardedSlots, function (name) {
          return {
            name: name,
            fn: vue.withCtx(function (scope) { return [
              vue.renderSlot(_ctx.$slots, name, vue.normalizeProps(vue.guardReactiveProps(scope || {})))
            ]; })
          }
        })
      ]), 1040, ["id", "loading", "rows", "columns", "row-key", "class", "visible-columns", "separator", "dense", "dark", "flat", "bordered", "square", "selection", "selected", "filter", "onRequest"])
    ], 2))
  }

  script.render = render;

  var name = "quasar-ui-qgrid";
  var version$2 = "1.1.0";
  var author = "pratikpatelpp802@gmail.com";
  var description = "QGrid - a feature-rich data grid for Quasar (Vue 3): column & header filters, grouping, aggregation, drag & drop, inline editing, CSV/Excel export, virtual scroll and more.";
  var license = "MIT";
  var module = "dist/index.esm.js";
  var main = "dist/index.common.js";
  var scripts = {
  	dev: "cd dev && npm run dev",
  	"dev:umd": "npm run build && node build/script.open-umd.js",
  	build: "node build/index.js",
  	"build:js": "node build/script.javascript.js",
  	test: "node --test \"test/*.test.mjs\"",
  	bench: "node test/bench.mjs"
  };
  var funding = {
  	type: "github",
  	url: "https://github.com/sponsors/pratik227"
  };
  var repository = {
  	type: "git",
  	url: "git+https://github.com/pratik227/quasar-qgrid.git",
  	directory: "ui"
  };
  var dependencies = {
  	sortablejs: "^1.15.0"
  };
  var bugs = "https://github.com/pratik227/quasar-qgrid/issues";
  var homepage = "https://next-quasar-qgrid.netlify.app";
  var devDependencies = {
  	"@rollup/plugin-buble": "^0.21.3",
  	"@rollup/plugin-commonjs": "^29.0.3",
  	"@rollup/plugin-json": "^4.0.0",
  	"@rollup/plugin-node-resolve": "^16.0.3",
  	"@rollup/plugin-replace": "^2.4.2",
  	"@vue/compiler-sfc": "^3.4.0",
  	chalk: "^4.1.0",
  	"fs-extra": "^8.1.0",
  	open: "^7.3.0",
  	quasar: "^2.6.6",
  	rollup: "^2.80.0",
  	"rollup-plugin-vue": "^6.0.0",
  	"uglify-js": "^3.13.3"
  };
  var browserslist = [
  	"last 4 Chrome versions",
  	"last 4 Firefox versions",
  	"last 2 Edge versions",
  	"last 4 Safari versions",
  	"last 4 Android versions",
  	"last 4 ChromeAndroid versions",
  	"last 4 FirefoxAndroid versions",
  	"last 4 iOS versions"
  ];
  var pkg = {
  	name: name,
  	version: version$2,
  	author: author,
  	description: description,
  	license: license,
  	module: module,
  	main: main,
  	scripts: scripts,
  	funding: funding,
  	repository: repository,
  	dependencies: dependencies,
  	bugs: bugs,
  	homepage: homepage,
  	devDependencies: devDependencies,
  	browserslist: browserslist
  };

  var version$1 = pkg.version;

  function install (app) {
    app.component(script.name, script);
  }

  var VuePlugin = /*#__PURE__*/Object.freeze({
    __proto__: null,
    version: version$1,
    QGrid: script,
    install: install
  });

  /**!
   * Sortable 1.15.7
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   */
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) { n[e] = r[e]; }
    return n;
  }
  function _arrayWithoutHoles(r) {
    if (Array.isArray(r)) { return _arrayLikeToArray(r); }
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[r] = t, e;
  }
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      var arguments$1 = arguments;

      for (var e = 1; e < arguments.length; e++) {
        var t = arguments$1[e];
        for (var r in t) { ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); }
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function _iterableToArray(r) {
    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) { return Array.from(r); }
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    var arguments$1 = arguments;

    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments$1[r] ? arguments$1[r] : {};
      r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _objectWithoutProperties(e, t) {
    if (null == e) { return {}; }
    var o,
      r,
      i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r = 0; r < n.length; r++) { o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); }
    }
    return i;
  }
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) { return {}; }
    var t = {};
    for (var n in r) { if ({}.hasOwnProperty.call(r, n)) {
      if (-1 !== e.indexOf(n)) { continue; }
      t[n] = r[n];
    } }
    return t;
  }
  function _toConsumableArray(r) {
    return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) { return t; }
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) { return i; }
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) { return _arrayLikeToArray(r, a); }
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  var version = "1.15.7";

  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !! /*@__PURE__*/navigator.userAgent.match(pattern);
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var FireFox = userAgent(/firefox/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);

  var captureMode = {
    capture: false,
    passive: false
  };
  function on(el, event, fn) {
    el.addEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function off(el, event, fn) {
    el.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function matches( /**HTMLElement*/el, /**String*/selector) {
    if (!selector) { return; }
    selector[0] === '>' && (selector = selector.substring(1));
    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector);
        } else if (el.msMatchesSelector) {
          return el.msMatchesSelector(selector);
        } else if (el.webkitMatchesSelector) {
          return el.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }
    return false;
  }
  function getParentOrHost(el) {
    return el.host && el !== document && el.host.nodeType && el.host !== el ? el.host : el.parentNode;
  }
  function closest( /**HTMLElement*/el, /**String*/selector, /**HTMLElement*/ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if (selector != null && (selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
          return el;
        }
        if (el === ctx) { break; }
        /* jshint boss:true */
      } while (el = getParentOrHost(el));
    }
    return null;
  }
  var R_SPACE = /\s+/g;
  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? 'add' : 'remove'](name);
      } else {
        var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
        el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
      }
    }
  }
  function css(el, prop, val) {
    var style = el && el.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, '');
        } else if (el.currentStyle) {
          val = el.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf('webkit') === -1) {
          prop = '-webkit-' + prop;
        }
        style[prop] = val + (typeof val === 'string' ? '' : 'px');
      }
    }
  }
  function matrix(el, selfOnly) {
    var appliedTransforms = '';
    if (typeof el === 'string') {
      appliedTransforms = el;
    } else {
      do {
        var transform = css(el, 'transform');
        if (transform && transform !== 'none') {
          appliedTransforms = transform + ' ' + appliedTransforms;
        }
        /* jshint boss:true */
      } while (!selfOnly && (el = el.parentNode));
    }
    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    /*jshint -W056 */
    return matrixFn && new matrixFn(appliedTransforms);
  }
  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName),
        i = 0,
        n = list.length;
      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }
      return list;
    }
    return [];
  }
  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
    }
  }

  /**
   * Returns the "bounding client rect" of given element
   * @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
   * @param  {[Boolean]} relativeToContainingBlock  Whether the rect should be relative to the containing block of (including) the container
   * @param  {[Boolean]} relativeToNonStaticParent  Whether the rect should be relative to the relative parent of (including) the contaienr
   * @param  {[Boolean]} undoScale                  Whether the container's scale() should be undone
   * @param  {[HTMLElement]} container              The parent the element will be placed in
   * @return {Object}                               The boundingClientRect of el, with specified adjustments
   */
  function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el.getBoundingClientRect && el !== window) { return; }
    var elRect, top, left, bottom, right, height, width;
    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
      // Adjust for translate()
      container = container || el.parentNode;

      // solves #1123 (see: https://stackoverflow.com/a/37953806/6088312)
      // Not needed on <= IE11
      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, 'transform') !== 'none' || relativeToNonStaticParent && css(container, 'position') !== 'static')) {
            var containerRect = container.getBoundingClientRect();

            // Set relative to edges of padding box of container
            top -= containerRect.top + parseInt(css(container, 'border-top-width'));
            left -= containerRect.left + parseInt(css(container, 'border-left-width'));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
          /* jshint boss:true */
        } while (container = container.parentNode);
      }
    }
    if (undoScale && el !== window) {
      // Adjust for scale()
      var elMatrix = matrix(container || el),
        scaleX = elMatrix && elMatrix.a,
        scaleY = elMatrix && elMatrix.d;
      if (elMatrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width;
      }
    }
    return {
      top: top,
      left: left,
      bottom: bottom,
      right: right,
      width: width,
      height: height
    };
  }

  /**
   * Checks if a side of an element is scrolled past a side of its parents
   * @param  {HTMLElement}  el           The element who's side being scrolled out of view is in question
   * @param  {String}       elSide       Side of the element in question ('top', 'left', 'right', 'bottom')
   * @param  {String}       parentSide   Side of the parent in question ('top', 'left', 'right', 'bottom')
   * @return {HTMLElement}               The parent scroll element that the el's side is scrolled past, or null if there is no such element
   */
  function isScrolledPast(el, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el, true),
      elSideVal = getRect(el)[elSide];

    /* jshint boss:true */
    while (parent) {
      var parentSideVal = getRect(parent)[parentSide],
        visible = void 0;
      if (parentSide === 'top' || parentSide === 'left') {
        visible = elSideVal >= parentSideVal;
      } else {
        visible = elSideVal <= parentSideVal;
      }
      if (!visible) { return parent; }
      if (parent === getWindowScrollingElement()) { break; }
      parent = getParentAutoScrollElement(parent, false);
    }
    return false;
  }

  /**
   * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible)
   * and non-draggable elements
   * @param  {HTMLElement} el       The parent element
   * @param  {Number} childNum      The index of the child
   * @param  {Object} options       Parent Sortable's options
   * @return {HTMLElement}          The child at index childNum, or null if not found
   */
  function getChild(el, childNum, options, includeDragEl) {
    var currentChild = 0,
      i = 0,
      children = el.children;
    while (i < children.length) {
      if (children[i].style.display !== 'none' && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }

  /**
   * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
   * @param  {HTMLElement} el       Parent element
   * @param  {selector} selector    Any other elements that should be ignored
   * @return {HTMLElement}          The last child, ignoring ghostEl
   */
  function lastChild(el, selector) {
    var last = el.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }

  /**
   * Returns the index of an element within its parent for a selected set of
   * elements
   * @param  {HTMLElement} el
   * @param  {selector} selector
   * @return {number}
   */
  function index(el, selector) {
    var index = 0;
    if (!el || !el.parentNode) {
      return -1;
    }

    /* jshint boss:true */
    while (el = el.previousElementSibling) {
      if (el.nodeName.toUpperCase() !== 'TEMPLATE' && el !== Sortable.clone && (!selector || matches(el, selector))) {
        index++;
      }
    }
    return index;
  }

  /**
   * Returns the scroll offset of the given element, added with all the scroll offsets of parent elements.
   * The value is returned in real pixels.
   * @param  {HTMLElement} el
   * @return {Array}             Offsets in the format of [left, top]
   */
  function getRelativeScrollOffset(el) {
    var offsetLeft = 0,
      offsetTop = 0,
      winScroller = getWindowScrollingElement();
    if (el) {
      do {
        var elMatrix = matrix(el),
          scaleX = elMatrix.a,
          scaleY = elMatrix.d;
        offsetLeft += el.scrollLeft * scaleX;
        offsetTop += el.scrollTop * scaleY;
      } while (el !== winScroller && (el = el.parentNode));
    }
    return [offsetLeft, offsetTop];
  }

  /**
   * Returns the index of the object within the given array
   * @param  {Array} arr   Array that may or may not hold the object
   * @param  {Object} obj  An object that has a key-value pair unique to and identical to a key-value pair in the object you want to find
   * @return {Number}      The index of the object in the array, or -1
   */
  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i)) { continue; }
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) { return Number(i); }
      }
    }
    return -1;
  }
  function getParentAutoScrollElement(el, includeSelf) {
    // skip to window
    if (!el || !el.getBoundingClientRect) { return getWindowScrollingElement(); }
    var elem = el;
    var gotSelf = false;
    do {
      // we don't need to get elem css if it isn't even overflowing in the first place (performance)
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')) {
          if (!elem.getBoundingClientRect || elem === document.body) { return getWindowScrollingElement(); }
          if (gotSelf || includeSelf) { return elem; }
          gotSelf = true;
        }
      }
      /* jshint boss:true */
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function extend(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }
    return dst;
  }
  function isRectEqual(rect1, rect2) {
    return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
  }
  var _throttleTimeout;
  function throttle(callback, ms) {
    return function () {
      if (!_throttleTimeout) {
        var args = arguments,
          _this = this;
        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }
        _throttleTimeout = setTimeout(function () {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }
  function cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0;
  }
  function scrollBy(el, x, y) {
    el.scrollLeft += x;
    el.scrollTop += y;
  }
  function clone(el) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el).cloneNode(true);
    } else if ($) {
      return $(el).clone(true)[0];
    } else {
      return el.cloneNode(true);
    }
  }
  function setRect(el, rect) {
    css(el, 'position', 'absolute');
    css(el, 'top', rect.top);
    css(el, 'left', rect.left);
    css(el, 'width', rect.width);
    css(el, 'height', rect.height);
  }
  function unsetRect(el) {
    css(el, 'position', '');
    css(el, 'top', '');
    css(el, 'left', '');
    css(el, 'width', '');
    css(el, 'height', '');
  }
  function getChildContainingRectFromElement(container, options, ghostEl) {
    var rect = {};
    Array.from(container.children).forEach(function (child) {
      var _rect$left, _rect$top, _rect$right, _rect$bottom;
      if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl) { return; }
      var childRect = getRect(child);
      rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
      rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
      rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
      rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
    });
    rect.width = rect.right - rect.left;
    rect.height = rect.bottom - rect.top;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  var expando = 'Sortable' + new Date().getTime();

  function AnimationStateManager() {
    var animationStates = [],
      animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation) { return; }
        var children = [].slice.call(this.el.children);
        children.forEach(function (child) {
          if (css(child, 'display') === 'none' || child === Sortable.ghost) { return; }
          animationStates.push({
            target: child,
            rect: getRect(child)
          });
          var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);

          // If animating: compensate for current animation
          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);
            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }
          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(indexOfObject(animationStates, {
          target: target
        }), 1);
      },
      animateAll: function animateAll(callback) {
        var _this = this;
        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === 'function') { callback(); }
          return;
        }
        var animating = false,
          animationTime = 0;
        animationStates.forEach(function (state) {
          var time = 0,
            target = state.target,
            fromRect = target.fromRect,
            toRect = getRect(target),
            prevFromRect = target.prevFromRect,
            prevToRect = target.prevToRect,
            animatingRect = state.rect,
            targetMatrix = matrix(target, true);
          if (targetMatrix) {
            // Compensate for current animation
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }
          target.toRect = toRect;
          if (target.thisAnimationDuration) {
            // Could also check if animatingRect is between fromRect and toRect
            if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) &&
            // Make sure animatingRect is on line between toRect & fromRect
            (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
              // If returning to same place as started from animation and on same axis
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          }

          // if fromRect != toRect: animate
          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;
            if (!time) {
              time = _this.options.animation;
            }
            _this.animate(target, animatingRect, toRect, time);
          }
          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function () {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);
        if (!animating) {
          if (typeof callback === 'function') { callback(); }
        } else {
          animationCallbackId = setTimeout(function () {
            if (typeof callback === 'function') { callback(); }
          }, animationTime);
        }
        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, 'transition', '');
          css(target, 'transform', '');
          var elMatrix = matrix(this.el),
            scaleX = elMatrix && elMatrix.a,
            scaleY = elMatrix && elMatrix.d,
            translateX = (currentRect.left - toRect.left) / (scaleX || 1),
            translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, 'transform', 'translate3d(' + translateX + 'px,' + translateY + 'px,0)');
          this.forRepaintDummy = repaint(target); // repaint

          css(target, 'transition', 'transform ' + duration + 'ms' + (this.options.easing ? ' ' + this.options.easing : ''));
          css(target, 'transform', 'translate3d(0,0,0)');
          typeof target.animated === 'number' && clearTimeout(target.animated);
          target.animated = setTimeout(function () {
            css(target, 'transition', '');
            css(target, 'transform', '');
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      }
    };
  }
  function repaint(target) {
    return target.offsetWidth;
  }
  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
  }

  var plugins = [];
  var defaults = {
    initializeByDefault: true
  };
  var PluginManager = {
    mount: function mount(plugin) {
      // Set default static properties
      for (var option in defaults) {
        if (defaults.hasOwnProperty(option) && !(option in plugin)) {
          plugin[option] = defaults[option];
        }
      }
      plugins.forEach(function (p) {
        if (p.pluginName === plugin.pluginName) {
          throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
        }
      });
      plugins.push(plugin);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;
      this.eventCanceled = false;
      evt.cancel = function () {
        _this.eventCanceled = true;
      };
      var eventNameGlobal = eventName + 'Global';
      plugins.forEach(function (plugin) {
        if (!sortable[plugin.pluginName]) { return; }
        // Fire global events if it exists in this sortable
        if (sortable[plugin.pluginName][eventNameGlobal]) {
          sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
            sortable: sortable
          }, evt));
        }

        // Only fire plugin event if plugin is enabled in this sortable,
        // and plugin has event defined
        if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
          sortable[plugin.pluginName][eventName](_objectSpread2({
            sortable: sortable
          }, evt));
        }
      });
    },
    initializePlugins: function initializePlugins(sortable, el, defaults, options) {
      plugins.forEach(function (plugin) {
        var pluginName = plugin.pluginName;
        if (!sortable.options[pluginName] && !plugin.initializeByDefault) { return; }
        var initialized = new plugin(sortable, el, sortable.options);
        initialized.sortable = sortable;
        initialized.options = sortable.options;
        sortable[pluginName] = initialized;

        // Add default options from plugin
        _extends(defaults, initialized.defaults);
      });
      for (var option in sortable.options) {
        if (!sortable.options.hasOwnProperty(option)) { continue; }
        var modified = this.modifyOption(sortable, option, sortable.options[option]);
        if (typeof modified !== 'undefined') {
          sortable.options[option] = modified;
        }
      }
    },
    getEventProperties: function getEventProperties(name, sortable) {
      var eventProperties = {};
      plugins.forEach(function (plugin) {
        if (typeof plugin.eventProperties !== 'function') { return; }
        _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
      });
      return eventProperties;
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function (plugin) {
        // Plugin must exist on the Sortable
        if (!sortable[plugin.pluginName]) { return; }

        // If static option listener exists for this option, call in the context of the Sortable's instance of this plugin
        if (plugin.optionListeners && typeof plugin.optionListeners[name] === 'function') {
          modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
        }
      });
      return modifiedValue;
    }
  };

  function dispatchEvent(_ref) {
    var sortable = _ref.sortable,
      rootEl = _ref.rootEl,
      name = _ref.name,
      targetEl = _ref.targetEl,
      cloneEl = _ref.cloneEl,
      toEl = _ref.toEl,
      fromEl = _ref.fromEl,
      oldIndex = _ref.oldIndex,
      newIndex = _ref.newIndex,
      oldDraggableIndex = _ref.oldDraggableIndex,
      newDraggableIndex = _ref.newDraggableIndex,
      originalEvent = _ref.originalEvent,
      putSortable = _ref.putSortable,
      extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || rootEl && rootEl[expando];
    if (!sortable) { return; }
    var evt,
      options = sortable.options,
      onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);
    // Support for new CustomEvent feature
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent(name, true, true);
    }
    evt.to = toEl || rootEl;
    evt.from = fromEl || rootEl;
    evt.item = targetEl || rootEl;
    evt.clone = cloneEl;
    evt.oldIndex = oldIndex;
    evt.newIndex = newIndex;
    evt.oldDraggableIndex = oldDraggableIndex;
    evt.newDraggableIndex = newDraggableIndex;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable ? putSortable.lastPutMode : undefined;
    var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
    for (var option in allEventProperties) {
      evt[option] = allEventProperties[option];
    }
    if (rootEl) {
      rootEl.dispatchEvent(evt);
    }
    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }

  var _excluded = ["evt"];
  var pluginEvent = function pluginEvent(eventName, sortable) {
    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      originalEvent = _ref.evt,
      data = _objectWithoutProperties(_ref, _excluded);
    PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
      dragEl: dragEl,
      parentEl: parentEl,
      ghostEl: ghostEl,
      rootEl: rootEl,
      nextEl: nextEl,
      lastDownEl: lastDownEl,
      cloneEl: cloneEl,
      cloneHidden: cloneHidden,
      dragStarted: moved,
      putSortable: putSortable,
      activeSortable: Sortable.active,
      originalEvent: originalEvent,
      oldIndex: oldIndex,
      oldDraggableIndex: oldDraggableIndex,
      newIndex: newIndex,
      newDraggableIndex: newDraggableIndex,
      hideGhostForTarget: _hideGhostForTarget,
      unhideGhostForTarget: _unhideGhostForTarget,
      cloneNowHidden: function cloneNowHidden() {
        cloneHidden = true;
      },
      cloneNowShown: function cloneNowShown() {
        cloneHidden = false;
      },
      dispatchSortableEvent: function dispatchSortableEvent(name) {
        _dispatchEvent({
          sortable: sortable,
          name: name,
          originalEvent: originalEvent
        });
      }
    }, data));
  };
  function _dispatchEvent(info) {
    dispatchEvent(_objectSpread2({
      putSortable: putSortable,
      cloneEl: cloneEl,
      targetEl: dragEl,
      rootEl: rootEl,
      oldIndex: oldIndex,
      oldDraggableIndex: oldDraggableIndex,
      newIndex: newIndex,
      newDraggableIndex: newDraggableIndex
    }, info));
  }
  var dragEl,
    parentEl,
    ghostEl,
    rootEl,
    nextEl,
    lastDownEl,
    cloneEl,
    cloneHidden,
    oldIndex,
    newIndex,
    oldDraggableIndex,
    newDraggableIndex,
    activeGroup,
    putSortable,
    awaitingDragStarted = false,
    ignoreNextClick = false,
    sortables = [],
    tapEvt,
    touchEvt,
    lastDx,
    lastDy,
    tapDistanceLeft,
    tapDistanceTop,
    moved,
    lastTarget,
    lastDirection,
    pastFirstInvertThresh = false,
    isCircumstantialInvert = false,
    targetMoveDistance,
    // For positioning ghost absolutely
    ghostRelativeParent,
    ghostRelativeParentInitialScroll = [],
    // (left, top)

    _silent = false,
    savedInputChecked = [];

  /** @const */
  var documentExists = typeof document !== 'undefined',
    PositionGhostAbsolutely = IOS,
    CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float',
    // This will not pass for IE9, because IE9 DnD only works on anchors
    supportDraggable = documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div'),
    supportCssPointerEvents = function () {
      if (!documentExists) { return; }
      // false when <= IE11
      if (IE11OrLess) {
        return false;
      }
      var el = document.createElement('x');
      el.style.cssText = 'pointer-events:auto';
      return el.style.pointerEvents === 'auto';
    }(),
    _detectDirection = function _detectDirection(el, options) {
      var elCSS = css(el),
        elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth),
        child1 = getChild(el, 0, options),
        child2 = getChild(el, 1, options),
        firstChildCSS = child1 && css(child1),
        secondChildCSS = child2 && css(child2),
        firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width,
        secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
      if (elCSS.display === 'flex') {
        return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse' ? 'vertical' : 'horizontal';
      }
      if (elCSS.display === 'grid') {
        return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
      }
      if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== 'none') {
        var touchingSideChild2 = firstChildCSS["float"] === 'left' ? 'left' : 'right';
        return child2 && (secondChildCSS.clear === 'both' || secondChildCSS.clear === touchingSideChild2) ? 'vertical' : 'horizontal';
      }
      return child1 && (firstChildCSS.display === 'block' || firstChildCSS.display === 'flex' || firstChildCSS.display === 'table' || firstChildCSS.display === 'grid' || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === 'none' || child2 && elCSS[CSSFloatProperty] === 'none' && firstChildWidth + secondChildWidth > elWidth) ? 'vertical' : 'horizontal';
    },
    _dragElInRowColumn = function _dragElInRowColumn(dragRect, targetRect, vertical) {
      var dragElS1Opp = vertical ? dragRect.left : dragRect.top,
        dragElS2Opp = vertical ? dragRect.right : dragRect.bottom,
        dragElOppLength = vertical ? dragRect.width : dragRect.height,
        targetS1Opp = vertical ? targetRect.left : targetRect.top,
        targetS2Opp = vertical ? targetRect.right : targetRect.bottom,
        targetOppLength = vertical ? targetRect.width : targetRect.height;
      return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
    },
    /**
     * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
     * @param  {Number} x      X position
     * @param  {Number} y      Y position
     * @return {HTMLElement}   Element of the first found nearest Sortable
     */
    _detectNearestEmptySortable = function _detectNearestEmptySortable(x, y) {
      var ret;
      sortables.some(function (sortable) {
        var threshold = sortable[expando].options.emptyInsertThreshold;
        if (!threshold || lastChild(sortable)) { return; }
        var rect = getRect(sortable),
          insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
          insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
        if (insideHorizontally && insideVertically) {
          return ret = sortable;
        }
      });
      return ret;
    },
    _prepareGroup = function _prepareGroup(options) {
      function toFn(value, pull) {
        return function (to, from, dragEl, evt) {
          var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
          if (value == null && (pull || sameGroup)) {
            // Default pull value
            // Default pull and put value if same group
            return true;
          } else if (value == null || value === false) {
            return false;
          } else if (pull && value === 'clone') {
            return value;
          } else if (typeof value === 'function') {
            return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt);
          } else {
            var otherGroup = (pull ? to : from).options.group.name;
            return value === true || typeof value === 'string' && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
          }
        };
      }
      var group = {};
      var originalGroup = options.group;
      if (!originalGroup || _typeof(originalGroup) != 'object') {
        originalGroup = {
          name: originalGroup
        };
      }
      group.name = originalGroup.name;
      group.checkPull = toFn(originalGroup.pull, true);
      group.checkPut = toFn(originalGroup.put);
      group.revertClone = originalGroup.revertClone;
      options.group = group;
    },
    _hideGhostForTarget = function _hideGhostForTarget() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, 'display', 'none');
      }
    },
    _unhideGhostForTarget = function _unhideGhostForTarget() {
      if (!supportCssPointerEvents && ghostEl) {
        css(ghostEl, 'display', '');
      }
    };

  // #1184 fix - Prevent click event on fallback if dragged but item not changed position
  if (documentExists && !ChromeForAndroid) {
    document.addEventListener('click', function (evt) {
      if (ignoreNextClick) {
        evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.stopImmediatePropagation && evt.stopImmediatePropagation();
        ignoreNextClick = false;
        return false;
      }
    }, true);
  }
  var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;
      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
      if (nearest) {
        // Create imitation event
        var event = {};
        for (var i in evt) {
          if (evt.hasOwnProperty(i)) {
            event[i] = evt[i];
          }
        }
        event.target = event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;
        nearest[expando]._onDragOver(event);
      }
    }
  };
  var _checkOutsideTargetEl = function _checkOutsideTargetEl(evt) {
    if (dragEl) {
      dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    }
  };

  /**
   * @class  Sortable
   * @param  {HTMLElement}  el
   * @param  {Object}       [options]
   */
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    this.el = el; // root element
    this.options = options = _extends({}, options);

    // Export instance
    el[expando] = this;
    var defaults = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el.nodeName) ? '>li' : '>*',
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el, this.options);
      },
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      ignore: 'a, img',
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl) {
        dataTransfer.setData('Text', dragEl.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: 'data-id',
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: 'sortable-fallback',
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0
      },
      // Disabled on Safari: #1571; Enabled on Safari IOS: #2244
      supportPointer: Sortable.supportPointer !== false && 'PointerEvent' in window && (!Safari || IOS),
      emptyInsertThreshold: 5
    };
    PluginManager.initializePlugins(this, el, defaults);

    // Set default options
    for (var name in defaults) {
      !(name in options) && (options[name] = defaults[name]);
    }
    _prepareGroup(options);

    // Bind all private methods
    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }

    // Setup drag mode
    this.nativeDraggable = options.forceFallback ? false : supportDraggable;
    if (this.nativeDraggable) {
      // Touch start threshold cannot be greater than the native dragstart threshold
      this.options.touchStartThreshold = 1;
    }

    // Bind events
    if (options.supportPointer) {
      on(el, 'pointerdown', this._onTapStart);
    } else {
      on(el, 'mousedown', this._onTapStart);
      on(el, 'touchstart', this._onTapStart);
    }
    if (this.nativeDraggable) {
      on(el, 'dragover', this);
      on(el, 'dragenter', this);
    }
    sortables.push(this.el);

    // Restore sorting
    options.store && options.store.get && this.sort(options.store.get(this) || []);

    // Add animation state manager
    _extends(this, AnimationStateManager());
  }
  Sortable.prototype = /** @lends Sortable.prototype */{
    constructor: Sortable,
    _isOutsideThisEl: function _isOutsideThisEl(target) {
      if (!this.el.contains(target) && target !== this.el) {
        lastTarget = null;
      }
    },
    _getDirection: function _getDirection(evt, target) {
      return typeof this.options.direction === 'function' ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
    },
    _onTapStart: function _onTapStart( /** Event|TouchEvent */evt) {
      if (!evt.cancelable) { return; }
      var _this = this,
        el = this.el,
        options = this.options,
        preventOnFilter = options.preventOnFilter,
        type = evt.type,
        touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt,
        target = (touch || evt).target,
        originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target,
        filter = options.filter;
      _saveInputCheckedState(el);

      // Don't trigger start event when an element is been dragged, otherwise the evt.oldindex always wrong when set option.group.
      if (dragEl) {
        return;
      }
      if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
        return; // only left button and enabled
      }

      // cancel dnd if original target is content editable
      if (originalTarget.isContentEditable) {
        return;
      }

      // Safari ignores further event handling after mousedown
      if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') {
        return;
      }
      target = closest(target, options.draggable, el, false);
      if (target && target.animated) {
        return;
      }
      if (lastDownEl === target) {
        // Ignoring duplicate `down`
        return;
      }

      // Get the index of the dragged element within its parent
      oldIndex = index(target);
      oldDraggableIndex = index(target, options.draggable);

      // Check filter
      if (typeof filter === 'function') {
        if (filter.call(this, evt, target, this)) {
          _dispatchEvent({
            sortable: _this,
            rootEl: originalTarget,
            name: 'filter',
            targetEl: target,
            toEl: el,
            fromEl: el
          });
          pluginEvent('filter', _this, {
            evt: evt
          });
          preventOnFilter && evt.preventDefault();
          return; // cancel dnd
        }
      } else if (filter) {
        filter = filter.split(',').some(function (criteria) {
          criteria = closest(originalTarget, criteria.trim(), el, false);
          if (criteria) {
            _dispatchEvent({
              sortable: _this,
              rootEl: criteria,
              name: 'filter',
              targetEl: target,
              fromEl: el,
              toEl: el
            });
            pluginEvent('filter', _this, {
              evt: evt
            });
            return true;
          }
        });
        if (filter) {
          preventOnFilter && evt.preventDefault();
          return; // cancel dnd
        }
      }
      if (options.handle && !closest(originalTarget, options.handle, el, false)) {
        return;
      }

      // Prepare `dragstart`
      this._prepareDragStart(evt, touch, target);
    },
    _prepareDragStart: function _prepareDragStart( /** Event */evt, /** Touch */touch, /** HTMLElement */target) {
      var _this = this,
        el = _this.el,
        options = _this.options,
        ownerDocument = el.ownerDocument,
        dragStartFn;
      if (target && !dragEl && target.parentNode === el) {
        var dragRect = getRect(target);
        rootEl = el;
        dragEl = target;
        parentEl = dragEl.parentNode;
        nextEl = dragEl.nextSibling;
        lastDownEl = target;
        activeGroup = options.group;
        Sortable.dragged = dragEl;
        tapEvt = {
          target: dragEl,
          clientX: (touch || evt).clientX,
          clientY: (touch || evt).clientY
        };
        tapDistanceLeft = tapEvt.clientX - dragRect.left;
        tapDistanceTop = tapEvt.clientY - dragRect.top;
        this._lastX = (touch || evt).clientX;
        this._lastY = (touch || evt).clientY;
        dragEl.style['will-change'] = 'all';
        dragStartFn = function dragStartFn() {
          pluginEvent('delayEnded', _this, {
            evt: evt
          });
          if (Sortable.eventCanceled) {
            _this._onDrop();
            return;
          }
          // Delayed drag has been triggered
          // we can re-enable the events: touchmove/mousemove
          _this._disableDelayedDragEvents();
          if (!FireFox && _this.nativeDraggable) {
            dragEl.draggable = true;
          }

          // Bind the events: dragstart/dragend
          _this._triggerDragStart(evt, touch);

          // Drag start event
          _dispatchEvent({
            sortable: _this,
            name: 'choose',
            originalEvent: evt
          });

          // Chosen item
          toggleClass(dragEl, options.chosenClass, true);
        };

        // Disable "draggable"
        options.ignore.split(',').forEach(function (criteria) {
          find(dragEl, criteria.trim(), _disableDraggable);
        });
        on(ownerDocument, 'dragover', nearestEmptyInsertDetectEvent);
        on(ownerDocument, 'mousemove', nearestEmptyInsertDetectEvent);
        on(ownerDocument, 'touchmove', nearestEmptyInsertDetectEvent);
        if (options.supportPointer) {
          on(ownerDocument, 'pointerup', _this._onDrop);
          // Native D&D triggers pointercancel
          !this.nativeDraggable && on(ownerDocument, 'pointercancel', _this._onDrop);
        } else {
          on(ownerDocument, 'mouseup', _this._onDrop);
          on(ownerDocument, 'touchend', _this._onDrop);
          on(ownerDocument, 'touchcancel', _this._onDrop);
        }

        // Make dragEl draggable (must be before delay for FireFox)
        if (FireFox && this.nativeDraggable) {
          this.options.touchStartThreshold = 4;
          dragEl.draggable = true;
        }
        pluginEvent('delayStart', this, {
          evt: evt
        });

        // Delay is impossible for native DnD in Edge or IE
        if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
          if (Sortable.eventCanceled) {
            this._onDrop();
            return;
          }
          // If the user moves the pointer or let go the click or touch
          // before the delay has been reached:
          // disable the delayed drag
          if (options.supportPointer) {
            on(ownerDocument, 'pointerup', _this._disableDelayedDrag);
            on(ownerDocument, 'pointercancel', _this._disableDelayedDrag);
          } else {
            on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
            on(ownerDocument, 'touchend', _this._disableDelayedDrag);
            on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
          }
          on(ownerDocument, 'mousemove', _this._delayedDragTouchMoveHandler);
          on(ownerDocument, 'touchmove', _this._delayedDragTouchMoveHandler);
          options.supportPointer && on(ownerDocument, 'pointermove', _this._delayedDragTouchMoveHandler);
          _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
        } else {
          dragStartFn();
        }
      }
    },
    _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler( /** TouchEvent|PointerEvent **/e) {
      var touch = e.touches ? e.touches[0] : e;
      if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
        this._disableDelayedDrag();
      }
    },
    _disableDelayedDrag: function _disableDelayedDrag() {
      dragEl && _disableDraggable(dragEl);
      clearTimeout(this._dragStartTimer);
      this._disableDelayedDragEvents();
    },
    _disableDelayedDragEvents: function _disableDelayedDragEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, 'mouseup', this._disableDelayedDrag);
      off(ownerDocument, 'touchend', this._disableDelayedDrag);
      off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
      off(ownerDocument, 'pointerup', this._disableDelayedDrag);
      off(ownerDocument, 'pointercancel', this._disableDelayedDrag);
      off(ownerDocument, 'mousemove', this._delayedDragTouchMoveHandler);
      off(ownerDocument, 'touchmove', this._delayedDragTouchMoveHandler);
      off(ownerDocument, 'pointermove', this._delayedDragTouchMoveHandler);
    },
    _triggerDragStart: function _triggerDragStart( /** Event */evt, /** Touch */touch) {
      touch = touch || evt.pointerType == 'touch' && evt;
      if (!this.nativeDraggable || touch) {
        if (this.options.supportPointer) {
          on(document, 'pointermove', this._onTouchMove);
        } else if (touch) {
          on(document, 'touchmove', this._onTouchMove);
        } else {
          on(document, 'mousemove', this._onTouchMove);
        }
      } else {
        on(dragEl, 'dragend', this);
        on(rootEl, 'dragstart', this._onDragStart);
      }
      try {
        if (document.selection) {
          _nextTick(function () {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (err) {}
    },
    _dragStarted: function _dragStarted(fallback, evt) {
      awaitingDragStarted = false;
      if (rootEl && dragEl) {
        pluginEvent('dragStarted', this, {
          evt: evt
        });
        if (this.nativeDraggable) {
          on(document, 'dragover', _checkOutsideTargetEl);
        }
        var options = this.options;

        // Apply effect
        !fallback && toggleClass(dragEl, options.dragClass, false);
        toggleClass(dragEl, options.ghostClass, true);
        Sortable.active = this;
        fallback && this._appendGhost();

        // Drag start event
        _dispatchEvent({
          sortable: this,
          name: 'start',
          originalEvent: evt
        });
      } else {
        this._nulling();
      }
    },
    _emulateDragOver: function _emulateDragOver() {
      if (touchEvt) {
        this._lastX = touchEvt.clientX;
        this._lastY = touchEvt.clientY;
        _hideGhostForTarget();
        var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        var parent = target;
        while (target && target.shadowRoot) {
          target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          if (target === parent) { break; }
          parent = target;
        }
        dragEl.parentNode[expando]._isOutsideThisEl(target);
        if (parent) {
          do {
            if (parent[expando]) {
              var inserted = void 0;
              inserted = parent[expando]._onDragOver({
                clientX: touchEvt.clientX,
                clientY: touchEvt.clientY,
                target: target,
                rootEl: parent
              });
              if (inserted && !this.options.dragoverBubble) {
                break;
              }
            }
            target = parent; // store last element
          }
          /* jshint boss:true */ while (parent = getParentOrHost(parent));
        }
        _unhideGhostForTarget();
      }
    },
    _onTouchMove: function _onTouchMove( /**TouchEvent*/evt) {
      if (tapEvt) {
        var options = this.options,
          fallbackTolerance = options.fallbackTolerance,
          fallbackOffset = options.fallbackOffset,
          touch = evt.touches ? evt.touches[0] : evt,
          ghostMatrix = ghostEl && matrix(ghostEl, true),
          scaleX = ghostEl && ghostMatrix && ghostMatrix.a,
          scaleY = ghostEl && ghostMatrix && ghostMatrix.d,
          relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent),
          dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1),
          dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);

        // only set the status to dragging, when we are actually dragging
        if (!Sortable.active && !awaitingDragStarted) {
          if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
            return;
          }
          this._onDragStart(evt, true);
        }
        if (ghostEl) {
          if (ghostMatrix) {
            ghostMatrix.e += dx - (lastDx || 0);
            ghostMatrix.f += dy - (lastDy || 0);
          } else {
            ghostMatrix = {
              a: 1,
              b: 0,
              c: 0,
              d: 1,
              e: dx,
              f: dy
            };
          }
          var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
          css(ghostEl, 'webkitTransform', cssMatrix);
          css(ghostEl, 'mozTransform', cssMatrix);
          css(ghostEl, 'msTransform', cssMatrix);
          css(ghostEl, 'transform', cssMatrix);
          lastDx = dx;
          lastDy = dy;
          touchEvt = touch;
        }
        evt.cancelable && evt.preventDefault();
      }
    },
    _appendGhost: function _appendGhost() {
      // Bug if using scale(): https://stackoverflow.com/questions/2637058
      // Not being adjusted for
      if (!ghostEl) {
        var container = this.options.fallbackOnBody ? document.body : rootEl,
          rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container),
          options = this.options;

        // Position absolutely
        if (PositionGhostAbsolutely) {
          // Get relatively positioned parent
          ghostRelativeParent = container;
          while (css(ghostRelativeParent, 'position') === 'static' && css(ghostRelativeParent, 'transform') === 'none' && ghostRelativeParent !== document) {
            ghostRelativeParent = ghostRelativeParent.parentNode;
          }
          if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
            if (ghostRelativeParent === document) { ghostRelativeParent = getWindowScrollingElement(); }
            rect.top += ghostRelativeParent.scrollTop;
            rect.left += ghostRelativeParent.scrollLeft;
          } else {
            ghostRelativeParent = getWindowScrollingElement();
          }
          ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
        }
        ghostEl = dragEl.cloneNode(true);
        toggleClass(ghostEl, options.ghostClass, false);
        toggleClass(ghostEl, options.fallbackClass, true);
        toggleClass(ghostEl, options.dragClass, true);
        css(ghostEl, 'transition', '');
        css(ghostEl, 'transform', '');
        css(ghostEl, 'box-sizing', 'border-box');
        css(ghostEl, 'margin', 0);
        css(ghostEl, 'top', rect.top);
        css(ghostEl, 'left', rect.left);
        css(ghostEl, 'width', rect.width);
        css(ghostEl, 'height', rect.height);
        css(ghostEl, 'opacity', '0.8');
        css(ghostEl, 'position', PositionGhostAbsolutely ? 'absolute' : 'fixed');
        css(ghostEl, 'zIndex', '100000');
        css(ghostEl, 'pointerEvents', 'none');
        Sortable.ghost = ghostEl;
        container.appendChild(ghostEl);

        // Set transform-origin
        css(ghostEl, 'transform-origin', tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + '% ' + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + '%');
      }
    },
    _onDragStart: function _onDragStart( /**Event*/evt, /**boolean*/fallback) {
      var _this = this;
      var dataTransfer = evt.dataTransfer;
      var options = _this.options;
      pluginEvent('dragStart', this, {
        evt: evt
      });
      if (Sortable.eventCanceled) {
        this._onDrop();
        return;
      }
      pluginEvent('setupClone', this);
      if (!Sortable.eventCanceled) {
        cloneEl = clone(dragEl);
        cloneEl.removeAttribute("id");
        cloneEl.draggable = false;
        cloneEl.style['will-change'] = '';
        this._hideClone();
        toggleClass(cloneEl, this.options.chosenClass, false);
        Sortable.clone = cloneEl;
      }

      // #1143: IFrame support workaround
      _this.cloneId = _nextTick(function () {
        pluginEvent('clone', _this);
        if (Sortable.eventCanceled) { return; }
        if (!_this.options.removeCloneOnHide) {
          rootEl.insertBefore(cloneEl, dragEl);
        }
        _this._hideClone();
        _dispatchEvent({
          sortable: _this,
          name: 'clone'
        });
      });
      !fallback && toggleClass(dragEl, options.dragClass, true);

      // Set proper drop events
      if (fallback) {
        ignoreNextClick = true;
        _this._loopId = setInterval(_this._emulateDragOver, 50);
      } else {
        // Undo what was set in _prepareDragStart before drag started
        off(document, 'mouseup', _this._onDrop);
        off(document, 'touchend', _this._onDrop);
        off(document, 'touchcancel', _this._onDrop);
        if (dataTransfer) {
          dataTransfer.effectAllowed = 'move';
          options.setData && options.setData.call(_this, dataTransfer, dragEl);
        }
        on(document, 'drop', _this);

        // #1276 fix:
        css(dragEl, 'transform', 'translateZ(0)');
      }
      awaitingDragStarted = true;
      _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
      on(document, 'selectstart', _this);
      moved = true;
      window.getSelection().removeAllRanges();
      if (Safari) {
        css(document.body, 'user-select', 'none');
      }
    },
    // Returns true - if no further action is needed (either inserted or another condition)
    _onDragOver: function _onDragOver( /**Event*/evt) {
      var el = this.el,
        target = evt.target,
        dragRect,
        targetRect,
        revert,
        options = this.options,
        group = options.group,
        activeSortable = Sortable.active,
        isOwner = activeGroup === group,
        canSort = options.sort,
        fromSortable = putSortable || activeSortable,
        vertical,
        _this = this,
        completedFired = false;
      if (_silent) { return; }
      function dragOverEvent(name, extra) {
        pluginEvent(name, _this, _objectSpread2({
          evt: evt,
          isOwner: isOwner,
          axis: vertical ? 'vertical' : 'horizontal',
          revert: revert,
          dragRect: dragRect,
          targetRect: targetRect,
          canSort: canSort,
          fromSortable: fromSortable,
          target: target,
          completed: completed,
          onMove: function onMove(target, after) {
            return _onMove(rootEl, el, dragEl, dragRect, target, getRect(target), evt, after);
          },
          changed: changed
        }, extra));
      }

      // Capture animation state
      function capture() {
        dragOverEvent('dragOverAnimationCapture');
        _this.captureAnimationState();
        if (_this !== fromSortable) {
          fromSortable.captureAnimationState();
        }
      }

      // Return invocation when dragEl is inserted (or completed)
      function completed(insertion) {
        dragOverEvent('dragOverCompleted', {
          insertion: insertion
        });
        if (insertion) {
          // Clones must be hidden before folding animation to capture dragRectAbsolute properly
          if (isOwner) {
            activeSortable._hideClone();
          } else {
            activeSortable._showClone(_this);
          }
          if (_this !== fromSortable) {
            // Set ghost class to new sortable's ghost class
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
            toggleClass(dragEl, options.ghostClass, true);
          }
          if (putSortable !== _this && _this !== Sortable.active) {
            putSortable = _this;
          } else if (_this === Sortable.active && putSortable) {
            putSortable = null;
          }

          // Animation
          if (fromSortable === _this) {
            _this._ignoreWhileAnimating = target;
          }
          _this.animateAll(function () {
            dragOverEvent('dragOverAnimationComplete');
            _this._ignoreWhileAnimating = null;
          });
          if (_this !== fromSortable) {
            fromSortable.animateAll();
            fromSortable._ignoreWhileAnimating = null;
          }
        }

        // Null lastTarget if it is not inside a previously swapped element
        if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
          lastTarget = null;
        }

        // no bubbling and not fallback
        if (!options.dragoverBubble && !evt.rootEl && target !== document) {
          dragEl.parentNode[expando]._isOutsideThisEl(evt.target);

          // Do not detect for empty insert if already inserted
          !insertion && nearestEmptyInsertDetectEvent(evt);
        }
        !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
        return completedFired = true;
      }

      // Call when dragEl has been inserted
      function changed() {
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        _dispatchEvent({
          sortable: _this,
          name: 'change',
          toEl: el,
          newIndex: newIndex,
          newDraggableIndex: newDraggableIndex,
          originalEvent: evt
        });
      }
      if (evt.preventDefault !== void 0) {
        evt.cancelable && evt.preventDefault();
      }
      target = closest(target, options.draggable, el, true);
      dragOverEvent('dragOver');
      if (Sortable.eventCanceled) { return completedFired; }
      if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
        return completed(false);
      }
      ignoreNextClick = false;
      if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) // Reverting item into the original list
      : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
        vertical = this._getDirection(evt, target) === 'vertical';
        dragRect = getRect(dragEl);
        dragOverEvent('dragOverValid');
        if (Sortable.eventCanceled) { return completedFired; }
        if (revert) {
          parentEl = rootEl; // actualization
          capture();
          this._hideClone();
          dragOverEvent('revert');
          if (!Sortable.eventCanceled) {
            if (nextEl) {
              rootEl.insertBefore(dragEl, nextEl);
            } else {
              rootEl.appendChild(dragEl);
            }
          }
          return completed(true);
        }
        var elLastChild = lastChild(el, options.draggable);
        if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
          // Insert to end of list

          // If already at end of list: Do not insert
          if (elLastChild === dragEl) {
            return completed(false);
          }

          // if there is a last element, it is the target
          if (elLastChild && el === evt.target) {
            target = elLastChild;
          }
          if (target) {
            targetRect = getRect(target);
          }
          if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
            capture();
            if (elLastChild && elLastChild.nextSibling) {
              // the last draggable element is not the last node
              el.insertBefore(dragEl, elLastChild.nextSibling);
            } else {
              el.appendChild(dragEl);
            }
            parentEl = el; // actualization

            changed();
            return completed(true);
          }
        } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
          // Insert to start of list
          var firstChild = getChild(el, 0, options, true);
          if (firstChild === dragEl) {
            return completed(false);
          }
          target = firstChild;
          targetRect = getRect(target);
          if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
            capture();
            el.insertBefore(dragEl, firstChild);
            parentEl = el; // actualization

            changed();
            return completed(true);
          }
        } else if (target.parentNode === el) {
          targetRect = getRect(target);
          var direction = 0,
            targetBeforeFirstSwap,
            differentLevel = dragEl.parentNode !== el,
            differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical),
            side1 = vertical ? 'top' : 'left',
            scrolledPastTop = isScrolledPast(target, 'top', 'top') || isScrolledPast(dragEl, 'top', 'top'),
            scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
          if (lastTarget !== target) {
            targetBeforeFirstSwap = targetRect[side1];
            pastFirstInvertThresh = false;
            isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
          }
          direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
          var sibling;
          if (direction !== 0) {
            // Check if target is beside dragEl in respective direction (ignoring hidden elements)
            var dragIndex = index(dragEl);
            do {
              dragIndex -= direction;
              sibling = parentEl.children[dragIndex];
            } while (sibling && (css(sibling, 'display') === 'none' || sibling === ghostEl));
          }
          // If dragEl is already beside target: Do not insert
          if (direction === 0 || sibling === target) {
            return completed(false);
          }
          lastTarget = target;
          lastDirection = direction;
          var nextSibling = target.nextElementSibling,
            after = false;
          after = direction === 1;
          var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
          if (moveVector !== false) {
            if (moveVector === 1 || moveVector === -1) {
              after = moveVector === 1;
            }
            _silent = true;
            setTimeout(_unsilent, 30);
            capture();
            if (after && !nextSibling) {
              el.appendChild(dragEl);
            } else {
              target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
            }

            // Undo chrome's scroll adjustment (has no effect on other browsers)
            if (scrolledPastTop) {
              scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
            }
            parentEl = dragEl.parentNode; // actualization

            // must be done before animation
            if (targetBeforeFirstSwap !== undefined && !isCircumstantialInvert) {
              targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
            }
            changed();
            return completed(true);
          }
        }
        if (el.contains(dragEl)) {
          return completed(false);
        }
      }
      return false;
    },
    _ignoreWhileAnimating: null,
    _offMoveEvents: function _offMoveEvents() {
      off(document, 'mousemove', this._onTouchMove);
      off(document, 'touchmove', this._onTouchMove);
      off(document, 'pointermove', this._onTouchMove);
      off(document, 'dragover', nearestEmptyInsertDetectEvent);
      off(document, 'mousemove', nearestEmptyInsertDetectEvent);
      off(document, 'touchmove', nearestEmptyInsertDetectEvent);
    },
    _offUpEvents: function _offUpEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, 'mouseup', this._onDrop);
      off(ownerDocument, 'touchend', this._onDrop);
      off(ownerDocument, 'pointerup', this._onDrop);
      off(ownerDocument, 'pointercancel', this._onDrop);
      off(ownerDocument, 'touchcancel', this._onDrop);
      off(document, 'selectstart', this);
    },
    _onDrop: function _onDrop( /**Event*/evt) {
      var el = this.el,
        options = this.options;

      // Get the index of the dragged element within its parent
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      pluginEvent('drop', this, {
        evt: evt
      });
      parentEl = dragEl && dragEl.parentNode;

      // Get again after plugin event
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      if (Sortable.eventCanceled) {
        this._nulling();
        return;
      }
      awaitingDragStarted = false;
      isCircumstantialInvert = false;
      pastFirstInvertThresh = false;
      clearInterval(this._loopId);
      clearTimeout(this._dragStartTimer);
      _cancelNextTick(this.cloneId);
      _cancelNextTick(this._dragStartId);

      // Unbind events
      if (this.nativeDraggable) {
        off(document, 'drop', this);
        off(el, 'dragstart', this._onDragStart);
      }
      this._offMoveEvents();
      this._offUpEvents();
      if (Safari) {
        css(document.body, 'user-select', '');
      }
      css(dragEl, 'transform', '');
      if (evt) {
        if (moved) {
          evt.cancelable && evt.preventDefault();
          !options.dropBubble && evt.stopPropagation();
        }
        ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
        if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== 'clone') {
          // Remove clone(s)
          cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
        }
        if (dragEl) {
          if (this.nativeDraggable) {
            off(dragEl, 'dragend', this);
          }
          _disableDraggable(dragEl);
          dragEl.style['will-change'] = '';

          // Remove classes
          // ghostClass is added in dragStarted
          if (moved && !awaitingDragStarted) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
          }
          toggleClass(dragEl, this.options.chosenClass, false);

          // Drag stop event
          _dispatchEvent({
            sortable: this,
            name: 'unchoose',
            toEl: parentEl,
            newIndex: null,
            newDraggableIndex: null,
            originalEvent: evt
          });
          if (rootEl !== parentEl) {
            if (newIndex >= 0) {
              // Add event
              _dispatchEvent({
                rootEl: parentEl,
                name: 'add',
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });

              // Remove event
              _dispatchEvent({
                sortable: this,
                name: 'remove',
                toEl: parentEl,
                originalEvent: evt
              });

              // drag from one list and drop into another
              _dispatchEvent({
                rootEl: parentEl,
                name: 'sort',
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: 'sort',
                toEl: parentEl,
                originalEvent: evt
              });
            }
            putSortable && putSortable.save();
          } else {
            if (newIndex !== oldIndex) {
              if (newIndex >= 0) {
                // drag & drop within the same list
                _dispatchEvent({
                  sortable: this,
                  name: 'update',
                  toEl: parentEl,
                  originalEvent: evt
                });
                _dispatchEvent({
                  sortable: this,
                  name: 'sort',
                  toEl: parentEl,
                  originalEvent: evt
                });
              }
            }
          }
          if (Sortable.active) {
            /* jshint eqnull:true */
            if (newIndex == null || newIndex === -1) {
              newIndex = oldIndex;
              newDraggableIndex = oldDraggableIndex;
            }
            _dispatchEvent({
              sortable: this,
              name: 'end',
              toEl: parentEl,
              originalEvent: evt
            });

            // Save sorting
            this.save();
          }
        }
      }
      this._nulling();
    },
    _nulling: function _nulling() {
      pluginEvent('nulling', this);
      rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
      var el = this.el;
      savedInputChecked.forEach(function (checkEl) {
        if (el.contains(checkEl)) {
          checkEl.checked = true;
        }
      });
      savedInputChecked.length = lastDx = lastDy = 0;
    },
    handleEvent: function handleEvent( /**Event*/evt) {
      switch (evt.type) {
        case 'drop':
        case 'dragend':
          this._onDrop(evt);
          break;
        case 'dragenter':
        case 'dragover':
          if (dragEl) {
            this._onDragOver(evt);
            _globalDragOver(evt);
          }
          break;
        case 'selectstart':
          evt.preventDefault();
          break;
      }
    },
    /**
     * Serializes the item into an array of string.
     * @returns {String[]}
     */
    toArray: function toArray() {
      var order = [],
        el,
        children = this.el.children,
        i = 0,
        n = children.length,
        options = this.options;
      for (; i < n; i++) {
        el = children[i];
        if (closest(el, options.draggable, this.el, false)) {
          order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
        }
      }
      return order;
    },
    /**
     * Sorts the elements according to the array.
     * @param  {String[]}  order  order of the items
     */
    sort: function sort(order, useAnimation) {
      var items = {},
        rootEl = this.el;
      this.toArray().forEach(function (id, i) {
        var el = rootEl.children[i];
        if (closest(el, this.options.draggable, rootEl, false)) {
          items[id] = el;
        }
      }, this);
      useAnimation && this.captureAnimationState();
      order.forEach(function (id) {
        if (items[id]) {
          rootEl.removeChild(items[id]);
          rootEl.appendChild(items[id]);
        }
      });
      useAnimation && this.animateAll();
    },
    /**
     * Save the current sorting
     */
    save: function save() {
      var store = this.options.store;
      store && store.set && store.set(this);
    },
    /**
     * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
     * @param   {HTMLElement}  el
     * @param   {String}       [selector]  default: `options.draggable`
     * @returns {HTMLElement|null}
     */
    closest: function closest$1(el, selector) {
      return closest(el, selector || this.options.draggable, this.el, false);
    },
    /**
     * Set/get option
     * @param   {string} name
     * @param   {*}      [value]
     * @returns {*}
     */
    option: function option(name, value) {
      var options = this.options;
      if (value === void 0) {
        return options[name];
      } else {
        var modifiedValue = PluginManager.modifyOption(this, name, value);
        if (typeof modifiedValue !== 'undefined') {
          options[name] = modifiedValue;
        } else {
          options[name] = value;
        }
        if (name === 'group') {
          _prepareGroup(options);
        }
      }
    },
    /**
     * Destroy
     */
    destroy: function destroy() {
      pluginEvent('destroy', this);
      var el = this.el;
      el[expando] = null;
      off(el, 'mousedown', this._onTapStart);
      off(el, 'touchstart', this._onTapStart);
      off(el, 'pointerdown', this._onTapStart);
      if (this.nativeDraggable) {
        off(el, 'dragover', this);
        off(el, 'dragenter', this);
      }
      // Remove draggable attributes
      Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
        el.removeAttribute('draggable');
      });
      this._onDrop();
      this._disableDelayedDragEvents();
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = el = null;
    },
    _hideClone: function _hideClone() {
      if (!cloneHidden) {
        pluginEvent('hideClone', this);
        if (Sortable.eventCanceled) { return; }
        css(cloneEl, 'display', 'none');
        if (this.options.removeCloneOnHide && cloneEl.parentNode) {
          cloneEl.parentNode.removeChild(cloneEl);
        }
        cloneHidden = true;
      }
    },
    _showClone: function _showClone(putSortable) {
      if (putSortable.lastPutMode !== 'clone') {
        this._hideClone();
        return;
      }
      if (cloneHidden) {
        pluginEvent('showClone', this);
        if (Sortable.eventCanceled) { return; }

        // show clone at dragEl or original position
        if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
          rootEl.insertBefore(cloneEl, dragEl);
        } else if (nextEl) {
          rootEl.insertBefore(cloneEl, nextEl);
        } else {
          rootEl.appendChild(cloneEl);
        }
        if (this.options.group.revertClone) {
          this.animate(dragEl, cloneEl);
        }
        css(cloneEl, 'display', '');
        cloneHidden = false;
      }
    }
  };
  function _globalDragOver( /**Event*/evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = 'move';
    }
    evt.cancelable && evt.preventDefault();
  }
  function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
    var evt,
      sortable = fromEl[expando],
      onMoveFn = sortable.options.onMove,
      retVal;
    // Support for new CustomEvent feature
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent('move', {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent('Event');
      evt.initEvent('move', true, true);
    }
    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);
    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }
    return retVal;
  }
  function _disableDraggable(el) {
    el.draggable = false;
  }
  function _unsilent() {
    _silent = false;
  }
  function _ghostIsFirst(evt, vertical, sortable) {
    var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
  }
  function _ghostIsLast(evt, vertical, sortable) {
    var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
  }
  function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX,
      targetLength = vertical ? targetRect.height : targetRect.width,
      targetS1 = vertical ? targetRect.top : targetRect.left,
      targetS2 = vertical ? targetRect.bottom : targetRect.right,
      invert = false;
    if (!invertSwap) {
      // Never invert or create dragEl shadow when target movemenet causes mouse to move past the end of regular swapThreshold
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        // multiplied only by swapThreshold because mouse will already be inside target by (1 - threshold) * targetLength / 2
        // check if past first invert threshold on side opposite of lastDirection
        if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
          // past first invert threshold, do not restrict inverted threshold to dragEl shadow
          pastFirstInvertThresh = true;
        }
        if (!pastFirstInvertThresh) {
          // dragEl shadow (target move distance shadow)
          if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance // over dragEl shadow
          : mouseOnAxis > targetS2 - targetMoveDistance) {
            return -lastDirection;
          }
        } else {
          invert = true;
        }
      } else {
        // Regular
        if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
          return _getInsertDirection(target);
        }
      }
    }
    invert = invert || invertSwap;
    if (invert) {
      // Invert of regular
      if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
      }
    }
    return 0;
  }

  /**
   * Gets the direction dragEl must be swapped relative to target in order to make it
   * seem that dragEl has been "inserted" into that element's position
   * @param  {HTMLElement} target       The target whose position dragEl is being inserted at
   * @return {Number}                   Direction dragEl must be swapped
   */
  function _getInsertDirection(target) {
    if (index(dragEl) < index(target)) {
      return 1;
    } else {
      return -1;
    }
  }

  /**
   * Generate id
   * @param   {HTMLElement} el
   * @returns {String}
   * @private
   */
  function _generateId(el) {
    var str = el.tagName + el.className + el.src + el.href + el.textContent,
      i = str.length,
      sum = 0;
    while (i--) {
      sum += str.charCodeAt(i);
    }
    return sum.toString(36);
  }
  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName('input');
    var idx = inputs.length;
    while (idx--) {
      var el = inputs[idx];
      el.checked && savedInputChecked.push(el);
    }
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  function _cancelNextTick(id) {
    return clearTimeout(id);
  }

  // Fixed #973:
  if (documentExists) {
    on(document, 'touchmove', function (evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    });
  }

  // Export utils
  Sortable.utils = {
    on: on,
    off: off,
    css: css,
    find: find,
    is: function is(el, selector) {
      return !!closest(el, selector, el, false);
    },
    extend: extend,
    throttle: throttle,
    closest: closest,
    toggleClass: toggleClass,
    clone: clone,
    index: index,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild: getChild,
    expando: expando
  };

  /**
   * Get the Sortable instance of an element
   * @param  {HTMLElement} element The element
   * @return {Sortable|undefined}         The instance of Sortable
   */
  Sortable.get = function (element) {
    return element[expando];
  };

  /**
   * Mount a plugin to Sortable
   * @param  {...SortablePlugin|SortablePlugin[]} plugins       Plugins being mounted
   */
  Sortable.mount = function () {
    var arguments$1 = arguments;

    for (var _len = arguments.length, plugins = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins[_key] = arguments$1[_key];
    }
    if (plugins[0].constructor === Array) { plugins = plugins[0]; }
    plugins.forEach(function (plugin) {
      if (!plugin.prototype || !plugin.prototype.constructor) {
        throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
      }
      if (plugin.utils) { Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils); }
      PluginManager.mount(plugin);
    });
  };

  /**
   * Create sortable instance
   * @param {HTMLElement}  el
   * @param {Object}      [options]
   */
  Sortable.create = function (el, options) {
    return new Sortable(el, options);
  };

  // Export
  Sortable.version = version;

  var autoScrolls = [],
    scrollEl,
    scrollRootEl,
    scrolling = false,
    lastAutoScrollX,
    lastAutoScrollY,
    touchEvt$1,
    pointerElemChangedInterval;
  function AutoScrollPlugin() {
    function AutoScroll() {
      this.defaults = {
        scroll: true,
        forceAutoScrollFallback: false,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        bubbleScroll: true
      };

      // Bind all private methods
      for (var fn in this) {
        if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
          this[fn] = this[fn].bind(this);
        }
      }
    }
    AutoScroll.prototype = {
      dragStarted: function dragStarted(_ref) {
        var originalEvent = _ref.originalEvent;
        if (this.sortable.nativeDraggable) {
          on(document, 'dragover', this._handleAutoScroll);
        } else {
          if (this.options.supportPointer) {
            on(document, 'pointermove', this._handleFallbackAutoScroll);
          } else if (originalEvent.touches) {
            on(document, 'touchmove', this._handleFallbackAutoScroll);
          } else {
            on(document, 'mousemove', this._handleFallbackAutoScroll);
          }
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref2) {
        var originalEvent = _ref2.originalEvent;
        // For when bubbling is canceled and using fallback (fallback 'touchmove' always reached)
        if (!this.options.dragOverBubble && !originalEvent.rootEl) {
          this._handleAutoScroll(originalEvent);
        }
      },
      drop: function drop() {
        if (this.sortable.nativeDraggable) {
          off(document, 'dragover', this._handleAutoScroll);
        } else {
          off(document, 'pointermove', this._handleFallbackAutoScroll);
          off(document, 'touchmove', this._handleFallbackAutoScroll);
          off(document, 'mousemove', this._handleFallbackAutoScroll);
        }
        clearPointerElemChangedInterval();
        clearAutoScrolls();
        cancelThrottle();
      },
      nulling: function nulling() {
        touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
        autoScrolls.length = 0;
      },
      _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
        this._handleAutoScroll(evt, true);
      },
      _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
        var _this = this;
        var x = (evt.touches ? evt.touches[0] : evt).clientX,
          y = (evt.touches ? evt.touches[0] : evt).clientY,
          elem = document.elementFromPoint(x, y);
        touchEvt$1 = evt;

        // IE does not seem to have native autoscroll,
        // Edge's autoscroll seems too conditional,
        // MACOS Safari does not have autoscroll,
        // Firefox and Chrome are good
        if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
          autoScroll(evt, this.options, elem, fallback);

          // Listener for pointer element change
          var ogElemScroller = getParentAutoScrollElement(elem, true);
          if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
            pointerElemChangedInterval && clearPointerElemChangedInterval();
            // Detect for pointer elem change, emulating native DnD behaviour
            pointerElemChangedInterval = setInterval(function () {
              var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
              if (newElem !== ogElemScroller) {
                ogElemScroller = newElem;
                clearAutoScrolls();
              }
              autoScroll(evt, _this.options, newElem, fallback);
            }, 10);
            lastAutoScrollX = x;
            lastAutoScrollY = y;
          }
        } else {
          // if DnD is enabled (and browser has good autoscrolling), first autoscroll will already scroll, so get parent autoscroll of first autoscroll
          if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
            clearAutoScrolls();
            return;
          }
          autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
        }
      }
    };
    return _extends(AutoScroll, {
      pluginName: 'scroll',
      initializeByDefault: true
    });
  }
  function clearAutoScrolls() {
    autoScrolls.forEach(function (autoScroll) {
      clearInterval(autoScroll.pid);
    });
    autoScrolls = [];
  }
  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }
  var autoScroll = throttle(function (evt, options, rootEl, isFallback) {
    // Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
    if (!options.scroll) { return; }
    var x = (evt.touches ? evt.touches[0] : evt).clientX,
      y = (evt.touches ? evt.touches[0] : evt).clientY,
      sens = options.scrollSensitivity,
      speed = options.scrollSpeed,
      winScroller = getWindowScrollingElement();
    var scrollThisInstance = false,
      scrollCustomFn;

    // New scroll root, set scrollEl
    if (scrollRootEl !== rootEl) {
      scrollRootEl = rootEl;
      clearAutoScrolls();
      scrollEl = options.scroll;
      scrollCustomFn = options.scrollFn;
      if (scrollEl === true) {
        scrollEl = getParentAutoScrollElement(rootEl, true);
      }
    }
    var layersOut = 0;
    var currentParent = scrollEl;
    do {
      var el = currentParent,
        rect = getRect(el),
        top = rect.top,
        bottom = rect.bottom,
        left = rect.left,
        right = rect.right,
        width = rect.width,
        height = rect.height,
        canScrollX = void 0,
        canScrollY = void 0,
        scrollWidth = el.scrollWidth,
        scrollHeight = el.scrollHeight,
        elCSS = css(el),
        scrollPosX = el.scrollLeft,
        scrollPosY = el.scrollTop;
      if (el === winScroller) {
        canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll' || elCSS.overflowX === 'visible');
        canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll' || elCSS.overflowY === 'visible');
      } else {
        canScrollX = width < scrollWidth && (elCSS.overflowX === 'auto' || elCSS.overflowX === 'scroll');
        canScrollY = height < scrollHeight && (elCSS.overflowY === 'auto' || elCSS.overflowY === 'scroll');
      }
      var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
      var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
      if (!autoScrolls[layersOut]) {
        for (var i = 0; i <= layersOut; i++) {
          if (!autoScrolls[i]) {
            autoScrolls[i] = {};
          }
        }
      }
      if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
        autoScrolls[layersOut].el = el;
        autoScrolls[layersOut].vx = vx;
        autoScrolls[layersOut].vy = vy;
        clearInterval(autoScrolls[layersOut].pid);
        if (vx != 0 || vy != 0) {
          scrollThisInstance = true;
          /* jshint loopfunc:true */
          autoScrolls[layersOut].pid = setInterval(function () {
            // emulate drag over during autoscroll (fallback), emulating native DnD behaviour
            if (isFallback && this.layer === 0) {
              Sortable.active._onTouchMove(touchEvt$1); // To move ghost if it is positioned absolutely
            }
            var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
            var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
            if (typeof scrollCustomFn === 'function') {
              if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== 'continue') {
                return;
              }
            }
            scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
          }.bind({
            layer: layersOut
          }), 24);
        }
      }
      layersOut++;
    } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
    scrolling = scrollThisInstance; // in case another function catches scrolling as false in between when it is not
  }, 30);

  var drop = function drop(_ref) {
    var originalEvent = _ref.originalEvent,
      putSortable = _ref.putSortable,
      dragEl = _ref.dragEl,
      activeSortable = _ref.activeSortable,
      dispatchSortableEvent = _ref.dispatchSortableEvent,
      hideGhostForTarget = _ref.hideGhostForTarget,
      unhideGhostForTarget = _ref.unhideGhostForTarget;
    if (!originalEvent) { return; }
    var toSortable = putSortable || activeSortable;
    hideGhostForTarget();
    var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
    var target = document.elementFromPoint(touch.clientX, touch.clientY);
    unhideGhostForTarget();
    if (toSortable && !toSortable.el.contains(target)) {
      dispatchSortableEvent('spill');
      this.onSpill({
        dragEl: dragEl,
        putSortable: putSortable
      });
    }
  };
  function Revert() {}
  Revert.prototype = {
    startIndex: null,
    dragStart: function dragStart(_ref2) {
      var oldDraggableIndex = _ref2.oldDraggableIndex;
      this.startIndex = oldDraggableIndex;
    },
    onSpill: function onSpill(_ref3) {
      var dragEl = _ref3.dragEl,
        putSortable = _ref3.putSortable;
      this.sortable.captureAnimationState();
      if (putSortable) {
        putSortable.captureAnimationState();
      }
      var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
      if (nextSibling) {
        this.sortable.el.insertBefore(dragEl, nextSibling);
      } else {
        this.sortable.el.appendChild(dragEl);
      }
      this.sortable.animateAll();
      if (putSortable) {
        putSortable.animateAll();
      }
    },
    drop: drop
  };
  _extends(Revert, {
    pluginName: 'revertOnSpill'
  });
  function Remove() {}
  Remove.prototype = {
    onSpill: function onSpill(_ref4) {
      var dragEl = _ref4.dragEl,
        putSortable = _ref4.putSortable;
      var parentSortable = putSortable || this.sortable;
      parentSortable.captureAnimationState();
      dragEl.parentNode && dragEl.parentNode.removeChild(dragEl);
      parentSortable.animateAll();
    },
    drop: drop
  };
  _extends(Remove, {
    pluginName: 'removeOnSpill'
  });

  var lastSwapEl;
  function SwapPlugin() {
    function Swap() {
      this.defaults = {
        swapClass: 'sortable-swap-highlight'
      };
    }
    Swap.prototype = {
      dragStart: function dragStart(_ref) {
        var dragEl = _ref.dragEl;
        lastSwapEl = dragEl;
      },
      dragOverValid: function dragOverValid(_ref2) {
        var completed = _ref2.completed,
          target = _ref2.target,
          onMove = _ref2.onMove,
          activeSortable = _ref2.activeSortable,
          changed = _ref2.changed,
          cancel = _ref2.cancel;
        if (!activeSortable.options.swap) { return; }
        var el = this.sortable.el,
          options = this.options;
        if (target && target !== el) {
          var prevSwapEl = lastSwapEl;
          if (onMove(target) !== false) {
            toggleClass(target, options.swapClass, true);
            lastSwapEl = target;
          } else {
            lastSwapEl = null;
          }
          if (prevSwapEl && prevSwapEl !== lastSwapEl) {
            toggleClass(prevSwapEl, options.swapClass, false);
          }
        }
        changed();
        completed(true);
        cancel();
      },
      drop: function drop(_ref3) {
        var activeSortable = _ref3.activeSortable,
          putSortable = _ref3.putSortable,
          dragEl = _ref3.dragEl;
        var toSortable = putSortable || this.sortable;
        var options = this.options;
        lastSwapEl && toggleClass(lastSwapEl, options.swapClass, false);
        if (lastSwapEl && (options.swap || putSortable && putSortable.options.swap)) {
          if (dragEl !== lastSwapEl) {
            toSortable.captureAnimationState();
            if (toSortable !== activeSortable) { activeSortable.captureAnimationState(); }
            swapNodes(dragEl, lastSwapEl);
            toSortable.animateAll();
            if (toSortable !== activeSortable) { activeSortable.animateAll(); }
          }
        }
      },
      nulling: function nulling() {
        lastSwapEl = null;
      }
    };
    return _extends(Swap, {
      pluginName: 'swap',
      eventProperties: function eventProperties() {
        return {
          swapItem: lastSwapEl
        };
      }
    });
  }
  function swapNodes(n1, n2) {
    var p1 = n1.parentNode,
      p2 = n2.parentNode,
      i1,
      i2;
    if (!p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1)) { return; }
    i1 = index(n1);
    i2 = index(n2);
    if (p1.isEqualNode(p2) && i1 < i2) {
      i2++;
    }
    p1.insertBefore(n2, p1.children[i1]);
    p2.insertBefore(n1, p2.children[i2]);
  }

  var multiDragElements = [],
    multiDragClones = [],
    lastMultiDragSelect,
    // for selection with modifier key down (SHIFT)
    multiDragSortable,
    initialFolding = false,
    // Initial multi-drag fold when drag started
    folding = false,
    // Folding any other time
    dragStarted = false,
    dragEl$1,
    clonesFromRect,
    clonesHidden;
  function MultiDragPlugin() {
    function MultiDrag(sortable) {
      // Bind all private methods
      for (var fn in this) {
        if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
          this[fn] = this[fn].bind(this);
        }
      }
      if (!sortable.options.avoidImplicitDeselect) {
        if (sortable.options.supportPointer) {
          on(document, 'pointerup', this._deselectMultiDrag);
        } else {
          on(document, 'mouseup', this._deselectMultiDrag);
          on(document, 'touchend', this._deselectMultiDrag);
        }
      }
      on(document, 'keydown', this._checkKeyDown);
      on(document, 'keyup', this._checkKeyUp);
      this.defaults = {
        selectedClass: 'sortable-selected',
        multiDragKey: null,
        avoidImplicitDeselect: false,
        setData: function setData(dataTransfer, dragEl) {
          var data = '';
          if (multiDragElements.length && multiDragSortable === sortable) {
            multiDragElements.forEach(function (multiDragElement, i) {
              data += (!i ? '' : ', ') + multiDragElement.textContent;
            });
          } else {
            data = dragEl.textContent;
          }
          dataTransfer.setData('Text', data);
        }
      };
    }
    MultiDrag.prototype = {
      multiDragKeyDown: false,
      isMultiDrag: false,
      delayStartGlobal: function delayStartGlobal(_ref) {
        var dragged = _ref.dragEl;
        dragEl$1 = dragged;
      },
      delayEnded: function delayEnded() {
        this.isMultiDrag = ~multiDragElements.indexOf(dragEl$1);
      },
      setupClone: function setupClone(_ref2) {
        var sortable = _ref2.sortable,
          cancel = _ref2.cancel;
        if (!this.isMultiDrag) { return; }
        for (var i = 0; i < multiDragElements.length; i++) {
          multiDragClones.push(clone(multiDragElements[i]));
          multiDragClones[i].sortableIndex = multiDragElements[i].sortableIndex;
          multiDragClones[i].draggable = false;
          multiDragClones[i].style['will-change'] = '';
          toggleClass(multiDragClones[i], this.options.selectedClass, false);
          multiDragElements[i] === dragEl$1 && toggleClass(multiDragClones[i], this.options.chosenClass, false);
        }
        sortable._hideClone();
        cancel();
      },
      clone: function clone(_ref3) {
        var sortable = _ref3.sortable,
          rootEl = _ref3.rootEl,
          dispatchSortableEvent = _ref3.dispatchSortableEvent,
          cancel = _ref3.cancel;
        if (!this.isMultiDrag) { return; }
        if (!this.options.removeCloneOnHide) {
          if (multiDragElements.length && multiDragSortable === sortable) {
            insertMultiDragClones(true, rootEl);
            dispatchSortableEvent('clone');
            cancel();
          }
        }
      },
      showClone: function showClone(_ref4) {
        var cloneNowShown = _ref4.cloneNowShown,
          rootEl = _ref4.rootEl,
          cancel = _ref4.cancel;
        if (!this.isMultiDrag) { return; }
        insertMultiDragClones(false, rootEl);
        multiDragClones.forEach(function (clone) {
          css(clone, 'display', '');
        });
        cloneNowShown();
        clonesHidden = false;
        cancel();
      },
      hideClone: function hideClone(_ref5) {
        var _this = this;
        _ref5.sortable;
          var cloneNowHidden = _ref5.cloneNowHidden,
          cancel = _ref5.cancel;
        if (!this.isMultiDrag) { return; }
        multiDragClones.forEach(function (clone) {
          css(clone, 'display', 'none');
          if (_this.options.removeCloneOnHide && clone.parentNode) {
            clone.parentNode.removeChild(clone);
          }
        });
        cloneNowHidden();
        clonesHidden = true;
        cancel();
      },
      dragStartGlobal: function dragStartGlobal(_ref6) {
        _ref6.sortable;
        if (!this.isMultiDrag && multiDragSortable) {
          multiDragSortable.multiDrag._deselectMultiDrag();
        }
        multiDragElements.forEach(function (multiDragElement) {
          multiDragElement.sortableIndex = index(multiDragElement);
        });

        // Sort multi-drag elements
        multiDragElements = multiDragElements.sort(function (a, b) {
          return a.sortableIndex - b.sortableIndex;
        });
        dragStarted = true;
      },
      dragStarted: function dragStarted(_ref7) {
        var _this2 = this;
        var sortable = _ref7.sortable;
        if (!this.isMultiDrag) { return; }
        if (this.options.sort) {
          // Capture rects,
          // hide multi drag elements (by positioning them absolute),
          // set multi drag elements rects to dragRect,
          // show multi drag elements,
          // animate to rects,
          // unset rects & remove from DOM

          sortable.captureAnimationState();
          if (this.options.animation) {
            multiDragElements.forEach(function (multiDragElement) {
              if (multiDragElement === dragEl$1) { return; }
              css(multiDragElement, 'position', 'absolute');
            });
            var dragRect = getRect(dragEl$1, false, true, true);
            multiDragElements.forEach(function (multiDragElement) {
              if (multiDragElement === dragEl$1) { return; }
              setRect(multiDragElement, dragRect);
            });
            folding = true;
            initialFolding = true;
          }
        }
        sortable.animateAll(function () {
          folding = false;
          initialFolding = false;
          if (_this2.options.animation) {
            multiDragElements.forEach(function (multiDragElement) {
              unsetRect(multiDragElement);
            });
          }

          // Remove all auxiliary multidrag items from el, if sorting enabled
          if (_this2.options.sort) {
            removeMultiDragElements();
          }
        });
      },
      dragOver: function dragOver(_ref8) {
        var target = _ref8.target,
          completed = _ref8.completed,
          cancel = _ref8.cancel;
        if (folding && ~multiDragElements.indexOf(target)) {
          completed(false);
          cancel();
        }
      },
      revert: function revert(_ref9) {
        var fromSortable = _ref9.fromSortable,
          rootEl = _ref9.rootEl,
          sortable = _ref9.sortable,
          dragRect = _ref9.dragRect;
        if (multiDragElements.length > 1) {
          // Setup unfold animation
          multiDragElements.forEach(function (multiDragElement) {
            sortable.addAnimationState({
              target: multiDragElement,
              rect: folding ? getRect(multiDragElement) : dragRect
            });
            unsetRect(multiDragElement);
            multiDragElement.fromRect = dragRect;
            fromSortable.removeAnimationState(multiDragElement);
          });
          folding = false;
          insertMultiDragElements(!this.options.removeCloneOnHide, rootEl);
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref10) {
        var sortable = _ref10.sortable,
          isOwner = _ref10.isOwner,
          insertion = _ref10.insertion,
          activeSortable = _ref10.activeSortable,
          parentEl = _ref10.parentEl,
          putSortable = _ref10.putSortable;
        var options = this.options;
        if (insertion) {
          // Clones must be hidden before folding animation to capture dragRectAbsolute properly
          if (isOwner) {
            activeSortable._hideClone();
          }
          initialFolding = false;
          // If leaving sort:false root, or already folding - Fold to new location
          if (options.animation && multiDragElements.length > 1 && (folding || !isOwner && !activeSortable.options.sort && !putSortable)) {
            // Fold: Set all multi drag elements's rects to dragEl's rect when multi-drag elements are invisible
            var dragRectAbsolute = getRect(dragEl$1, false, true, true);
            multiDragElements.forEach(function (multiDragElement) {
              if (multiDragElement === dragEl$1) { return; }
              setRect(multiDragElement, dragRectAbsolute);

              // Move element(s) to end of parentEl so that it does not interfere with multi-drag clones insertion if they are inserted
              // while folding, and so that we can capture them again because old sortable will no longer be fromSortable
              parentEl.appendChild(multiDragElement);
            });
            folding = true;
          }

          // Clones must be shown (and check to remove multi drags) after folding when interfering multiDragElements are moved out
          if (!isOwner) {
            // Only remove if not folding (folding will remove them anyways)
            if (!folding) {
              removeMultiDragElements();
            }
            if (multiDragElements.length > 1) {
              var clonesHiddenBefore = clonesHidden;
              activeSortable._showClone(sortable);

              // Unfold animation for clones if showing from hidden
              if (activeSortable.options.animation && !clonesHidden && clonesHiddenBefore) {
                multiDragClones.forEach(function (clone) {
                  activeSortable.addAnimationState({
                    target: clone,
                    rect: clonesFromRect
                  });
                  clone.fromRect = clonesFromRect;
                  clone.thisAnimationDuration = null;
                });
              }
            } else {
              activeSortable._showClone(sortable);
            }
          }
        }
      },
      dragOverAnimationCapture: function dragOverAnimationCapture(_ref11) {
        var dragRect = _ref11.dragRect,
          isOwner = _ref11.isOwner,
          activeSortable = _ref11.activeSortable;
        multiDragElements.forEach(function (multiDragElement) {
          multiDragElement.thisAnimationDuration = null;
        });
        if (activeSortable.options.animation && !isOwner && activeSortable.multiDrag.isMultiDrag) {
          clonesFromRect = _extends({}, dragRect);
          var dragMatrix = matrix(dragEl$1, true);
          clonesFromRect.top -= dragMatrix.f;
          clonesFromRect.left -= dragMatrix.e;
        }
      },
      dragOverAnimationComplete: function dragOverAnimationComplete() {
        if (folding) {
          folding = false;
          removeMultiDragElements();
        }
      },
      drop: function drop(_ref12) {
        var evt = _ref12.originalEvent,
          rootEl = _ref12.rootEl,
          parentEl = _ref12.parentEl,
          sortable = _ref12.sortable,
          dispatchSortableEvent = _ref12.dispatchSortableEvent,
          oldIndex = _ref12.oldIndex,
          putSortable = _ref12.putSortable;
        var toSortable = putSortable || this.sortable;
        if (!evt) { return; }
        var options = this.options,
          children = parentEl.children;

        // Multi-drag selection
        if (!dragStarted) {
          if (options.multiDragKey && !this.multiDragKeyDown) {
            this._deselectMultiDrag();
          }
          toggleClass(dragEl$1, options.selectedClass, !~multiDragElements.indexOf(dragEl$1));
          if (!~multiDragElements.indexOf(dragEl$1)) {
            multiDragElements.push(dragEl$1);
            dispatchEvent({
              sortable: sortable,
              rootEl: rootEl,
              name: 'select',
              targetEl: dragEl$1,
              originalEvent: evt
            });

            // Modifier activated, select from last to dragEl
            if (evt.shiftKey && lastMultiDragSelect && sortable.el.contains(lastMultiDragSelect)) {
              var lastIndex = index(lastMultiDragSelect),
                currentIndex = index(dragEl$1);
              if (~lastIndex && ~currentIndex && lastIndex !== currentIndex) {
                (function () {
                  // Must include lastMultiDragSelect (select it), in case modified selection from no selection
                  // (but previous selection existed)
                  var n, i;
                  if (currentIndex > lastIndex) {
                    i = lastIndex;
                    n = currentIndex;
                  } else {
                    i = currentIndex;
                    n = lastIndex + 1;
                  }
                  var filter = options.filter;
                  for (; i < n; i++) {
                    if (~multiDragElements.indexOf(children[i])) { continue; }
                    // Check if element is draggable
                    if (!closest(children[i], options.draggable, parentEl, false)) { continue; }
                    // Check if element is filtered
                    var filtered = filter && (typeof filter === 'function' ? filter.call(sortable, evt, children[i], sortable) : filter.split(',').some(function (criteria) {
                      return closest(children[i], criteria.trim(), parentEl, false);
                    }));
                    if (filtered) { continue; }
                    toggleClass(children[i], options.selectedClass, true);
                    multiDragElements.push(children[i]);
                    dispatchEvent({
                      sortable: sortable,
                      rootEl: rootEl,
                      name: 'select',
                      targetEl: children[i],
                      originalEvent: evt
                    });
                  }
                })();
              }
            } else {
              lastMultiDragSelect = dragEl$1;
            }
            multiDragSortable = toSortable;
          } else {
            multiDragElements.splice(multiDragElements.indexOf(dragEl$1), 1);
            lastMultiDragSelect = null;
            dispatchEvent({
              sortable: sortable,
              rootEl: rootEl,
              name: 'deselect',
              targetEl: dragEl$1,
              originalEvent: evt
            });
          }
        }

        // Multi-drag drop
        if (dragStarted && this.isMultiDrag) {
          folding = false;
          // Do not "unfold" after around dragEl if reverted
          if ((parentEl[expando].options.sort || parentEl !== rootEl) && multiDragElements.length > 1) {
            var dragRect = getRect(dragEl$1),
              multiDragIndex = index(dragEl$1, ':not(.' + this.options.selectedClass + ')');
            if (!initialFolding && options.animation) { dragEl$1.thisAnimationDuration = null; }
            toSortable.captureAnimationState();
            if (!initialFolding) {
              if (options.animation) {
                dragEl$1.fromRect = dragRect;
                multiDragElements.forEach(function (multiDragElement) {
                  multiDragElement.thisAnimationDuration = null;
                  if (multiDragElement !== dragEl$1) {
                    var rect = folding ? getRect(multiDragElement) : dragRect;
                    multiDragElement.fromRect = rect;

                    // Prepare unfold animation
                    toSortable.addAnimationState({
                      target: multiDragElement,
                      rect: rect
                    });
                  }
                });
              }

              // Multi drag elements are not necessarily removed from the DOM on drop, so to reinsert
              // properly they must all be removed
              removeMultiDragElements();
              multiDragElements.forEach(function (multiDragElement) {
                if (children[multiDragIndex]) {
                  parentEl.insertBefore(multiDragElement, children[multiDragIndex]);
                } else {
                  parentEl.appendChild(multiDragElement);
                }
                multiDragIndex++;
              });

              // If initial folding is done, the elements may have changed position because they are now
              // unfolding around dragEl, even though dragEl may not have his index changed, so update event
              // must be fired here as Sortable will not.
              if (oldIndex === index(dragEl$1)) {
                var update = false;
                multiDragElements.forEach(function (multiDragElement) {
                  if (multiDragElement.sortableIndex !== index(multiDragElement)) {
                    update = true;
                    return;
                  }
                });
                if (update) {
                  dispatchSortableEvent('update');
                  dispatchSortableEvent('sort');
                }
              }
            }

            // Must be done after capturing individual rects (scroll bar)
            multiDragElements.forEach(function (multiDragElement) {
              unsetRect(multiDragElement);
            });
            toSortable.animateAll();
          }
          multiDragSortable = toSortable;
        }

        // Remove clones if necessary
        if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== 'clone') {
          multiDragClones.forEach(function (clone) {
            clone.parentNode && clone.parentNode.removeChild(clone);
          });
        }
      },
      nullingGlobal: function nullingGlobal() {
        this.isMultiDrag = dragStarted = false;
        multiDragClones.length = 0;
      },
      destroyGlobal: function destroyGlobal() {
        this._deselectMultiDrag();
        off(document, 'pointerup', this._deselectMultiDrag);
        off(document, 'mouseup', this._deselectMultiDrag);
        off(document, 'touchend', this._deselectMultiDrag);
        off(document, 'keydown', this._checkKeyDown);
        off(document, 'keyup', this._checkKeyUp);
      },
      _deselectMultiDrag: function _deselectMultiDrag(evt) {
        if (typeof dragStarted !== "undefined" && dragStarted) { return; }

        // Only deselect if selection is in this sortable
        if (multiDragSortable !== this.sortable) { return; }

        // Only deselect if target is not item in this sortable
        if (evt && closest(evt.target, this.options.draggable, this.sortable.el, false)) { return; }

        // Only deselect if left click
        if (evt && evt.button !== 0) { return; }
        while (multiDragElements.length) {
          var el = multiDragElements[0];
          toggleClass(el, this.options.selectedClass, false);
          multiDragElements.shift();
          dispatchEvent({
            sortable: this.sortable,
            rootEl: this.sortable.el,
            name: 'deselect',
            targetEl: el,
            originalEvent: evt
          });
        }
      },
      _checkKeyDown: function _checkKeyDown(evt) {
        if (evt.key === this.options.multiDragKey) {
          this.multiDragKeyDown = true;
        }
      },
      _checkKeyUp: function _checkKeyUp(evt) {
        if (evt.key === this.options.multiDragKey) {
          this.multiDragKeyDown = false;
        }
      }
    };
    return _extends(MultiDrag, {
      // Static methods & properties
      pluginName: 'multiDrag',
      utils: {
        /**
         * Selects the provided multi-drag item
         * @param  {HTMLElement} el    The element to be selected
         */
        select: function select(el) {
          var sortable = el.parentNode[expando];
          if (!sortable || !sortable.options.multiDrag || ~multiDragElements.indexOf(el)) { return; }
          if (multiDragSortable && multiDragSortable !== sortable) {
            multiDragSortable.multiDrag._deselectMultiDrag();
            multiDragSortable = sortable;
          }
          toggleClass(el, sortable.options.selectedClass, true);
          multiDragElements.push(el);
        },
        /**
         * Deselects the provided multi-drag item
         * @param  {HTMLElement} el    The element to be deselected
         */
        deselect: function deselect(el) {
          var sortable = el.parentNode[expando],
            index = multiDragElements.indexOf(el);
          if (!sortable || !sortable.options.multiDrag || !~index) { return; }
          toggleClass(el, sortable.options.selectedClass, false);
          multiDragElements.splice(index, 1);
        }
      },
      eventProperties: function eventProperties() {
        var _this3 = this;
        var oldIndicies = [],
          newIndicies = [];
        multiDragElements.forEach(function (multiDragElement) {
          oldIndicies.push({
            multiDragElement: multiDragElement,
            index: multiDragElement.sortableIndex
          });

          // multiDragElements will already be sorted if folding
          var newIndex;
          if (folding && multiDragElement !== dragEl$1) {
            newIndex = -1;
          } else if (folding) {
            newIndex = index(multiDragElement, ':not(.' + _this3.options.selectedClass + ')');
          } else {
            newIndex = index(multiDragElement);
          }
          newIndicies.push({
            multiDragElement: multiDragElement,
            index: newIndex
          });
        });
        return {
          items: _toConsumableArray(multiDragElements),
          clones: [].concat(multiDragClones),
          oldIndicies: oldIndicies,
          newIndicies: newIndicies
        };
      },
      optionListeners: {
        multiDragKey: function multiDragKey(key) {
          key = key.toLowerCase();
          if (key === 'ctrl') {
            key = 'Control';
          } else if (key.length > 1) {
            key = key.charAt(0).toUpperCase() + key.substr(1);
          }
          return key;
        }
      }
    });
  }
  function insertMultiDragElements(clonesInserted, rootEl) {
    multiDragElements.forEach(function (multiDragElement, i) {
      var target = rootEl.children[multiDragElement.sortableIndex + (clonesInserted ? Number(i) : 0)];
      if (target) {
        rootEl.insertBefore(multiDragElement, target);
      } else {
        rootEl.appendChild(multiDragElement);
      }
    });
  }

  /**
   * Insert multi-drag clones
   * @param  {[Boolean]} elementsInserted  Whether the multi-drag elements are inserted
   * @param  {HTMLElement} rootEl
   */
  function insertMultiDragClones(elementsInserted, rootEl) {
    multiDragClones.forEach(function (clone, i) {
      var target = rootEl.children[clone.sortableIndex + (elementsInserted ? Number(i) : 0)];
      if (target) {
        rootEl.insertBefore(clone, target);
      } else {
        rootEl.appendChild(clone);
      }
    });
  }
  function removeMultiDragElements() {
    multiDragElements.forEach(function (multiDragElement) {
      if (multiDragElement === dragEl$1) { return; }
      multiDragElement.parentNode && multiDragElement.parentNode.removeChild(multiDragElement);
    });
  }

  Sortable.mount(new AutoScrollPlugin());
  Sortable.mount(Remove, Revert);

  var sortable_esm = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Sortable,
    MultiDrag: MultiDragPlugin,
    Sortable: Sortable,
    Swap: SwapPlugin
  });

  return VuePlugin;

}));
