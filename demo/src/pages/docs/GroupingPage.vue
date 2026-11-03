<template>
  <doc-page title="Grouping & totals" lead="Group rows by a column and add footer totals that follow every filter.">
    <h2>Grouping</h2>
    <p>Mark columns with <code>grouping: true</code> and enable <code>groupby_filter</code>. Users pick the column from the toolbar; each group shows its row count and expands to its rows.</p>
    <doc-example file="Grouping" />

    <h2>Footer totals</h2>
    <p>Add <code>aggregate</code> to a column:</p>
    <table class="doc-table">
      <thead><tr><th>Value</th><th>Result</th></tr></thead>
      <tbody>
        <tr><td><code>'sum'</code> / <code>'avg'</code> / <code>'min'</code> / <code>'max'</code></td><td>Over numeric values ("14%" counts as 14)</td></tr>
        <tr><td><code>'count'</code></td><td>Non-empty values</td></tr>
        <tr><td><code>(values, rows, col) =&gt; any</code></td><td>Anything you like</td></tr>
      </tbody>
    </table>
    <p>Totals use the rows left after column filters <em>and</em> global search, across all pages. Format them with <code>aggregate_format</code> and rename the label with <code>aggregate_label</code>.</p>
    <doc-example file="Aggregation" />
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
</script>
