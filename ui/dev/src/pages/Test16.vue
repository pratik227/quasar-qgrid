<template>
  <q-page padding>
    <div class="text-h6 q-mb-md">Test16 — Array field: col.format + filter_type select + selection multiple</div>

    <q-grid
      :data="data"
      :columns="columns"
      :columns_filter="true"
      selection="multiple"
      :selected="selected"
      @selected-val="selected = $event"
    />

    <div class="q-mt-md">
      <strong>Selected rows:</strong>
      <span v-if="selected.length === 0"> none</span>
      <q-chip v-for="row in selected" :key="row.name" dense class="q-ml-xs">{{ row.name }}</q-chip>
    </div>
  </q-page>
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
    // format joins array values for display; filter still operates on individual tags
    format: val => Array.isArray(val) ? val.join(', ') : val,
    filter_type: 'select'
  },
  {
    name: 'level',
    label: 'Level',
    field: 'level',
    align: 'left',
    filter_type: 'select'
  }
]

const data = [
  { name: 'Alice',  function: ['coach', 'player'],   level: 'senior' },
  { name: 'Bob',    function: ['player'],             level: 'junior' },
  { name: 'Carol',  function: ['coach'],              level: 'senior' },
  { name: 'Dave',   function: ['referee', 'coach'],   level: 'senior' },
  { name: 'Eve',    function: ['player', 'referee'],  level: 'junior' },
  { name: 'Frank',  function: ['referee'],            level: 'senior' },
  { name: 'Grace',  function: ['player', 'coach'],    level: 'junior' },
]

export default defineComponent({
  name: 'Test16',
  setup () {
    return { data, columns, selected: ref([]) }
  }
})
</script>
