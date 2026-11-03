<template>
  <q-grid
    :data="rows"
    :columns="columns"
    row_key="id"
    multi_sort
    :pagination="{ rowsPerPage: 10, sortBy: 'region', descending: false }"
    @sort-change="model = $event"
  />
  <div class="q-mt-sm text-caption text-grey-7">
    Click a header to sort, <b>Shift + click</b> more headers to add secondary sorts (asc → desc → off).
    Sort model: <code>{{ JSON.stringify(model) }}</code>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { makeOrders } from './data.js'

const rows = makeOrders(300)
const model = ref([{ name: 'region', descending: false }])

const columns = [
  { name: 'region', label: 'Region', field: 'region', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'customer', label: 'Customer', field: 'customer', align: 'left', sortable: true },
  { name: 'qty', label: 'Qty', field: 'qty', sortable: true },
  { name: 'total', label: 'Total', field: 'total', sortable: true, format: v => '$' + v.toFixed(2) }
]
</script>
