<template>
  <doc-page title="Sorting" lead="Single-column sorting from QTable, plus multi-column sorting with Shift + click." is-new>
    <h2>Single column</h2>
    <p>Mark columns <code>sortable: true</code>. Click a header to sort ascending, again for descending, a third time to clear. Use <code>sort</code> or <code>rawSort</code> for custom comparisons — exactly like QTable.</p>

    <h2>Multi-column sort</h2>
    <p>
      Add <code>multi_sort</code>. A plain click still sorts by one column; <b>Shift + click</b> adds the column as the next sort key
      (asc → desc → removed). Headers show the priority (1, 2, 3…) and expose <code>aria-sort</code>.
    </p>
    <doc-example file="MultiSort" />

    <h3>Sort model</h3>
    <p>The current sort is an array, highest priority first. It is emitted with <code>@sort-change</code>, saved by <code>state_key</code>, sent to your server in <code>@OnRequest</code> as <code>sort_model</code>, and can be set with <code>applySortModel()</code>:</p>
    <code-block lang="js" :code="model" />
    <callout-note type="note">Multi-column sorting is stable: rows that compare equal on every key keep their original order. Strings are compared numeric-aware, so “item 2” comes before “item 10”.</callout-note>
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
const model = `// e.g. from a "Reset sort" button or a saved view
grid.value.applySortModel([
  { name: 'region', descending: false },
  { name: 'total', descending: true }
])`
</script>
