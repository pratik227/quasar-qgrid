<template>
  <doc-page title="Interaction" lead="Context menu, clipboard, pinned rows and a status bar — the power-user features of desktop grids." is-new>
    <h2>Context menu</h2>
    <p>
      <code>context_menu</code> adds a right-click menu on cells and headers: copy cell / row / selection, pin or unpin rows and columns,
      auto-size or hide a column, and export. Pass an array to append your own items:
    </p>
    <code-block lang="js" :code="items" />

    <h2>Clipboard</h2>
    <p>
      With <code>copy_selection</code>, select rows and press <kbd>Ctrl</kbd> / <kbd>⌘</kbd> + <kbd>C</kbd>: rows are copied as tab separated values
      (with a header) that paste straight into Excel or Google Sheets. Call <code>copyRows(rows)</code> from your own buttons; <code>@copy</code> tells you what was copied.
    </p>

    <h2>Status bar</h2>
    <p><code>status_bar</code> shows the total, filtered and selected row counts. While rows are selected it also shows their totals for every column with an <code>aggregate</code>.</p>
    <doc-example file="ContextMenu" />

    <h2>Pinned rows</h2>
    <p>
      <code>pinned_top_rows</code> / <code>pinned_bottom_rows</code> keep rows visible above or below the body, whatever the filters, sort or page.
      Pin real rows (they leave the body) or display-only rows such as a target line. Both support <code>v-model</code>, so pinning from the context menu updates your state.
    </p>
    <doc-example file="RowPinning" />
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
const items = `<q-grid
  :data="rows"
  :columns="columns"
  :context_menu="[
    { label: 'Open order', icon: 'open_in_new', handler: ({ row }) => router.push('/orders/' + row.id) },
    { separator: true },
    { label: 'Delete', icon: 'delete', handler: ({ row, selected }) => remove(selected.length ? selected : [row]) }
  ]"
  @context-action="onAction"
/>`
</script>
