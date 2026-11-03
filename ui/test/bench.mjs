// Micro-benchmark: QGrid v1.0.31 filtering vs the current implementation.
// Run with: npm run bench
import {
  compileColumnFilters, compileSelectFilters, applyPredicates, buildOptions
} from '../src/components/qgrid-utils.js'

const ROWS = Number(process.argv[2] || 50000)
const words = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta']
const data = Array.from({ length: ROWS }, (_, i) => ({
  name: words[i % 8] + ' ' + i,
  city: ['Paris', 'Pune', 'Berlin', 'Austin', 'Tokyo'][i % 5],
  calories: (i * 37) % 900,
  status: ['active', 'inactive', 'pending'][i % 3],
  note: 'note ' + (i % 97)
}))
const columns = [
  { name: 'name', field: 'name' },
  { name: 'city', field: 'city', filter_type: 'select' },
  { name: 'calories', field: 'calories', filter_type: 'number_range' },
  { name: 'status', field: 'status', filter_type: 'select' },
  { name: 'note', field: 'note' }
]

/* ------------------------------ v1.0.31 algorithm (verbatim, minus moment) */

function oldGetFilteredData (finalColumn, filterData) {
  const tableColumns = finalColumn.map(item => item.field)
  return data.filter(item => {
    for (let i = 0; i < tableColumns.length; i++) {
      if (filterData[tableColumns[i]] == '') continue
      if (item[tableColumns[i]] == null) return true
      if (!Object.prototype.hasOwnProperty.call(finalColumn[i], 'filter_type') || finalColumn[i].filter_type == 'text') {
        if (tableColumns[i] in filterData && item[tableColumns[i]].toString().toLowerCase().indexOf(filterData[tableColumns[i]].toLowerCase()) == -1) return false
      }
      if (Object.prototype.hasOwnProperty.call(finalColumn[i], 'filter_type') && finalColumn[i].filter_type == 'number_range') {
        if (tableColumns[i] in filterData && typeof filterData[tableColumns[i]].from != 'string' && typeof filterData[tableColumns[i]].to != 'string' && !(parseFloat(item[tableColumns[i]]) >= filterData[tableColumns[i]].from && parseFloat(item[tableColumns[i]]) <= filterData[tableColumns[i]].to)) return false
      }
    }
    return true
  })
}

function oldGetFilteredValuesData (rows, cols, selected) {
  return rows.filter(item => {
    for (let i = 0; i < cols.length; i++) {
      if (selected[cols[i].field].length == 0) continue
      const fieldVal = item[cols[i].field]
      const fieldTokens = Array.isArray(fieldVal)
        ? fieldVal.map(v => v.toString().toLowerCase().replace(/_/g, '_'))
        : [fieldVal.toString().toLowerCase().replace(/_/g, '_')]
      if (!selected[cols[i].field].some(sel => fieldTokens.includes(sel))) return false
    }
    return true
  })
}

function oldGetColumnOptions (column) {
  const allValues = data.map(item => item[column])
  const flat = [].concat(...allValues.map(v => (Array.isArray(v) ? v : [v])))
  return [...new Set(flat)].map(col => ({ label: col.toString(), value: col.toString().toLowerCase().replace(/_/g, '_') }))
}

/* ------------------------------------------------------------------ runner */

function time (label, fn, iterations = 20) {
  try { fn() } // warm-up
  catch (err) { return { label, ms: NaN, error: err.constructor.name } }
  const start = process.hrtime.bigint()
  for (let i = 0; i < iterations; i++) fn()
  const ms = Number(process.hrtime.bigint() - start) / 1e6 / iterations
  return { label, ms }
}

const filterData = { name: 'ta 1', city: '', calories: { from: 100, to: 600 }, status: '', note: 'note 1' }
const selections = { name: [], city: ['paris', 'pune'], calories: [], status: ['active', 'pending'], note: [] }
const noFilters = { name: '', city: '', calories: { from: '', to: '' }, status: '', note: '' }
const noSelections = { name: [], city: [], calories: [], status: [], note: [] }
const cache = () => new Map()

// a render of the filter row calls getColumnOptions ~5x per select column (v1.0.31)
const OPTION_CALLS_PER_RENDER = 5 * 2

const results = [
  ['filter: text + number + 2 select filters',
    time('old', () => oldGetFilteredValuesData(oldGetFilteredData(columns, filterData), columns, selections)),
    time('new', () => applyPredicates(applyPredicates(data, compileColumnFilters(columns, filterData, cache)), compileSelectFilters(columns, selections)))],
  ['filter: nothing active (initial render)',
    time('old', () => oldGetFilteredValuesData(oldGetFilteredData(columns, noFilters), columns, noSelections)),
    time('new', () => applyPredicates(applyPredicates(data, compileColumnFilters(columns, noFilters, cache)), compileSelectFilters(columns, noSelections)))],
  ['select options (old: every render / new: cached)',
    time('old', () => { for (let i = 0; i < OPTION_CALLS_PER_RENDER; i++) oldGetColumnOptions(i % 2 ? 'city' : 'status') }, 5),
    // computed once per data change, then served from cache on every render
    time('new', () => { buildOptions(data, columns[1]); buildOptions(data, columns[3]) }, 5)]
]

console.log(`\nQGrid filtering benchmark - ${ROWS.toLocaleString()} rows (avg ms per run)\n`)
results.forEach(([name, oldRes, newRes]) => {
  if (oldRes.error) {
    console.log(`${name.padEnd(44)} old  CRASHES (${oldRes.error})   new ${newRes.ms.toFixed(2).padStart(8)} ms`)
    return
  }
  const speedup = oldRes.ms / newRes.ms
  console.log(`${name.padEnd(44)} old ${oldRes.ms.toFixed(2).padStart(8)} ms   new ${newRes.ms.toFixed(2).padStart(8)} ms   ${speedup >= 100 ? '>100' : speedup.toFixed(1)}x`)
})
console.log()
