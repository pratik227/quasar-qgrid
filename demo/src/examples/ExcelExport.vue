<template>
  <q-grid
    ref="grid"
    :data="data"
    :columns="columns"
    row_key="name"
    file_name="desserts"
    excel_download
    csv_download
    columns_filter
    columns_filter_toggle
    global_search
    column_chooser
  >
    <!-- export programmatically, e.g. from your own toolbar -->
    <template #top-left>
      <q-btn flat dense no-caps icon="download" label="Export Excel via API" @click="grid.exportTable('xlsx')" />
    </template>
  </q-grid>
</template>

<script setup>
import { ref } from 'vue'
import { desserts, dessertColumns } from './data.js'

// Exports contain exactly what is on screen: filtered, searched, sorted,
// visible columns in their current order. Numbers stay numbers in Excel.
const grid = ref(null)
const data = desserts
const columns = dessertColumns
</script>
