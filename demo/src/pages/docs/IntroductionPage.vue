<template>
  <doc-page title="QGrid" lead="A free, open-source data grid for Quasar and Vue 3, built on top of QTable.">
    <p>
      QGrid is a <a href="https://quasar.dev/app-extensions/introduction" target="_blank" rel="noopener">Quasar App Extension</a>
      that turns <code>QTable</code> into a full data grid. Everything QTable does keeps working, and every extra feature is a single prop:
      filters, grouping, totals, editing, drag &amp; drop, export, virtual scroll and state persistence.
    </p>

    <div class="doc-cards">
      <doc-card to="/docs/installation" title="Install" desc="Add QGrid to a Quasar app in one command." icon="download" :tone="0" />
      <doc-card to="/docs/quickstart" title="Quickstart" desc="Your first grid with filters and export in 5 minutes." icon="bolt" :tone="1" />
      <doc-card to="/docs/examples" title="Examples" desc="25 live examples with source code." icon="grid_view" :tone="2" />
    </div>

    <h2>Try it</h2>
    <doc-example file="Aggregation" />

    <h2>Platform capabilities</h2>
    <table class="doc-table">
      <thead><tr><th>Goal</th><th>Guide</th><th>Props</th></tr></thead>
      <tbody>
        <tr><td>Filter by column, value or range</td><td><router-link to="/docs/filtering">Filtering</router-link></td><td><code>columns_filter</code> <code>header_filter</code> <code>global_search</code></td></tr>
        <tr><td>Group rows and show totals</td><td><router-link to="/docs/grouping">Grouping &amp; totals</router-link></td><td><code>groupby_filter</code>, column <code>aggregate</code></td></tr>
        <tr><td>Download what's on screen</td><td><router-link to="/docs/export">Export</router-link></td><td><code>excel_download</code> <code>csv_download</code></td></tr>
        <tr><td>Edit cells in place</td><td><router-link to="/docs/editing">Editing</router-link></td><td>column <code>editable</code></td></tr>
        <tr><td>Reorder rows &amp; columns</td><td><router-link to="/docs/drag-and-drop">Drag &amp; drop</router-link></td><td><code>draggable</code> <code>draggable_columns</code></td></tr>
        <tr><td>Handle big or remote data</td><td><router-link to="/docs/large-data">Large &amp; server-side data</router-link></td><td><code>virtual_scroll</code> <code>ssr_pagination</code> <code>state_key</code></td></tr>
        <tr><td>Render cells, rows or details yourself</td><td><router-link to="/docs/customization">Slots &amp; customization</router-link></td><td><code>#body-cell-[name]</code> <code>#detail</code> <code>labels</code></td></tr>
      </tbody>
    </table>

    <h2>Architecture</h2>
    <ol>
      <li><b>quasar-ui-qgrid</b> — the <code>QGrid</code> Vue component (also usable without Quasar CLI, as a Vue plugin or UMD).</li>
      <li><b>quasar-app-extension-qgrid</b> — registers the component in a Quasar CLI app (Vite v1–v3 or Webpack v3–v4) and the <code>quasar describe QGrid</code> API.</li>
      <li><b>QTable</b> — QGrid renders a regular QTable, so any QTable prop, event or slot can be passed through.</li>
    </ol>
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
import DocCard from '../../components/DocCard.vue'
</script>
