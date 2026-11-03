<template>
  <doc-page title="Drag & drop" lead="Reorder rows and columns with the mouse or touch.">
    <h2>Rows</h2>
    <p>
      <code>draggable</code> lets users move rows. The row is moved inside your <code>data</code> array (on any page, with any filter)
      and <code>@dragged_row</code> reports <code>{ dragged_row, old_index, new_index }</code> as indexes in <code>data</code>.
    </p>
    <doc-example file="DraggableRows" />
    <callout-note type="note">Rows listed in <code>ignore_rows</code> can't be dragged or dropped on. Row drag is disabled with <code>virtual_scroll</code>.</callout-note>

    <h2>Columns</h2>
    <p><code>draggable_columns</code> lets users reorder columns; <code>@dragged_column</code> fires and your <code>columns</code> array is reordered too.</p>
    <doc-example file="DraggableColumnsDemo" />
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
</script>
