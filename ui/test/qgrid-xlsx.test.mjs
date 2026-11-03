// Run with: npm test   (Node 22+). The round-trip test needs python3 + openpyxl (skipped otherwise).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { toXlsx, crc32, columnLetter } from '../src/components/qgrid-xlsx.js'

test('crc32 matches the reference value', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xCBF43926)
})

test('columnLetter', () => {
  assert.deepEqual([0, 25, 26, 27, 51, 52, 701, 702].map(columnLetter), ['A', 'Z', 'AA', 'AB', 'AZ', 'BA', 'ZZ', 'AAA'])
})

function hasOpenpyxl () {
  try {
    execFileSync('python3', ['-c', 'import openpyxl'], { stdio: 'ignore' })
    return true
  }
  catch (e) {
    return false
  }
}

test('toXlsx produces a workbook openpyxl can read back (typed cells)', { skip: hasOpenpyxl() ? false : 'python3 + openpyxl not available' }, () => {
  const cols = [
    { name: 'name', label: 'Name & "Title"', field: 'name' },
    { name: 'qty', label: 'Qty', field: 'qty' },
    { name: 'ok', label: 'OK', field: 'ok' },
    { name: 'when', label: 'When', field: 'when' },
    { name: 'tags', label: 'Tags', field: 'tags', format: v => v.join('|') },
    { name: 'pct', label: 'Pct', field: 'pct' }
  ]
  const rows = [
    { name: '<b>Ünïcödé</b> \u0001ctrl', qty: 3.5, ok: true, when: new Date(2024, 0, 15), tags: ['x', 'y'], pct: '14%' },
    { name: 'Second', qty: -2, ok: false, when: null, tags: [], pct: '' }
  ]

  const dir = mkdtempSync(join(tmpdir(), 'qgrid-xlsx-'))
  const file = join(dir, 'out.xlsx')
  writeFileSync(file, toXlsx(rows, cols, { sheetName: 'My: Sheet/1' }))

  const script = `
import json, sys, openpyxl
wb = openpyxl.load_workbook(sys.argv[1])
ws = wb.active
out = {"title": ws.title, "freeze": ws.freeze_panes, "rows": []}
for row in ws.iter_rows(values_only=True):
    out["rows"].append([v.isoformat() if hasattr(v, "isoformat") else v for v in row])
out["bold"] = ws["A1"].font.b
print(json.dumps(out))
`
  const result = JSON.parse(execFileSync('python3', ['-c', script, file]).toString())
  assert.equal(result.title, 'My  Sheet 1')
  assert.equal(result.freeze, 'A2')
  assert.equal(result.bold, true)
  assert.deepEqual(result.rows[0], ['Name & "Title"', 'Qty', 'OK', 'When', 'Tags', 'Pct'])
  assert.deepEqual(result.rows[1], ['<b>Ünïcödé</b> ctrl', 3.5, true, '2024-01-15T00:00:00', 'x|y', '14%'])
  assert.deepEqual(result.rows[2], ['Second', -2, false, null, null, null])

  // the zip itself must be valid
  execFileSync('unzip', ['-tq', file])
})
