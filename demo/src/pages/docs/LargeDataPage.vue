<template>
  <doc-page title="Large & server-side data" lead="Virtual scrolling for big local datasets, and a filter model for your API.">
    <h2>Virtual scroll</h2>
    <p>
      <code>virtual_scroll</code> renders only the rows in view. Give the grid a <code>height</code>; the header (and filter row) stay sticky.
      Filtering 50,000 rows takes a few milliseconds.
    </p>
    <doc-example file="VirtualScroll" />
    <callout-note type="tip" title="Tip">Freeze big static datasets (<code>Object.freeze(rows)</code>) so Vue doesn't make every row reactive.</callout-note>

    <h2>Server-side data</h2>
    <p>
      With <code>ssr_pagination</code> you own <code>pagination</code> and answer <code>@OnRequest</code>. Add <code>server_side_filters</code> to stop client-side
      filtering: every column filter change triggers a request whose payload includes a <code>filters</code> model.
    </p>
    <code-block lang="json" title="@OnRequest payload · filters" :code="model" />
    <doc-example file="ServerSide" />

    <h2>Save and restore state</h2>
    <p>
      <code>state_key</code> remembers filters, sort, rows per page, column order &amp; visibility, grouping and the filter row in <code>localStorage</code>.
      Use <code>getState()</code> / <code>setState()</code> / <code>@state-change</code> to store it elsewhere (e.g. per user on your server).
    </p>
    <doc-example file="StatePersistence" />
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
const model = `{
  "name":       { "type": "text", "value": "cake" },
  "calories":   { "type": "number_range", "value": { "from": 100, "to": "" } },
  "created_at": { "type": "date", "value": { "from": "2024/01/01", "to": "2024/03/31" } },
  "region":     { "type": "select", "values": ["north", "east"] }
}`
</script>
