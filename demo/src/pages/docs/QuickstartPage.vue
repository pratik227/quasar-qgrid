<template>
  <doc-page title="Quickstart" lead="Build a filterable, exportable grid in a few lines.">
    <h2>1. Install</h2>
    <code-block lang="bash" code="quasar ext add qgrid" />

    <h2>2. Describe your columns</h2>
    <p>Columns are QTable columns. Add <code>filter_type</code> to pick the filter of each column.</p>
    <code-block lang="js" :code="columns" />

    <h2>3. Render the grid</h2>
    <code-block lang="vue" title="DessertsPage.vue" :code="usage" />
    <doc-example file="Basic" />

    <h2>4. Turn features on</h2>
    <p>Every feature is opt-in. A few popular ones:</p>
    <table class="doc-table">
      <thead><tr><th>Prop</th><th>What it adds</th></tr></thead>
      <tbody>
        <tr><td><code>columns_filter</code></td><td>A filter under every header</td></tr>
        <tr><td><code>header_filter</code></td><td>Excel-like value lists in headers (columns with <code>show_filter</code>)</td></tr>
        <tr><td><code>global_search</code></td><td>One search box for all columns</td></tr>
        <tr><td><code>excel_download</code> / <code>csv_download</code></td><td>Export buttons</td></tr>
        <tr><td><code>column_chooser</code></td><td>Show / hide columns</td></tr>
        <tr><td><code>groupby_filter</code></td><td>Group by columns with <code>grouping: true</code></td></tr>
        <tr><td><code>state_key</code></td><td>Remember filters, sort and columns</td></tr>
      </tbody>
    </table>
    <p>Next: <router-link to="/docs/columns">Columns</router-link> · <router-link to="/docs/api">Full API</router-link></p>
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
import DocCard from '../../components/DocCard.vue'

const columns = `const columns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true, required: true },
  { name: 'category', label: 'Category', field: 'category', filter_type: 'select' },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true, filter_type: 'number_range' },
  { name: 'added', label: 'Added', field: 'added', filter_type: 'date', date_format: 'DD/MM/YYYY' },
  { name: 'price', label: 'Price', field: 'price', format: v => '$' + v.toFixed(2), aggregate: 'sum' }
]`

const usage = `<template>
  <q-grid
    :data="rows"
    :columns="columns"
    row_key="name"
    columns_filter
    global_search
    excel_download
    file_name="desserts"
  />
</template>`
</script>
