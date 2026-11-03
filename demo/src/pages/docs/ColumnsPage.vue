<template>
  <doc-page title="Columns" lead="QGrid columns are QTable columns with a few optional extras.">
    <h2>Basics</h2>
    <code-block lang="js" :code="basic" />
    <p>
      Everything from <a href="https://quasar.dev/vue-components/table#defining-the-columns" target="_blank" rel="noopener">QTable's column definition</a>
      works: <code>field</code> can be a function, <code>format</code> formats display &amp; export, <code>required</code> columns can't be hidden.
    </p>

    <h2>QGrid extras</h2>
    <table class="doc-table">
      <thead><tr><th>Key</th><th>Used by</th></tr></thead>
      <tbody>
        <tr><td><code>filter_type</code>, <code>date_format</code>, <code>filter_options</code></td><td><router-link to="/docs/filtering">Filtering</router-link></td></tr>
        <tr><td><code>show_filter</code></td><td>Header filters</td></tr>
        <tr><td><code>grouping</code>, <code>aggregate</code>, <code>aggregate_label</code>, <code>aggregate_format</code></td><td><router-link to="/docs/grouping">Grouping &amp; totals</router-link></td></tr>
        <tr><td><code>editable</code>, <code>edit_type</code>, <code>edit_options</code>, <code>validate</code></td><td><router-link to="/docs/editing">Editing</router-link></td></tr>
      </tbody>
    </table>
    <p>See the full list in the <router-link to="/docs/api#column-definition">API reference</router-link>.</p>

    <h2>Styling columns</h2>
    <doc-example file="CustomColumn" />

    <h2>Showing and hiding columns</h2>
    <p>Pass <code>visible_columns</code>, or let users decide with <code>column_chooser</code>:</p>
    <doc-example file="ColumnChooser" />
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
const basic = `const columns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true, required: true },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true },
  { name: 'ratio', label: 'Fat ratio', field: row => row.fat / row.calories, format: v => (v * 100).toFixed(1) + '%' }
]`
</script>
