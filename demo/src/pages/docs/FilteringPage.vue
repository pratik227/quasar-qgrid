<template>
  <doc-page title="Filtering" lead="Four column filter types, Excel-like header filters and a global search — combinable.">
    <h2>Filter row</h2>
    <p>Add <code>columns_filter</code> and choose a <code>filter_type</code> per column:</p>
    <table class="doc-table">
      <thead><tr><th>filter_type</th><th>Input</th><th>Matches</th></tr></thead>
      <tbody>
        <tr><td><code>'text'</code> (default)</td><td>Text input</td><td>Case-insensitive "contains"</td></tr>
        <tr><td><code>'select'</code></td><td>Multi-select with Select All</td><td>Any selected value (array fields match per item)</td></tr>
        <tr><td><code>'date'</code></td><td>Date range picker</td><td>Dates within the range (whole days, inclusive)</td></tr>
        <tr><td><code>'number_range'</code></td><td>From / To</td><td>Numbers in range — either side can be empty</td></tr>
      </tbody>
    </table>
    <doc-example file="NumberRange" />

    <h3>Dates</h3>
    <p>Tell QGrid how dates are written with <code>date_format</code> (moment-style tokens). <code>Date</code> objects, timestamps and ISO strings work without it.</p>
    <code-block lang="js" code="{ name: 'created_at', label: 'Created', field: 'created_at', filter_type: 'date', date_format: 'DD/MM/YYYY' }" />
    <callout-note type="note">The legacy <code>format: 'DD/MM/YYYY'</code> string still works — QGrid moves it to <code>date_format</code> so QTable's own <code>format</code> function keeps working.</callout-note>
    <doc-example file="DateRange" />

    <h2>Header filters</h2>
    <p>With <code>header_filter</code>, columns marked <code>show_filter: true</code> get a filter button listing every distinct value, with search and Select All.</p>
    <doc-example file="HeaderFilter" />

    <h2>Global search</h2>
    <p><code>global_search</code> adds a search box (debounced) that looks in every column. Use <code>global_filter</code> to drive it from your own input.</p>

    <h2>Clearing &amp; styling</h2>
    <p>
      <code>clear_filters</code> shows a "Clear filters" button while anything is filtered (or call <code>clearFilters()</code>).
      <code>columns_filter_toggle</code> lets users hide the filter row, and <code>filter_input_props</code> restyles every input.
    </p>
    <doc-example file="FilterCustomization" />

    <h2>Server-side filtering</h2>
    <p>See <router-link to="/docs/large-data">Large &amp; server-side data</router-link>.</p>
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
</script>
