<template>
  <doc-page title="QGrid API" lead="Every prop, slot, event and method. Also available offline with `quasar describe QGrid`.">
    <h2>Component</h2>
    <api-reference />

    <h2 id="column-definition">Column definition</h2>
    <p>
      Columns are regular <a href="https://quasar.dev/vue-components/table#defining-the-columns" target="_blank" rel="noopener">QTable column definitions</a>
      (<code>name</code>, <code>label</code>, <code>field</code>, <code>align</code>, <code>sortable</code>, <code>sort</code>, <code>format</code>,
      <code>required</code>, <code>classes</code>, <code>style</code>, <code>headerClasses</code>…) plus these QGrid keys:
    </p>
    <table class="doc-table">
      <thead><tr><th>Key</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr v-for="row in columnKeys" :key="row[0]">
          <td><code>{{ row[0] }}</code></td>
          <td class="mono muted">{{ row[1] }}</td>
          <td>{{ row[2] }}</td>
        </tr>
      </tbody>
    </table>

    <h2>Describe from the CLI</h2>
    <p>The App Extension registers the API JSON with Quasar CLI, so you can print it from your project:</p>
    <code-block lang="bash" code="quasar describe QGrid" />
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import ApiReference from '../../components/ApiReference.vue'
import CodeBlock from '../../components/CodeBlock.vue'

const columnKeys = [
  ['filter_type', "'text' | 'select' | 'date' | 'number_range'", "Filter rendered in the filter row. Default: 'text'."],
  ['date_format', 'String', "How dates in this column are written, e.g. 'DD/MM/YYYY' (tokens: YYYY YY MMMM MMM MM M DD D HH hh mm ss SSS A). The legacy `format: 'DD/MM/YYYY'` string still works."],
  ['filter_options', 'Array', 'Fixed option list for select / header filters (strings or { label, value }). Useful with server-side data.'],
  ['show_filter', 'Boolean', 'Show the header value-filter menu on this column (requires header_filter).'],
  ['grouping', 'Boolean', 'Offer this column in the "Group By" selector (requires groupby_filter).'],
  ['aggregate', "'sum' | 'avg' | 'min' | 'max' | 'count' | Function", 'Show a total for this column in the footer. A function receives (values, rows, col).'],
  ['aggregate_label', 'String', 'Label shown before the total (defaults to Sum / Avg / ...).'],
  ['aggregate_format', 'Function', 'Format the total, e.g. v => v.toFixed(1) + " g".'],
  ['editable', 'Boolean', 'Edit cells of this column in place (default body).'],
  ['edit_type', "'text' | 'number' | 'select' | 'textarea'", "Editor used for inline editing. Default: 'text'."],
  ['edit_options', 'Array', "Options of the 'select' editor (defaults to the column's distinct values)."],
  ['validate', 'Function', '(value, row) => true | "error message". Blocks saving invalid values.'],
  ['edit_buttons', 'Boolean', 'Show Set / Cancel buttons in the editor.']
]
</script>
