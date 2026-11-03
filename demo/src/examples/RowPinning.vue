<template>
  <q-grid
    :data="rows"
    :columns="columns"
    row_key="name"
    context_menu
    v-model:pinned_top_rows="top"
    :pinned_bottom_rows="[target]"
    global_search
    :pagination="{ rowsPerPage: 6 }"
  />
  <div class="q-mt-sm text-caption text-grey-7">
    Pinned rows ignore filters, sorting and pages. Right-click any row to pin or unpin it.
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { desserts } from './data.js'

const rows = desserts
// pin real rows from your data...
const top = ref([desserts[3]])
// ...or rows that only exist for display, like a target / budget line
const target = { name: 'Daily target', category: '—', calories: 2000, fat: 70, price: 0 }

const columns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'left', sortable: true },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true },
  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
  { name: 'price', label: 'Price', field: 'price', sortable: true, format: v => (v ? '$' + v.toFixed(2) : '—') }
]
</script>
