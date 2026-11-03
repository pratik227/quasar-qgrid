<template>
  <div>
    <q-grid
      :data="data"
      :columns="columns"
      row_key="name"
      column_chooser
      draggable_columns
      v-model:visible_columns="visible"
    />
    <div class="q-mt-md text-caption text-grey-7">Visible: {{ visible.join(', ') }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { desserts, dessertColumns } from './data.js'

const data = desserts
const columns = dessertColumns
// `required: true` columns (Dessert) can't be hidden
const visible = ref(['category', 'calories', 'price'])
</script>
