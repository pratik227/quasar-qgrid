<template>
  <div>
    <q-grid
      :data="rows"
      :columns="columns"
      row_key="id"
      ssr_pagination
      server_side_filters
      :pagination="pagination"
      :loading="loading"
      columns_filter
      global_search
      @OnRequest="onRequest"
    />
    <div class="q-mt-md text-caption text-grey-7">Last request: <code>{{ lastRequest }}</code></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { makeOrders } from './data.js'

const columns = [
  { name: 'order', label: 'Order', field: 'order', align: 'left', sortable: true },
  { name: 'customer', label: 'Customer', field: 'customer', align: 'left', sortable: true },
  { name: 'region', label: 'Region', field: 'region', align: 'left', filter_type: 'select', filter_options: ['North', 'South', 'East', 'West', 'Central'] },
  { name: 'qty', label: 'Qty', field: 'qty', sortable: true, filter_type: 'number_range' },
  { name: 'total', label: 'Total', field: 'total', sortable: true, format: v => '$' + v.toFixed(2) }
]

const rows = ref([])
const loading = ref(false)
const lastRequest = ref('')
const pagination = ref({ sortBy: 'order', descending: false, page: 1, rowsPerPage: 10, rowsNumber: 0 })

// --- a fake backend: replace with your API call -------------------------------
const db = makeOrders(5000)
function fakeApi ({ page, rowsPerPage, sortBy, descending, search, filters }) {
  let list = db
  if (search) list = list.filter(r => (r.order + r.customer).toLowerCase().includes(search.toLowerCase()))
  Object.keys(filters).forEach(key => {
    const f = filters[key]
    if (f.values) list = list.filter(r => f.values.includes(String(r[key]).toLowerCase()))
    if (f.type === 'text') list = list.filter(r => String(r[key]).toLowerCase().includes(String(f.value).toLowerCase()))
    if (f.type === 'number_range') {
      list = list.filter(r => (f.value.from === '' || r[key] >= f.value.from) && (f.value.to === '' || r[key] <= f.value.to))
    }
  })
  if (sortBy) {
    const dir = descending ? -1 : 1
    list = list.slice().sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0) * dir)
  }
  const start = (page - 1) * rowsPerPage
  return new Promise(resolve => setTimeout(() => resolve({ rows: list.slice(start, start + rowsPerPage), total: list.length }), 350))
}
// ------------------------------------------------------------------------------

// QTable's @request payload + `filters`: the QGrid column filter model
async function onRequest ({ pagination: p, filter, filters }) {
  loading.value = true
  lastRequest.value = JSON.stringify({ page: p.page, sortBy: p.sortBy, search: filter || '', filters })
  const { rows: page, total } = await fakeApi({ ...p, search: filter, filters })
  rows.value = page
  pagination.value = { ...p, rowsNumber: total }
  loading.value = false
}

onMounted(() => onRequest({ pagination: pagination.value, filter: '', filters: {} }))
</script>
