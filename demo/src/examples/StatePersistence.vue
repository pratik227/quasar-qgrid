<template>
  <div>
    <q-grid
      ref="grid"
      :data="data"
      :columns="columns"
      row_key="name"
      state_key="docs-state-demo"
      columns_filter
      header_filter
      groupby_filter
      column_chooser
      draggable_columns
      resizable_columns
      multi_sort
      context_menu
      clear_filters
      global_search
      @state-change="state = $event"
    />
    <div class="row items-center q-gutter-sm q-mt-md">
      <q-btn outline no-caps label="Reset state" @click="grid.resetState()" />
      <span class="text-caption text-grey-7">Filter, sort (Shift + click for more), resize, pin (right-click), reorder or hide columns, then reload the page.</span>
    </div>
    <pre class="q-mt-md text-caption" style="white-space: pre-wrap; opacity: .75">{{ state }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { desserts } from './data.js'

const grid = ref(null)
const state = ref(null)
const data = desserts
const columns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true, required: true },
  { name: 'category', label: 'Category', field: 'category', align: 'left', filter_type: 'select', grouping: true, show_filter: true },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true, filter_type: 'number_range' },
  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
  { name: 'price', label: 'Price', field: 'price', sortable: true, format: v => '$' + v.toFixed(2) }
]
</script>
