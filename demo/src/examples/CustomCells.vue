<template>
  <q-grid :data="data" :columns="columns" row_key="name" columns_filter selection="multiple">
    <!-- override one cell, keep the default row (selection, filters, editing...) -->
    <template #body-cell-name="{ row }">
      <div class="row items-center no-wrap q-gutter-sm">
        <q-avatar size="26px" color="grey-3" text-color="grey-9" class="text-weight-bold">{{ row.name[0] }}</q-avatar>
        <span>{{ row.name }}</span>
      </div>
    </template>

    <template #body-cell-calories="{ value }">
      <q-linear-progress :value="value / 600" rounded size="6px" style="width: 80px" class="inline-block q-mr-sm" />
      {{ value }}
    </template>

    <template #body-cell-in_stock="{ value }">
      <q-badge :color="value ? 'positive' : 'grey-6'" :label="value ? 'In stock' : 'Sold out'" />
    </template>

    <template #header-cell-price="{ col }">
      <q-icon name="sell" size="16px" class="q-mr-xs" />{{ col.label }}
    </template>
  </q-grid>
</template>

<script setup>
import { desserts } from './data.js'

const data = desserts
const columns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'left', filter_type: 'select' },
  { name: 'calories', label: 'Calories', field: 'calories', align: 'left', sortable: true, filter_type: 'number_range' },
  { name: 'in_stock', label: 'Stock', field: 'in_stock', align: 'left' },
  { name: 'price', label: 'Price', field: 'price', sortable: true, format: v => '$' + v.toFixed(2) }
]
</script>
