/**
 * QGrid - tiny, dependency-free .xlsx (Office Open XML) writer.
 *
 * Produces a single-sheet workbook with typed cells (numbers stay numbers,
 * booleans stay booleans, Date objects become real Excel dates), a bold frozen
 * header row and auto-sized columns. The package is a "stored" (uncompressed)
 * zip, which every spreadsheet app reads; it keeps this file ~3 KB minified.
 */
import { getCellValue } from './qgrid-utils.js'

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/* --------------------------------------------------------------------- zip */

let crcTable = null

function getCrcTable () {
  if (crcTable === null) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
      }
      crcTable[n] = c >>> 0
    }
  }
  return crcTable
}

export function crc32 (bytes) {
  const table = getCrcTable()
  let crc = 0xFFFFFFFF
  for (let i = 0; i < bytes.length; i++) {
    crc = table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

const DOS_DATE = (1 << 5) | 1 // 1980-01-01

/** files: [{ name, data: Uint8Array }] -> Uint8Array (zip, "stored" method) */
export function zipStore (files) {
  const encoder = new TextEncoder()
  const entries = files.map(file => {
    const name = encoder.encode(file.name)
    return { name, data: file.data, crc: crc32(file.data) }
  })

  let localSize = 0, centralSize = 0
  entries.forEach(entry => {
    localSize += 30 + entry.name.length + entry.data.length
    centralSize += 46 + entry.name.length
  })

  const out = new Uint8Array(localSize + centralSize + 22)
  const view = new DataView(out.buffer)
  let pos = 0

  entries.forEach(entry => {
    entry.offset = pos
    view.setUint32(pos, 0x04034B50, true)
    view.setUint16(pos + 4, 20, true) // version needed
    view.setUint16(pos + 6, 0x0800, true) // UTF-8 names
    view.setUint16(pos + 8, 0, true) // stored
    view.setUint16(pos + 10, 0, true) // time
    view.setUint16(pos + 12, DOS_DATE, true)
    view.setUint32(pos + 14, entry.crc, true)
    view.setUint32(pos + 18, entry.data.length, true)
    view.setUint32(pos + 22, entry.data.length, true)
    view.setUint16(pos + 26, entry.name.length, true)
    view.setUint16(pos + 28, 0, true)
    out.set(entry.name, pos + 30)
    out.set(entry.data, pos + 30 + entry.name.length)
    pos += 30 + entry.name.length + entry.data.length
  })

  const centralStart = pos
  entries.forEach(entry => {
    view.setUint32(pos, 0x02014B50, true)
    view.setUint16(pos + 4, 20, true) // version made by
    view.setUint16(pos + 6, 20, true) // version needed
    view.setUint16(pos + 8, 0x0800, true)
    view.setUint16(pos + 10, 0, true)
    view.setUint16(pos + 12, 0, true)
    view.setUint16(pos + 14, DOS_DATE, true)
    view.setUint32(pos + 16, entry.crc, true)
    view.setUint32(pos + 20, entry.data.length, true)
    view.setUint32(pos + 24, entry.data.length, true)
    view.setUint16(pos + 28, entry.name.length, true)
    view.setUint16(pos + 30, 0, true) // extra
    view.setUint16(pos + 32, 0, true) // comment
    view.setUint16(pos + 34, 0, true) // disk
    view.setUint16(pos + 36, 0, true) // internal attrs
    view.setUint32(pos + 38, 0, true) // external attrs
    view.setUint32(pos + 42, entry.offset, true)
    out.set(entry.name, pos + 46)
    pos += 46 + entry.name.length
  })

  view.setUint32(pos, 0x06054B50, true)
  view.setUint16(pos + 4, 0, true)
  view.setUint16(pos + 6, 0, true)
  view.setUint16(pos + 8, entries.length, true)
  view.setUint16(pos + 10, entries.length, true)
  view.setUint32(pos + 12, pos - centralStart, true)
  view.setUint32(pos + 16, centralStart, true)
  view.setUint16(pos + 20, 0, true)

  return out
}

/* -------------------------------------------------------------------- xlsx */

// characters that are not allowed in XML 1.0 documents
const INVALID_XML_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g

function escapeXml (str) {
  return str
    .replace(INVALID_XML_RE, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function columnLetter (index) {
  let letters = ''
  let n = index + 1
  while (n > 0) {
    const rem = (n - 1) % 26
    letters = String.fromCharCode(65 + rem) + letters
    n = Math.floor((n - 1) / 26)
  }
  return letters
}

function sanitizeSheetName (name) {
  const clean = String(name || '').replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 31)
  return clean || 'Sheet1'
}

const MAX_CELL_CHARS = 32767

function stringCell (ref, str, style) {
  const text = str.length > MAX_CELL_CHARS ? str.slice(0, MAX_CELL_CHARS) : str
  return '<c r="' + ref + '" t="inlineStr"' + (style ? ' s="' + style + '"' : '') +
    '><is><t xml:space="preserve">' + escapeXml(text) + '</t></is></c>'
}

/** -> [xml, displayLength] */
function cellXml (ref, value) {
  if (value === null || value === void 0 || value === '') return ['', 0]

  if (typeof value === 'number') {
    if (isFinite(value) === false) return ['', 0]
    return ['<c r="' + ref + '"><v>' + value + '</v></c>', String(value).length]
  }

  if (typeof value === 'boolean') {
    return ['<c r="' + ref + '" t="b"><v>' + (value ? 1 : 0) + '</v></c>', 5]
  }

  if (value instanceof Date) {
    const time = value.getTime()
    if (isNaN(time)) return ['', 0]
    // Excel serial date (days since 1899-12-30), in local time
    const serial = (time - value.getTimezoneOffset() * 60000) / 86400000 + 25569
    return ['<c r="' + ref + '" s="2"><v>' + serial + '</v></c>', 10]
  }

  const str = Array.isArray(value) ? value.join(', ') : String(value)
  return [stringCell(ref, str, 0), str.length]
}

const CONTENT_TYPES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/>' +
  '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
  '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
  '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
  '</Types>'

const ROOT_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
  '</Relationships>'

const WORKBOOK_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
  '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
  '</Relationships>'

// style 0: default, 1: bold (header), 2: date
const STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
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
  '</styleSheet>'

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
export function toXlsx (rows, cols, opts) {
  const sheetName = opts && opts.sheetName
  const widths = cols.map(col => String(col.label !== void 0 ? col.label : col.name).length)
  const sheetRows = []

  // header
  let header = '<row r="1">'
  for (let c = 0; c < cols.length; c++) {
    const label = cols[c].label !== void 0 ? cols[c].label : cols[c].name
    header += stringCell(columnLetter(c) + '1', String(label), 1)
  }
  sheetRows.push(header + '</row>')

  const letters = cols.map((col, c) => columnLetter(c))

  for (let r = 0; r < rows.length; r++) {
    const rowNum = r + 2
    let xml = '<row r="' + rowNum + '">'
    for (let c = 0; c < cols.length; c++) {
      const res = cellXml(letters[c] + rowNum, getCellValue(rows[r], cols[c]))
      xml += res[0]
      if (res[1] > widths[c]) widths[c] = res[1]
    }
    sheetRows.push(xml + '</row>')
  }

  const lastRef = (cols.length > 0 ? letters[cols.length - 1] : 'A') + (rows.length + 1)
  const colsXml = cols.length === 0
    ? ''
    : '<cols>' + widths.map((w, c) =>
      '<col min="' + (c + 1) + '" max="' + (c + 1) + '" width="' + Math.min(Math.max(w + 2, 8), 60) + '" customWidth="1"/>'
    ).join('') + '</cols>'

  const sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<dimension ref="A1:' + lastRef + '"/>' +
    '<sheetViews><sheetView workbookViewId="0">' +
    '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' +
    '</sheetView></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="15"/>' +
    colsXml +
    '<sheetData>' + sheetRows.join('') + '</sheetData>' +
    '</worksheet>'

  const encoder = new TextEncoder()
  return zipStore([
    { name: '[Content_Types].xml', data: encoder.encode(CONTENT_TYPES) },
    { name: '_rels/.rels', data: encoder.encode(ROOT_RELS) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml(sheetName)) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(WORKBOOK_RELS) },
    { name: 'xl/styles.xml', data: encoder.encode(STYLES) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheet) }
  ])
}
