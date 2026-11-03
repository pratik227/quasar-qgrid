<template>
  <q-grid
    :data="rows"
    :columns="columns"
    row_key="id"
    resizable_columns
    columns_filter
    selection="multiple"
    v-model:selected="selected"
    :pagination="{ rowsPerPage: 8 }"
    @column-resize="lastResize = $event.column.label + ': ' + $event.width + 'px'"
  />
  <div class="q-mt-sm text-caption text-grey-7">
    Scroll sideways: Order stays on the left, Total on the right. Drag a header edge to resize, double-click it to fit the content.
    <span v-if="lastResize">Last resize: <b>{{ lastResize }}</b></span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { makeOrders } from './data.js'

const rows = makeOrders(200)
const selected = ref([])
const lastResize = ref('')

const columns = [
  { name: 'order', label: 'Order', field: 'order', align: 'left', sortable: true, pinned: 'left', width: 130 },
  { name: 'customer', label: 'Customer', field: 'customer', align: 'left', sortable: true, width: 180 },
  { name: 'product', label: 'Product', field: 'product', align: 'left', filter_type: 'select', width: 160 },
  { name: 'region', label: 'Region', field: 'region', align: 'left', filter_type: 'select', width: 160 },
  { name: 'status', label: 'Status', field: 'status', align: 'left', filter_type: 'select', width: 160 },
  { name: 'date', label: 'Date', field: 'date', sortable: true, width: 150 },
  { name: 'qty', label: 'Qty', field: 'qty', sortable: true, width: 120 },
  { name: 'id', label: 'Internal id', field: 'id', sortable: true, width: 140 },
  { name: 'total', label: 'Total', field: 'total', sortable: true, pinned: 'right', width: 130, format: v => '$' + v.toFixed(2) }
]
</script>
