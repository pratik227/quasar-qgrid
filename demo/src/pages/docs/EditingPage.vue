<template>
  <doc-page title="Editing" lead="Edit cells in place with typed editors and validation.">
    <h2>Editable columns</h2>
    <p>Set <code>editable: true</code> on a column. Click a cell to edit, <kbd>Enter</kbd> to save, <kbd>Esc</kbd> to cancel.</p>
    <doc-example file="InlineEditing" />

    <h2>Options</h2>
    <table class="doc-table">
      <thead><tr><th>Key</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>edit_type</code></td><td><code>'text'</code> (default), <code>'number'</code>, <code>'select'</code>, <code>'textarea'</code></td></tr>
        <tr><td><code>edit_options</code></td><td>Options for <code>'select'</code> (defaults to the column's distinct values)</td></tr>
        <tr><td><code>validate</code></td><td><code>(value, row) =&gt; true | 'error message'</code></td></tr>
        <tr><td><code>edit_buttons</code></td><td>Show Set / Cancel buttons</td></tr>
      </tbody>
    </table>

    <h2>Saving changes</h2>
    <p>The row object is updated in place and <code>@cell-edit</code> fires with <code>{ row, column, field, value, old_value }</code> — persist it, or revert by assigning <code>old_value</code> back.</p>
    <code-block lang="js" :code="save" />
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
const save = `async function onCellEdit ({ row, field, value, old_value }) {
  try {
    await api.patch('/desserts/' + row.id, { [field]: value })
  } catch (e) {
    row[field] = old_value // roll back
  }
}`
</script>
