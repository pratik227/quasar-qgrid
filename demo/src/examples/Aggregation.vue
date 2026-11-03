<template>
  <q-grid
    :data="data"
    :columns="columns"
    row_key="name"
    columns_filter
    groupby_filter
    global_search
  />
</template>

<script setup>
import { desserts } from './data.js'

const data = desserts

// Add `aggregate` to any column: 'sum' | 'avg' | 'min' | 'max' | 'count' | (values, rows) => any
// Totals follow the filters, the global search and the grouping.
const columns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true, aggregate: 'count', aggregate_label: 'Items' },
  { name: 'category', label: 'Category', field: 'category', align: 'left', filter_type: 'select', grouping: true },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true, filter_type: 'number_range', aggregate: 'avg' },
  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true, aggregate: 'sum', aggregate_format: v => v.toFixed(1) + ' g' },
  { name: 'protein', label: 'Protein (g)', field: 'protein', sortable: true, aggregate: 'max' },
  {
    name: 'price',
    label: 'Price',
    field: 'price',
    sortable: true,
    format: v => '$' + v.toFixed(2),
    aggregate: 'sum',
    aggregate_format: v => '$' + v.toFixed(2)
  },
  {
    name: 'in_stock',
    label: 'In stock',
    field: 'in_stock',
    format: v => (v ? 'Yes' : 'No'),
    // custom aggregate: share of rows in stock
    aggregate: values => Math.round(100 * values.filter(Boolean).length / (values.length || 1)) + '%',
    aggregate_label: 'Stock'
  }
]
</script>
