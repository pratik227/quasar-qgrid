<template>
  <div>
    <q-grid
      :data="rows"
      :columns="columns"
      row_key="name"
      @cell-edit="onEdit"
    />
    <div class="q-mt-md text-caption text-grey-7">
      Click a cell in Calories, Category, Price or Notes.
      <span v-if="lastEdit">Last edit: <b>{{ lastEdit }}</b></span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { desserts } from './data.js'

// cells are edited in place; @cell-edit tells you what changed (e.g. to save it)
const rows = ref(desserts.slice(0, 6).map(d => ({ ...d, notes: '' })))
const lastEdit = ref('')

const columns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true },
  {
    name: 'calories',
    label: 'Calories',
    field: 'calories',
    sortable: true,
    editable: true,
    edit_type: 'number',
    validate: v => (Number.isFinite(v) && v >= 0 && v <= 1000) || 'Between 0 and 1000'
  },
  {
    name: 'category',
    label: 'Category',
    field: 'category',
    align: 'left',
    editable: true,
    edit_type: 'select',
    edit_options: ['Ice cream', 'Pastry', 'Cookie', 'Candy']
  },
  {
    name: 'price',
    label: 'Price',
    field: 'price',
    sortable: true,
    format: v => '$' + Number(v).toFixed(2),
    editable: true,
    edit_type: 'number',
    edit_buttons: true,
    validate: v => v > 0 || 'Price must be positive'
  },
  { name: 'notes', label: 'Notes', field: 'notes', align: 'left', editable: true, edit_type: 'textarea', edit_buttons: true }
]

function onEdit ({ row, field, value, old_value: oldValue }) {
  lastEdit.value = `${row.name} · ${field}: ${oldValue === '' ? '∅' : oldValue} → ${value}`
}
</script>
