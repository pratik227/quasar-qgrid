<template>
  <q-grid
    :data="rows"
    :columns="columns"
    row_key="name"
    selection="multiple"
    v-model:selected="selected"
    :context_menu="customItems"
    copy_selection
    status_bar
    resizable_columns
    file_name="desserts"
    @context-action="last = $event.action"
  />
  <div class="q-mt-sm text-caption text-grey-7">
    Right-click a cell or a header. Select rows and press <b>Ctrl/⌘ + C</b> to copy them (pastes into Excel or Sheets).
    <span v-if="last">Last action: <b>{{ last }}</b></span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { desserts } from './data.js'

const $q = useQuasar()
const rows = desserts
const selected = ref([])
const last = ref('')

const columns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true, required: true },
  { name: 'category', label: 'Category', field: 'category', align: 'left', sortable: true },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true, aggregate: 'avg' },
  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true, aggregate: 'sum' },
  { name: 'price', label: 'Price', field: 'price', sortable: true, format: v => '$' + v.toFixed(2), aggregate: 'sum', aggregate_format: v => '$' + v.toFixed(2) }
]

// your own items are appended to the built-in ones
const customItems = [
  {
    label: 'Show details',
    icon: 'info',
    handler: ({ row }) => row && $q.notify({ message: row.name + ' · ' + row.calories + ' kcal', timeout: 1500 })
  }
]
</script>
