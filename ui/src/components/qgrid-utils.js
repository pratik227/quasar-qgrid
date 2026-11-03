/**
 * QGrid - pure (framework agnostic) helpers.
 *
 * Everything in here is hot-path code (it runs on every filter change over
 * every row), so it is written with plain loops and pre-compiled predicates.
 * Keep it free of Vue / Quasar imports so it can be unit tested & benchmarked
 * in plain Node, and keep the syntax buble-compatible (no for..of, no ?. / ??).
 */

export const GROUP_FILTER_KEY = '__qgrid_group'

/* ------------------------------------------------------------------ columns */

/** Key under which a column's filter state is stored (backwards compatible: the field name). */
export function fieldKey (col) {
  if (col.filter_key !== void 0) return col.filter_key
  return typeof col.field === 'string' ? col.field : col.name
}

export function getRawValue (row, col) {
  if (typeof col.field === 'function') return col.field(row)
  return row[col.field === void 0 ? col.name : col.field]
}

/** Same semantics as QTable's internal getCellValue (field + format). */
export function getCellValue (row, col) {
  const val = getRawValue(row, col)
  return typeof col.format === 'function' ? col.format(val, row) : val
}

export function filterTypeOf (col) {
  return col.filter_type || 'text'
}

/**
 * Historically date columns were declared with `format: 'DD/MM/YYYY'` (a string),
 * but QTable expects `format` to be a function and throws on global search /
 * default rendering. Move string formats to `date_format` (non-destructively).
 */
export function normalizeColumn (col) {
  if (typeof col.format === 'string') {
    const copy = Object.assign({}, col)
    copy.date_format = col.date_format || col.format
    delete copy.format
    return copy
  }
  return col
}

/* ------------------------------------------------------------------- tokens */

export function toToken (val) {
  return String(val).toLowerCase()
}

const collator = typeof Intl !== 'undefined' && Intl.Collator
  ? new Intl.Collator(void 0, { numeric: true, sensitivity: 'base' })
  : null

function compareLabels (a, b) {
  if (collator !== null) return collator.compare(a.label, b.label)
  return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0)
}

/**
 * Distinct, sorted `{ label, value }` options of a column (array values are
 * flattened, so tag-like fields get one option per tag). `value` is the
 * lower-cased token the select filters compare against.
 */
export function buildOptions (rows, col) {
  if (Array.isArray(col.filter_options)) {
    return col.filter_options.map(opt => {
      const isObj = opt !== null && typeof opt === 'object'
      const label = isObj ? opt.label : opt
      const value = isObj && opt.value !== void 0 ? opt.value : label
      return { label: String(label), value: toToken(value) }
    })
  }

  const seen = new Map()
  const add = val => {
    if (val === null || val === void 0 || val === '') return
    const token = toToken(val)
    if (seen.has(token) === false) {
      seen.set(token, { label: String(val), value: token })
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const val = getRawValue(rows[i], col)
    if (Array.isArray(val)) {
      for (let j = 0; j < val.length; j++) add(val[j])
    }
    else {
      add(val)
    }
  }

  const options = Array.from(seen.values())
  options.sort(compareLabels)
  return options
}

/* -------------------------------------------------------------------- dates */

const MASK_TOKEN_RE = /YYYY|YY|MMMM|MMM|MM|M|DDDD|DDD|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|SSS|SS|S|A|a/g
const PART_RE = /\d+|[A-Za-z]+/g
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const FIXED_WIDTH = { YYYY: 4, YY: 2, MM: 2, DD: 2, HH: 2, hh: 2, mm: 2, ss: 2, SSS: 3 }
const maskCache = Object.create(null)

function tokenizeMask (mask) {
  let tokens = maskCache[mask]
  if (tokens === void 0) {
    tokens = maskCache[mask] = mask.match(MASK_TOKEN_RE) || []
  }
  return tokens
}

/**
 * Lenient, moment-like parser: walks the mask tokens and the value's numeric /
 * word parts in order, so both '05/03/2024' and '5/3/2024' match 'DD/MM/YYYY',
 * and compact values like '20240305' match 'YYYYMMDD'. Returns a timestamp or NaN.
 */
export function parseWithMask (str, mask) {
  const tokens = tokenizeMask(mask)
  const parts = str.match(PART_RE)
  if (tokens.length === 0 || parts === null) return NaN

  let year = new Date().getFullYear(), month = 1, day = 1
  let hour = 0, minute = 0, second = 0, ms = 0, meridiem = null
  let dayOfYear = false
  let p = 0, offset = 0

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t]
    let part = parts[p]
    if (part === void 0) return NaN

    const isWordToken = token === 'MMMM' || token === 'MMM' || token === 'dddd' || token === 'ddd' || token === 'A' || token === 'a'

    if (isWordToken) {
      if (/^\d/.test(part)) return NaN
      if (token === 'MMMM' || token === 'MMM') {
        month = MONTHS.indexOf(part.slice(0, 3).toLowerCase()) + 1
        if (month === 0) return NaN
      }
      else if (token === 'A' || token === 'a') {
        meridiem = part.toLowerCase()
      }
      p++
      offset = 0
      continue
    }

    if (/^\d/.test(part) === false) return NaN

    // fixed-width tokens may need to split a compact numeric part (eg. 'YYYYMMDD')
    const width = FIXED_WIDTH[token]
    const rest = part.slice(offset)
    let chunk
    if (width !== void 0 && rest.length > width) {
      chunk = rest.slice(0, width)
      offset += width
    }
    else {
      chunk = rest
      p++
      offset = 0
    }

    const num = parseInt(chunk, 10)
    switch (token) {
      case 'YYYY': year = num; break
      case 'YY': year = num + (num > 68 ? 1900 : 2000); break
      case 'MM': case 'M': month = num; break
      case 'DDDD': case 'DDD': month = 1; day = num; dayOfYear = true; break
      case 'DD': case 'D': day = num; break
      case 'HH': case 'H': case 'hh': case 'h': hour = num; break
      case 'mm': case 'm': minute = num; break
      case 'ss': case 's': second = num; break
      default: ms = parseInt((chunk + '00').slice(0, 3), 10) // S, SS, SSS
    }
  }

  if (meridiem !== null) {
    if (meridiem.charAt(0) === 'p' && hour < 12) hour += 12
    else if (meridiem.charAt(0) === 'a' && hour === 12) hour = 0
  }

  if (month < 1 || month > 12 || day < 1 || day > (dayOfYear ? 366 : 31) || hour > 23 || minute > 59 || second > 59) {
    return NaN
  }

  const date = new Date(year, month - 1, day, hour, minute, second, ms)
  // reject roll-overs such as 31/02 (moment treats them as invalid too)
  if (dayOfYear === false && date.getDate() !== day) return NaN
  return date.getTime()
}

/** Date | timestamp | string (parsed with `mask` when given, else ISO/RFC) -> timestamp | NaN */
export function parseDate (value, mask) {
  if (value === null || value === void 0 || value === '') return NaN
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value

  const str = String(value).trim()
  if (mask) {
    const ts = parseWithMask(str, mask)
    if (isNaN(ts) === false) return ts
  }
  return Date.parse(str)
}

/** QDate range model ('YYYY/MM/DD' string | { from, to } | null) -> { from, to } */
export function normalizeDateRange (val) {
  if (val === null || val === void 0 || val === '') return { from: '', to: '' }
  if (typeof val === 'string') return { from: val, to: val }
  return { from: val.from || '', to: val.to || '' }
}

function dayBounds (fromStr, toStr) {
  const start = parseWithMask(fromStr, 'YYYY/MM/DD')
  const endDay = parseWithMask(toStr, 'YYYY/MM/DD')
  if (isNaN(start) || isNaN(endDay)) return null
  const end = new Date(endDay)
  end.setHours(23, 59, 59, 999)
  return { start, end: end.getTime() }
}

/* ------------------------------------------------------------------ numbers */

export function toNumber (val) {
  if (typeof val === 'number') return val
  if (val === null || val === void 0 || val === '') return NaN
  return parseFloat(val)
}

/* ------------------------------------------------------------------ filters */

export function isFilterValueActive (col, val) {
  const type = filterTypeOf(col)
  if (type === 'date') {
    const range = normalizeDateRange(val)
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
export function compileColumnFilters (columns, filterData, getDateCache) {
  const predicates = []

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i]
    const key = fieldKey(col)
    const val = filterData[key]
    if (isFilterValueActive(col, val) === false) continue

    const type = filterTypeOf(col)

    if (type === 'text') {
      const needle = String(val).toLowerCase()
      predicates.push(row => {
        const cell = getRawValue(row, col)
        return cell !== null && cell !== void 0 && String(cell).toLowerCase().indexOf(needle) !== -1
      })
    }
    else if (type === 'date') {
      const range = normalizeDateRange(val)
      const bounds = dayBounds(range.from, range.to)
      if (bounds === null) continue
      const start = bounds.start, end = bounds.end
      const mask = col.date_format
      const cache = getDateCache(key + '|' + (mask || ''))
      predicates.push(row => {
        const cell = getRawValue(row, col)
        if (cell === null || cell === void 0 || cell === '') return false
        let ts = cache.get(cell)
        if (ts === void 0) {
          ts = parseDate(cell, mask)
          cache.set(cell, ts)
        }
        return ts >= start && ts <= end
      })
    }
    else if (type === 'number_range') {
      const from = toNumber(val.from), to = toNumber(val.to)
      const hasFrom = isNaN(from) === false, hasTo = isNaN(to) === false
      predicates.push(row => {
        const num = toNumber(getRawValue(row, col))
        if (isNaN(num)) return false
        return (hasFrom === false || num >= from) && (hasTo === false || num <= to)
      })
    }
  }

  return predicates
}

/** Compiles the multi-select (filter row "select" + header filter) value filters. */
export function compileSelectFilters (columns, selections) {
  const predicates = []

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i]
    const selected = selections[fieldKey(col)]
    if (!selected || selected.length === 0) continue

    const set = new Set(selected)
    predicates.push(row => {
      const cell = getRawValue(row, col)
      if (cell === null || cell === void 0) return false
      if (Array.isArray(cell)) {
        for (let j = 0; j < cell.length; j++) {
          if (set.has(toToken(cell[j]))) return true
        }
        return false
      }
      return set.has(toToken(cell))
    })
  }

  return predicates
}

export function applyPredicates (rows, predicates) {
  const len = predicates.length
  if (len === 0) return rows

  const out = []
  rowLoop:
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    for (let j = 0; j < len; j++) {
      if (predicates[j](row) === false) continue rowLoop
    }
    out.push(row)
  }
  return out
}

/* ----------------------------------------------------------------- grouping */

/** -> Map(groupName -> rows), in first-seen order */
export function groupRows (rows, col) {
  const groups = new Map()
  for (let i = 0; i < rows.length; i++) {
    const val = getRawValue(rows[i], col)
    const key = val === null || val === void 0 ? '' : String(val)
    const bucket = groups.get(key)
    if (bucket === void 0) groups.set(key, [rows[i]])
    else bucket.push(rows[i])
  }
  return groups
}

/* -------------------------------------------------------------- aggregation */

export function aggregate (rows, col) {
  const agg = col.aggregate
  if (typeof agg === 'function') {
    return agg(rows.map(row => getRawValue(row, col)), rows, col)
  }

  let count = 0, numeric = 0, sum = 0, min = Infinity, max = -Infinity
  for (let i = 0; i < rows.length; i++) {
    const val = getRawValue(rows[i], col)
    if (val === null || val === void 0 || val === '') continue
    count++
    const num = toNumber(val)
    if (isNaN(num)) continue
    numeric++
    sum += num
    if (num < min) min = num
    if (num > max) max = num
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

export function formatAggregate (value) {
  if (value === null || value === void 0 || (typeof value === 'number' && isNaN(value))) return '—'
  if (typeof value === 'number') {
    return value.toLocaleString(void 0, { maximumFractionDigits: 2 })
  }
  return String(value)
}

/* -------------------------------------------------------------------- misc */

/** Moves an array item in place (move semantics, unlike a swap). */
export function moveItem (arr, from, to) {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return false
  const item = arr.splice(from, 1)[0]
  arr.splice(to, 0, item)
  return true
}

function csvCell (val) {
  const str = val === null || val === void 0 ? '' : String(val)
  return '"' + str.split('"').join('""') + '"'
}

/** RFC 4180 CSV with a UTF-8 BOM (so Excel opens non-ASCII text correctly). */
export function toCsv (rows, cols) {
  const lines = [cols.map(col => csvCell(col.label !== void 0 ? col.label : col.name)).join(',')]
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    lines.push(cols.map(col => csvCell(getCellValue(row, col))).join(','))
  }
  return '﻿' + lines.join('\r\n')
}

/* ------------------------------------------------------------------ sorting */

const sortCollator = typeof Intl !== 'undefined' && Intl.Collator
  ? new Intl.Collator(void 0, { numeric: true, sensitivity: 'base' })
  : null

function compareByColumn (col, a, b) {
  const A = getRawValue(a, col)
  const B = getRawValue(b, col)

  if (typeof col.rawSort === 'function') return col.rawSort(A, B, a, b)

  const aEmpty = A === null || A === void 0
  const bEmpty = B === null || B === void 0
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : (aEmpty ? -1 : 1)

  if (typeof col.sort === 'function') return col.sort(A, B, a, b)
  if (typeof A === 'number' && typeof B === 'number') return A - B
  if (A instanceof Date && B instanceof Date) return A.getTime() - B.getTime()
  if (typeof A === 'boolean' && typeof B === 'boolean') return (A ? 1 : 0) - (B ? 1 : 0)

  const sa = String(A), sb = String(B)
  if (sortCollator !== null) return sortCollator.compare(sa, sb)
  const la = sa.toLowerCase(), lb = sb.toLowerCase()
  return la < lb ? -1 : (la > lb ? 1 : 0)
}

/**
 * Stable multi-column sort (in place).
 * @param {Array} rows
 * @param {Array} model  [{ name, descending }] - first entry has the highest priority
 * @param {Object} columnsByName  name -> column definition
 */
export function sortRows (rows, model, columnsByName) {
  const specs = []
  for (let i = 0; i < model.length; i++) {
    const col = columnsByName[model[i].name]
    if (col !== void 0) specs.push({ col, dir: model[i].descending ? -1 : 1 })
  }
  if (specs.length === 0) return rows

  // decorate with the original index so equal rows keep their order
  const indexed = rows.map((row, index) => ({ row, index }))
  indexed.sort((x, y) => {
    for (let i = 0; i < specs.length; i++) {
      const res = compareByColumn(specs[i].col, x.row, y.row)
      if (res !== 0) return res * specs[i].dir
    }
    return x.index - y.index
  })
  for (let i = 0; i < indexed.length; i++) rows[i] = indexed[i].row
  return rows
}

/** Cycles a column through: (none) -> asc -> desc -> (none), keeping the other sorts. */
export function toggleSortModel (model, name) {
  const index = model.findIndex(s => s.name === name)
  if (index === -1) return model.concat({ name, descending: false })
  if (model[index].descending === false) {
    return model.map((s, i) => i === index ? { name, descending: true } : s)
  }
  return model.filter((s, i) => i !== index)
}

/* ------------------------------------------------------------------ pinning */

/** Reorders columns as: pinned left, unpinned, pinned right (stable inside each group). */
export function partitionPinned (cols, pinOf) {
  const left = [], middle = [], right = []
  for (let i = 0; i < cols.length; i++) {
    const side = pinOf(cols[i])
    if (side === 'left') left.push(cols[i])
    else if (side === 'right') right.push(cols[i])
    else middle.push(cols[i])
  }
  return left.concat(middle, right)
}

/**
 * Sticky offsets for pinned columns.
 * @param {Array} cols       visible columns, in display order
 * @param {Function} pinOf   col -> 'left' | 'right' | null
 * @param {Function} widthOf col -> px
 * @param {Number} lead      width of the leading (selection / expand) cells
 * @returns {Object} name -> { side, offset, edge }
 */
export function pinOffsets (cols, pinOf, widthOf, lead) {
  const out = {}
  let left = lead || 0
  let lastLeft = null
  for (let i = 0; i < cols.length; i++) {
    if (pinOf(cols[i]) !== 'left') continue
    out[cols[i].name] = { side: 'left', offset: left, edge: false }
    left += widthOf(cols[i])
    lastLeft = cols[i].name
  }
  if (lastLeft !== null) out[lastLeft].edge = true

  let right = 0
  let firstRight = null
  for (let i = cols.length - 1; i >= 0; i--) {
    if (pinOf(cols[i]) !== 'right') continue
    out[cols[i].name] = { side: 'right', offset: right, edge: false }
    right += widthOf(cols[i])
    firstRight = cols[i].name
  }
  if (firstRight !== null) out[firstRight].edge = true
  return out
}

/** '120px' | 120 -> 120 ; anything else -> null */
export function parseWidth (val) {
  if (typeof val === 'number' && isFinite(val)) return val
  if (typeof val === 'string' && /^\d+(\.\d+)?(px)?$/.test(val.trim())) return parseFloat(val)
  return null
}

/* ---------------------------------------------------------------- clipboard */

function tsvCell (val) {
  const str = val === null || val === void 0 ? '' : (Array.isArray(val) ? val.join(', ') : String(val))
  return str.replace(/[\t\r\n]+/g, ' ')
}

/** Tab separated values (pastes as cells into Excel / Sheets). */
export function toTsv (rows, cols, withHeader) {
  const lines = []
  if (withHeader !== false) lines.push(cols.map(col => tsvCell(col.label !== void 0 ? col.label : col.name)).join('\t'))
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    lines.push(cols.map(col => tsvCell(getCellValue(row, col))).join('\t'))
  }
  return lines.join('\n')
}
