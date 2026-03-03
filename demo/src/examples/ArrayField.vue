<template>
  <q-grid
    :data="data"
    :columns="columns"
    :columns_filter="true"
    selection="multiple"
    :selected="selected"
    @selected-val="selected = $event"
  >
    <!--
      No body slot needed for formatting — use col.format instead.
      The body slot below is shown only to demonstrate how you can still
      render the selection checkbox when you DO need a custom body slot.
    -->
  </q-grid>

  <div class="q-mt-md q-pa-sm bg-grey-2 rounded-borders" v-if="selected.length">
    <strong>Selected:</strong> {{ selected.map(r => r.name).join(', ') }}
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

const columns = [
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'function',
    label: 'Function',
    field: 'function',
    align: 'left',
    // Array values are joined for display automatically via format.
    // The select filter still receives the individual tag values.
    format: val => Array.isArray(val) ? val.join(', ') : val,
    filter_type: 'select'
  }
]

const data = [
  { name: 'Alice',   function: ['coach', 'player'] },
  { name: 'Bob',     function: ['player'] },
  { name: 'Carol',   function: ['coach'] },
  { name: 'Dave',    function: ['referee', 'coach'] },
  { name: 'Eve',     function: ['player', 'referee'] },
  { name: 'Frank',   function: ['referee'] },
]

export default defineComponent({
  name: 'ArrayField',
  setup () {
    return {
      columns,
      data,
      selected: ref([])
    }
  }
})
</script>
