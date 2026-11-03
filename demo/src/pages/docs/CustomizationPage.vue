<template>
  <doc-page title="Slots & customization" lead="Override a cell, a row, the header or the toolbar — or add a detail row.">
    <h2>Custom cells</h2>
    <p><code>#body-cell-[name]</code> replaces one column's cells and keeps everything else (selection, editing, drag &amp; drop).</p>
    <doc-example file="CustomCells" />

    <h2>Master / detail</h2>
    <p>Provide a <code>#detail</code> slot and every row gets an expand toggle.</p>
    <doc-example file="MasterDetail" />

    <h2>Whole rows and headers</h2>
    <p>
      <code>#body</code> and <code>#header</code> receive the full QTable scope, so <code>&lt;q-tr :props="props"&gt;</code>,
      <code>props.selected</code> and <code>props.expand</code> work exactly like in QTable.
    </p>
    <doc-example file="SlotDemo" />

    <h2>Toolbar</h2>
    <p><code>#top_right</code> replaces the toolbar; its scope exposes <code>exportTable</code>, <code>toggleFullscreen</code>, <code>clear_filters</code>, <code>toggle_column</code>…
    Any other QTable slot (<code>top-left</code>, <code>no-data</code>, <code>pagination</code>…) is forwarded.</p>

    <h2>Labels (i18n) and icons</h2>
    <code-block lang="vue" :code="labels" />

    <h2>Any QTable prop</h2>
    <p>Unknown props and listeners go straight to QTable: <code>rows-per-page-options</code>, <code>no-data-label</code>, <code>table-style</code>, <code>@row-dblclick</code>…</p>
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
const labels = `<q-grid
  :data="rows"
  :columns="columns"
  global_search
  :labels="{ search: 'Suchen', selectAll: 'Alle auswählen', clear: 'Leeren', exportExcel: 'Excel-Export' }"
  :icons="{ search: 'mdi-magnify' }"
/>`
</script>
