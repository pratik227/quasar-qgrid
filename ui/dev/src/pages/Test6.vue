<template>
  <q-page padding>
    <q-grid :data="data" :columns="columns" :columns_filter="true" :draggable="true">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name">
            {{ props.row.name }}
          </q-td>
          <q-td key="calories">
            <q-badge color="green">
              {{ props.row.calories }}
            </q-badge>
          </q-td>
          <q-td key="fat">
            <q-badge color="purple">
              {{ props.row.fat }}
            </q-badge>
          </q-td>
          <q-td key="carbs">
            <q-badge color="orange">
              {{ props.row.carbs }}
            </q-badge>
          </q-td>
          <q-td key="protein">
            <q-badge color="primary">
              {{ props.row.protein }}
            </q-badge>
          </q-td>
          <q-td key="sodium">
            <q-badge color="teal">
              {{ props.row.sodium }}
            </q-badge>
          </q-td>
          <q-td key="calcium">
            <q-badge color="accent">
              {{ props.row.calcium }}
            </q-badge>
          </q-td>
          <q-td key="iron">
            <q-badge color="amber">
              {{ props.row.iron }}
            </q-badge>
          </q-td>
        </q-tr>
      </template>
    </q-grid>
  </q-page>
</template>

<style lang="sass" scoped>
.directive-target
  width: 50px
  height: 50px
</style>

<script>

import {defineComponent} from 'vue';

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Dessert (100g serving)',
    align: 'left',
    field: 'name',
    sortable: true
  },
  {name: 'calories', align: 'center', label: 'Calories', field: 'calories', sortable: true},
  {name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true},
  {name: 'carbs', label: 'Carbs (g)', field: 'carbs'},
  {name: 'protein', label: 'Protein (g)', field: 'protein'},
  {name: 'sodium', label: 'Sodium (mg)', field: 'sodium'},
  {
    name: 'calcium',
    label: 'Calcium (%)',
    field: 'calcium',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
  },
  {
    name: 'iron',
    label: 'Iron (%)',
    field: 'iron',
    sortable: true,
    sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
  }
]

const data = [
  {
    name: 'Frozen Yogurt',
    calories: 159,
    fat: 6.0,
    carbs: 24,
    protein: 4.0,
    sodium: 87,
    calcium: '14%',
    iron: '1%'
  },
  {
    name: 'Ice cream sandwich',
    calories: 237,
    fat: 9.0,
    carbs: 37,
    protein: 4.3,
    sodium: 129,
    calcium: '8%',
    iron: '1%'
  },
  {
    name: 'Eclair',
    calories: 262,
    fat: 16.0,
    carbs: 23,
    protein: 6.0,
    sodium: 337,
    calcium: '6%',
    iron: '7%'
  },
  {
    name: 'Cupcake',
    calories: 305,
    fat: 3.7,
    carbs: 67,
    protein: 4.3,
    sodium: 413,
    calcium: '3%',
    iron: '8%'
  },
  {
    name: 'Gingerbread',
    calories: 356,
    fat: 16.0,
    carbs: 49,
    protein: 3.9,
    sodium: 327,
    calcium: '7%',
    iron: '16%'
  },
  {
    name: 'Jelly bean',
    calories: 375,
    fat: 0.0,
    carbs: 94,
    protein: 0.0,
    sodium: 50,
    calcium: '0%',
    iron: '0%'
  },
  {
    name: 'Lollipop',
    calories: 392,
    fat: 0.2,
    carbs: 98,
    protein: 0,
    sodium: 38,
    calcium: '0%',
    iron: '2%'
  },
  {
    name: 'Honeycomb',
    calories: 408,
    fat: 3.2,
    carbs: 87,
    protein: 6.5,
    sodium: 562,
    calcium: '0%',
    iron: '45%'
  },
  {
    name: 'Donut',
    calories: 452,
    fat: 25.0,
    carbs: 51,
    protein: 4.9,
    sodium: 326,
    calcium: '2%',
    iron: '22%'
  },
  {
    name: 'KitKat',
    calories: 518,
    fat: 26.0,
    carbs: 65,
    protein: 7,
    sodium: 54,
    calcium: '12%',
    iron: '6%'
  }
]
export default defineComponent({
  name: 'Test6',
  setup() {
    return {
      data,
      columns,
    }
  }
})
</script>
