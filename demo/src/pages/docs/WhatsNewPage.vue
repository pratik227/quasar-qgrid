<template>
  <doc-page title="What's new in 1.2" lead="Column pinning & resizing, multi-column sort, context menu, clipboard, pinned rows and a status bar." is-new>
    <h2>1.2</h2>
    <table class="doc-table">
      <thead><tr><th>Feature</th><th>How</th></tr></thead>
      <tbody>
        <tr><td>Column pinning (freeze left / right)</td><td>column <code>pinned</code>, context menu, <code>setColumnPin()</code></td></tr>
        <tr><td>Column resizing + auto-size</td><td><code>resizable_columns</code>, column <code>width</code>, <code>@column-resize</code></td></tr>
        <tr><td>Multi-column sort</td><td><code>multi_sort</code> (Shift + click), <code>@sort-change</code>, <code>sort_model</code> in <code>@OnRequest</code></td></tr>
        <tr><td>Context menu</td><td><code>context_menu</code> (built-in actions + your items)</td></tr>
        <tr><td>Clipboard copy</td><td><code>copy_selection</code> (Ctrl/⌘ + C), <code>copyRows()</code></td></tr>
        <tr><td>Pinned rows</td><td><code>pinned_top_rows</code>, <code>pinned_bottom_rows</code> (v-model)</td></tr>
        <tr><td>Status bar with selection totals</td><td><code>status_bar</code></td></tr>
        <tr><td>Accessibility</td><td><code>aria-sort</code> on headers, labelled resize handles</td></tr>
      </tbody>
    </table>
    <p>Column widths, pins and the sort model are part of <code>getState()</code> / <code>state_key</code>. Everything is opt-in; nothing changes for existing grids.</p>

    <h2>1.1 · Compatibility</h2>
    <ul>
      <li>The App Extension now runs on <b>@quasar/app-vite v3</b> (it used to stop the build there), as well as app-vite v1/v2 and app-webpack v3/v4.</li>
      <li>No more deprecated <code>quasar/wrappers</code> import; <code>quasar describe QGrid</code> is registered.</li>
      <li><code>moment</code> is no longer a dependency, and build tools no longer get installed into your app.</li>
    </ul>

    <h2>1.1 · Performance</h2>
    <ul>
      <li>Filters are compiled once per change and evaluated with tight loops; no filter = no work.</li>
      <li>Select / header filter values are computed once per data change instead of several times per render
        (previously this crashed with ~150k+ rows).</li>
      <li>Ignored-rows lookups went from O(n²) to O(n); SortableJS is lazy-loaded only when drag &amp; drop is on.</li>
    </ul>
    <code-block lang="bash" title="ui/ · npm run bench (50,000 rows)" :code="bench" />

    <h2>1.1 · New features</h2>
    <table class="doc-table">
      <thead><tr><th>Feature</th><th>How</th></tr></thead>
      <tbody>
        <tr><td>Real Excel export</td><td><code>excel_download</code> now writes .xlsx (was CSV)</td></tr>
        <tr><td>Footer totals</td><td>column <code>aggregate</code></td></tr>
        <tr><td>Inline editing + validation</td><td>column <code>editable</code>, <code>validate</code>, <code>@cell-edit</code></td></tr>
        <tr><td>Master / detail</td><td><code>#detail</code> slot</td></tr>
        <tr><td>Column chooser</td><td><code>column_chooser</code>, <code>v-model:visible_columns</code></td></tr>
        <tr><td>Searchable header filters</td><td>built in</td></tr>
        <tr><td>Virtual scroll + sticky header</td><td><code>virtual_scroll</code>, <code>height</code>, <code>sticky_header</code></td></tr>
        <tr><td>Save &amp; restore state</td><td><code>state_key</code>, <code>getState()</code>/<code>setState()</code></td></tr>
        <tr><td>Server-side column filters</td><td><code>server_side_filters</code>, <code>filters</code> in <code>@OnRequest</code></td></tr>
        <tr><td>Cell / header-cell slots</td><td><code>#body-cell-[name]</code>, <code>#header-cell-[name]</code></td></tr>
        <tr><td>Any QTable prop / slot</td><td>passed straight through</td></tr>
        <tr><td>i18n</td><td><code>labels</code> prop</td></tr>
      </tbody>
    </table>

    <h2>1.1 · Fixes</h2>
    <ul>
      <li>Global search / default rendering / export crashed on date columns declared with <code>format: 'DD/MM/YYYY'</code>.</li>
      <li>A <code>null</code> value in any column made a row bypass every filter.</li>
      <li>Row drag swapped rows (instead of moving them) and moved the wrong rows on page 2+, or when sorted/filtered.</li>
      <li>Exports ignored filters, sorting, hidden columns and <code>file_name</code>.</li>
      <li>The grouped sub-table used Vue 2 slot syntax and never hid the grouped column.</li>
      <li>Filter values were rendered with <code>v-html</code> (XSS risk with user data); labels were unreadable in dark mode.</li>
      <li>Boolean props now work as plain attributes (<code>&lt;q-grid global_search&gt;</code>).</li>
    </ul>

    <h2>Upgrading from 1.0</h2>
    <p>No API was removed. Two behaviours changed for the better:</p>
    <ul>
      <li>Exports contain the filtered/sorted rows and visible columns — call <code>exportTable()</code> on unfiltered data if you need everything.</li>
      <li>Row drag &amp; drop moves the row (and <code>@dragged_row</code> reports indexes in <code>data</code>).</li>
    </ul>
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
const bench = `filter: text + number + 2 select filters     old     3.04 ms   new     1.22 ms   2.5x
filter: nothing active (initial render)      old     5.10 ms   new     0.00 ms   >100x
select options (old: every render)           old    14.87 ms   new     1.53 ms   9.7x (once)`
</script>
