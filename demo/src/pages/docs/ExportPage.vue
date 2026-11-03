<template>
  <doc-page title="Export" lead="Real Excel and CSV files of exactly what the user sees — no extra dependency.">
    <h2>Buttons</h2>
    <p><code>excel_download</code> and <code>csv_download</code> add export buttons; <code>file_name</code> names the file.</p>
    <doc-example file="ExcelExport" />

    <h2>What gets exported</h2>
    <ul>
      <li>Rows after column filters, header filters and global search, in the current sort order — all pages.</li>
      <li>Visible columns only, in their current (dragged) order, with their <code>label</code> as header.</li>
      <li>Values through each column's <code>format</code> function.</li>
    </ul>

    <h2>Excel details</h2>
    <ul>
      <li>Numbers and booleans keep their type; <code>Date</code> objects become real Excel dates.</li>
      <li>Bold, frozen header row and auto-sized columns.</li>
      <li>Written by a ~3 KB built-in writer — nothing to install or lazy-load.</li>
    </ul>
    <p>CSV files are UTF-8 with a BOM so Excel opens accented characters correctly.</p>

    <h2>From code</h2>
    <code-block lang="vue" :code="api" />
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
const api = `<q-grid ref="grid" :data="rows" :columns="columns" file_name="report" />

<script setup>
const grid = ref(null)
const exportXlsx = () => grid.value.exportTable('xlsx') // or 'csv'
<\/script>`
</script>
