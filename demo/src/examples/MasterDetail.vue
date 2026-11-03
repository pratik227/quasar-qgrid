<template>
  <q-grid :data="data" :columns="columns" row_key="name" global_search>
    <!-- Any content can go in the detail row: text, forms, charts... even another QGrid -->
    <template #detail="{ row }">
      <div class="row q-col-gutter-lg q-py-sm">
        <div class="col-12 col-sm-4">
          <div class="text-caption text-grey-7">Nutrition (per 100 g)</div>
          <div class="q-mt-xs">
            <q-linear-progress :value="row.carbs / 100" rounded size="8px" class="q-mb-xs" /> Carbs {{ row.carbs }} g
            <q-linear-progress :value="row.fat / 30" rounded size="8px" class="q-my-xs" color="orange" /> Fat {{ row.fat }} g
          </div>
        </div>
        <div class="col-12 col-sm-4">
          <div class="text-caption text-grey-7">Minerals</div>
          <div class="q-mt-xs">Calcium {{ row.calcium }} · Iron {{ row.iron }} · Sodium {{ row.sodium }} mg</div>
        </div>
        <div class="col-12 col-sm-4">
          <div class="text-caption text-grey-7">Availability</div>
          <q-badge :color="row.in_stock ? 'positive' : 'grey'" :label="row.in_stock ? 'In stock' : 'Sold out'" class="q-mt-xs" />
          <div class="q-mt-xs">Added on {{ row.created_at }}</div>
        </div>
      </div>
    </template>
  </q-grid>
</template>

<script setup>
import { desserts, dessertColumns } from './data.js'

const data = desserts
const columns = dessertColumns
</script>
