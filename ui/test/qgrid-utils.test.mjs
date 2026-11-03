// Run with: npm test   (Node 22+, uses the built-in test runner)
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  fieldKey, getRawValue, getCellValue, normalizeColumn, buildOptions,
  parseDate, parseWithMask, normalizeDateRange, compileColumnFilters,
  compileSelectFilters, applyPredicates, groupRows, aggregate, formatAggregate,
  moveItem, toCsv, isFilterValueActive
} from '../src/components/qgrid-utils.js'

const local = (y, m, d, h = 0, mi = 0, s = 0) => new Date(y, m - 1, d, h, mi, s).getTime()

const rows = [
  { name: 'Frozen Yogurt', calories: 159, calcium: '14%', created_at: '01/02/2024', tags: ['Cold', 'Sweet'] },
  { name: 'Eclair', calories: 262, calcium: '6%', created_at: '15/03/2024', tags: ['Sweet'] },
  { name: 'Cupcake', calories: 305, calcium: '3%', created_at: '5/4/2024', tags: [] },
  { name: 'KitKat', calories: null, calcium: '12%', created_at: null, tags: ['crunchy'] }
]

const cols = {
  name: { name: 'name', field: 'name', label: 'Name' },
  calories: { name: 'calories', field: 'calories', label: 'Calories', filter_type: 'number_range' },
  calcium: { name: 'calcium', field: 'calcium', label: 'Calcium', filter_type: 'select' },
  created: { name: 'created_at', field: 'created_at', label: 'Created', filter_type: 'date', date_format: 'DD/MM/YYYY' },
  tags: { name: 'tags', field: 'tags', label: 'Tags', filter_type: 'select', format: v => v.join(', ') }
}

const noCache = () => new Map()

test('fieldKey / getRawValue / getCellValue', () => {
  assert.equal(fieldKey(cols.name), 'name')
  assert.equal(fieldKey({ name: 'x', field: row => row.a }), 'x')
  assert.equal(fieldKey({ name: 'x', field: 'a', filter_key: 'k' }), 'k')
  assert.equal(getRawValue({ a: 1 }, { name: 'a' }), 1, 'falls back to name')
  assert.equal(getRawValue({ a: 2 }, { name: 'x', field: r => r.a * 2 }), 4)
  assert.equal(getCellValue(rows[0], cols.tags), 'Cold, Sweet')
})

test('normalizeColumn moves string formats to date_format without mutating', () => {
  const legacy = { name: 'd', field: 'd', filter_type: 'date', format: 'DD/MM/YYYY' }
  const norm = normalizeColumn(legacy)
  assert.notEqual(norm, legacy)
  assert.equal(norm.date_format, 'DD/MM/YYYY')
  assert.equal('format' in norm, false)
  assert.equal(legacy.format, 'DD/MM/YYYY', 'input untouched')
  assert.equal(normalizeColumn(cols.name), cols.name, 'no copy when not needed')
})

test('buildOptions: distinct, case-insensitive, flattened, sorted, skips empty', () => {
  const opts = buildOptions([...rows, { calcium: '14%' }, { calcium: '' }], cols.calcium)
  assert.deepEqual(opts.map(o => o.label), ['3%', '6%', '12%', '14%'])
  const tags = buildOptions(rows, cols.tags)
  assert.deepEqual(tags.map(o => o.value), ['cold', 'crunchy', 'sweet'])
  const fixed = buildOptions(rows, { name: 'x', filter_options: ['A', { label: 'Bee', value: 'B' }] })
  assert.deepEqual(fixed, [{ label: 'A', value: 'a' }, { label: 'Bee', value: 'b' }])
})

test('parseWithMask is lenient like moment but rejects invalid dates', () => {
  assert.equal(parseWithMask('01/02/2024', 'DD/MM/YYYY'), local(2024, 2, 1))
  assert.equal(parseWithMask('5/4/2024', 'DD/MM/YYYY'), local(2024, 4, 5))
  assert.equal(parseWithMask('20240305', 'YYYYMMDD'), local(2024, 3, 5))
  assert.equal(parseWithMask('2024-03-05 14:07:09', 'YYYY-MM-DD HH:mm:ss'), local(2024, 3, 5, 14, 7, 9))
  assert.equal(parseWithMask('03/05/24 2:30 PM', 'MM/DD/YY h:mm A'), local(2024, 3, 5, 14, 30))
  assert.equal(parseWithMask('12:15 am 1 Jan 2020', 'hh:mm a D MMM YYYY'), local(2020, 1, 1, 0, 15))
  assert.equal(parseWithMask('March 5, 2024', 'MMMM D, YYYY'), local(2024, 3, 5))
  assert.ok(isNaN(parseWithMask('31/02/2024', 'DD/MM/YYYY')), 'Feb 31 is invalid')
  assert.ok(isNaN(parseWithMask('45/01/2024', 'DD/MM/YYYY')))
  assert.ok(isNaN(parseWithMask('hello', 'DD/MM/YYYY')))
})

test('parseDate handles Date, timestamps, ISO and masks', () => {
  const d = new Date(2024, 0, 2)
  assert.equal(parseDate(d), d.getTime())
  assert.equal(parseDate(123), 123)
  assert.equal(parseDate('2024-01-02T00:00:00Z'), Date.UTC(2024, 0, 2))
  assert.equal(parseDate('02/01/2024', 'DD/MM/YYYY'), d.getTime())
  assert.ok(isNaN(parseDate(null)))
  assert.ok(isNaN(parseDate('')))
})

test('normalizeDateRange accepts QDate range models', () => {
  assert.deepEqual(normalizeDateRange('2024/01/02'), { from: '2024/01/02', to: '2024/01/02' })
  assert.deepEqual(normalizeDateRange(null), { from: '', to: '' })
  assert.deepEqual(normalizeDateRange({ from: 'a', to: 'b' }), { from: 'a', to: 'b' })
})

test('isFilterValueActive', () => {
  assert.equal(isFilterValueActive(cols.name, ''), false)
  assert.equal(isFilterValueActive(cols.name, 'x'), true)
  assert.equal(isFilterValueActive(cols.created, { from: '', to: '' }), false)
  assert.equal(isFilterValueActive(cols.created, '2024/01/01'), true)
  assert.equal(isFilterValueActive(cols.calories, { from: '', to: '' }), false)
  assert.equal(isFilterValueActive(cols.calories, { from: 0, to: '' }), true)
})

test('text filter: case-insensitive substring; null cells never match an active filter', () => {
  const preds = compileColumnFilters([cols.name, cols.created], { name: 'CUP', created_at: { from: '', to: '' } }, noCache)
  assert.equal(preds.length, 1, 'inactive date filter compiles to nothing')
  assert.deepEqual(applyPredicates(rows, preds).map(r => r.name), ['Cupcake'])
  // previously a null value in ANY column made the row bypass every filter
  const p2 = compileColumnFilters([cols.calories, cols.name], { calories: { from: 100, to: 200 }, name: 'kit' }, noCache)
  assert.deepEqual(applyPredicates(rows, p2), [])
})

test('date range filter is inclusive of the whole end day and caches parses', () => {
  const cache = new Map()
  const preds = compileColumnFilters([cols.created], { created_at: { from: '2024/02/01', to: '2024/04/05' } }, () => cache)
  assert.deepEqual(applyPredicates(rows, preds).map(r => r.name), ['Frozen Yogurt', 'Eclair', 'Cupcake'])
  assert.equal(cache.size, 3, 'each distinct raw value parsed once')
  const single = compileColumnFilters([cols.created], { created_at: '2024/03/15' }, noCache)
  assert.deepEqual(applyPredicates(rows, single).map(r => r.name), ['Eclair'])
  const withTime = { name: 't', field: 't', filter_type: 'date', date_format: 'DD/MM/YYYY HH:mm' }
  const p3 = compileColumnFilters([withTime], { t: '2024/03/15' }, noCache)
  assert.equal(applyPredicates([{ t: '15/03/2024 23:30' }], p3).length, 1)
})

test('number range filter supports open-ended ranges', () => {
  const run = val => applyPredicates(rows, compileColumnFilters([cols.calories], { calories: val }, noCache)).map(r => r.name)
  assert.deepEqual(run({ from: 200, to: 300 }), ['Eclair'])
  assert.deepEqual(run({ from: 260, to: '' }), ['Eclair', 'Cupcake'])
  assert.deepEqual(run({ from: '', to: 200 }), ['Frozen Yogurt'])
  assert.deepEqual(run({ from: '', to: '' }), rows.map(r => r.name))
})

test('select filters: tokens, arrays (any-of), null-safe', () => {
  const sel = compileSelectFilters([cols.calcium, cols.tags], { calcium: ['14%', '12%'], tags: [] })
  assert.deepEqual(applyPredicates(rows, sel).map(r => r.name), ['Frozen Yogurt', 'KitKat'])
  const tags = compileSelectFilters([cols.tags], { tags: ['sweet'] })
  assert.deepEqual(applyPredicates(rows, tags).map(r => r.name), ['Frozen Yogurt', 'Eclair'])
  const nulls = compileSelectFilters([cols.calories], { calories: ['159'] })
  assert.deepEqual(applyPredicates(rows, nulls).map(r => r.name), ['Frozen Yogurt'])
})

test('applyPredicates returns the same array when nothing is active', () => {
  assert.equal(applyPredicates(rows, []), rows)
})

test('groupRows keeps first-seen order', () => {
  const g = groupRows([{ k: 'b' }, { k: 'a' }, { k: 'b' }, { k: null }], { name: 'k' })
  assert.deepEqual([...g.keys()], ['b', 'a', ''])
  assert.equal(g.get('b').length, 2)
})

test('aggregate + formatAggregate', () => {
  const col = agg => ({ name: 'calories', field: 'calories', aggregate: agg })
  assert.equal(aggregate(rows, col('sum')), 726)
  assert.equal(aggregate(rows, col('count')), 3)
  assert.equal(aggregate(rows, col('avg')), 242)
  assert.equal(aggregate(rows, col('min')), 159)
  assert.equal(aggregate(rows, col('max')), 305)
  assert.equal(aggregate(rows, { name: 'calcium', aggregate: 'sum' }), 35, 'parses "14%" style values')
  assert.equal(aggregate([], col('sum')), null)
  assert.equal(aggregate(rows, col((values, r) => values.length + r.length)), 8)
  assert.equal(formatAggregate(null), '—')
  assert.equal(formatAggregate(1234.567), (1234.567).toLocaleString(undefined, { maximumFractionDigits: 2 }))
})

test('moveItem uses move (not swap) semantics', () => {
  const a = [0, 1, 2, 3]
  moveItem(a, 0, 3)
  assert.deepEqual(a, [1, 2, 3, 0])
  moveItem(a, 3, 1)
  assert.deepEqual(a, [1, 0, 2, 3])
  assert.equal(moveItem(a, 1, 9), false)
})

test('toCsv: BOM, quoting, formats, arrays', () => {
  const csv = toCsv([{ name: 'He said "hi"', tags: ['a', 'b'] }], [cols.name, cols.tags])
  assert.equal(csv, '﻿"Name","Tags"\r\n"He said ""hi""","a, b"')
})

/* ----------------------------------------------------------------- v1.2 */

import { sortRows, toggleSortModel, partitionPinned, pinOffsets, parseWidth, toTsv } from '../src/components/qgrid-utils.js'

test('sortRows: multi-column, stable, nulls first, numeric-aware strings, custom sort', () => {
  const rows = [
    { cat: 'b', n: 2, s: 'item 10' }, { cat: 'a', n: 2, s: 'item 2' },
    { cat: 'b', n: 1, s: 'item 1' }, { cat: 'a', n: null, s: 'x' }, { cat: 'a', n: 2, s: 'item 1' }
  ]
  const cols = { cat: { name: 'cat', field: 'cat' }, n: { name: 'n', field: 'n' }, s: { name: 's', field: 's' } }
  const r1 = sortRows(rows.slice(), [{ name: 'cat', descending: false }, { name: 'n', descending: true }], cols)
  assert.deepEqual(r1.map(r => r.cat + r.n + r.s), ['a2item 2', 'a2item 1', 'anullx', 'b2item 10', 'b1item 1'])
  const r2 = sortRows(rows.slice(), [{ name: 's', descending: false }], cols)
  assert.deepEqual(r2.map(r => r.s), ['item 1', 'item 1', 'item 2', 'item 10', 'x'])
  const pct = { p: { name: 'p', field: 'p', sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) } }
  assert.deepEqual(sortRows([{ p: '14%' }, { p: '3%' }, { p: '100%' }], [{ name: 'p', descending: true }], pct).map(r => r.p), ['100%', '14%', '3%'])
  assert.deepEqual(sortRows([1, 2], [{ name: 'missing' }], cols), [1, 2])
})

test('toggleSortModel cycles asc -> desc -> off and keeps other sorts', () => {
  let m = toggleSortModel([], 'a')
  assert.deepEqual(m, [{ name: 'a', descending: false }])
  m = toggleSortModel(m, 'b')
  m = toggleSortModel(m, 'a')
  assert.deepEqual(m, [{ name: 'a', descending: true }, { name: 'b', descending: false }])
  assert.deepEqual(toggleSortModel(m, 'a'), [{ name: 'b', descending: false }])
})

test('partitionPinned + pinOffsets', () => {
  const pins = { a: 'right', c: 'left', e: 'left' }
  const pinOf = c => pins[c.name] || null
  const cols = ['a', 'b', 'c', 'd', 'e'].map(name => ({ name }))
  const ordered = partitionPinned(cols, pinOf)
  assert.deepEqual(ordered.map(c => c.name), ['c', 'e', 'b', 'd', 'a'])
  const off = pinOffsets(ordered, pinOf, c => ({ c: 100, e: 50, a: 80 })[c.name] || 10, 40)
  assert.deepEqual(off, {
    c: { side: 'left', offset: 40, edge: false },
    e: { side: 'left', offset: 140, edge: true },
    a: { side: 'right', offset: 0, edge: true }
  })
})

test('parseWidth', () => {
  assert.equal(parseWidth(120), 120)
  assert.equal(parseWidth('90px'), 90)
  assert.equal(parseWidth('90'), 90)
  assert.equal(parseWidth('20%'), null)
  assert.equal(parseWidth(undefined), null)
})

test('toTsv: header, format, tabs/newlines flattened', () => {
  const cols = [{ name: 'n', label: 'Name', field: 'n' }, { name: 'p', label: 'Price', field: 'p', format: v => '$' + v }]
  assert.equal(toTsv([{ n: 'a\tb\nc', p: 2 }], cols), 'Name\tPrice\na b c\t$2')
  assert.equal(toTsv([{ n: 'x', p: 1 }], cols, false), 'x\t$1')
})
