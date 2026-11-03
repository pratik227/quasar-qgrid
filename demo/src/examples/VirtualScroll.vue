<template>
  <q-grid
    :data="rows"
    :columns="columns"
    row_key="id"
    virtual_scroll
    height="520px"
    dense
    columns_filter
    header_filter
    global_search
    excel_download
    file_name="orders"
  />
</template>

<script setup>
import { makeOrders } from './data.js'

// 50,000 rows: only the visible ones are rendered.
const rows = Object.freeze(makeOrders(50000))

const columns = [
  { name: 'order', label: 'Order', field: 'order', align: 'left', sortable: true },
  { name: 'customer', label: 'Customer', field: 'customer', align: 'left', sortable: true },
  { name: 'product', label: 'Product', field: 'product', align: 'left', filter_type: 'select', show_filter: true },
  { name: 'region', label: 'Region', field: 'region', align: 'left', filter_type: 'select', show_filter: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', filter_type: 'select' },
  { name: 'qty', label: 'Qty', field: 'qty', sortable: true, filter_type: 'number_range', aggregate: 'sum' },
  { name: 'total', label: 'Total', field: 'total', sortable: true, filter_type: 'number_range', format: v => '$' + v.toFixed(2), aggregate: 'sum', aggregate_format: v => '$' + v.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
  { name: 'date', label: 'Date', field: 'date', sortable: true, filter_type: 'date', date_format: 'DD/MM/YYYY' }
]
</script>
