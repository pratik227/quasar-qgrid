<template>
  <div class="home">
    <!-- hero -->
    <section class="hero">
      <div class="hero__left">
        <h1 class="display">The data grid<br>built for Quasar</h1>
        <div class="hero__ctas">
          <router-link to="/docs/installation" class="pill pill--solid pill--lg">Get started</router-link>
          <router-link to="/docs/examples" class="pill pill--ghost pill--lg">Browse examples</router-link>
        </div>
      </div>
      <p class="hero__lead">
        QGrid turns QTable into a full data grid: column &amp; header filters, grouping, totals, inline editing,
        drag &amp; drop, Excel export and virtual scroll — free, open source and one
        <code>quasar ext add qgrid</code> away.
      </p>
    </section>

    <!-- live demo with segmented tabs -->
    <section class="showcase">
      <div class="showcase__tabs" role="tablist">
        <button
          v-for="t in demos"
          :key="t.key"
          role="tab"
          :aria-selected="demo === t.key"
          class="showcase__tab"
          :class="{ active: demo === t.key }"
          @click="demo = t.key"
        >
          <span class="showcase__dot" :style="{ background: t.dot }" />{{ t.label }}
        </button>
      </div>
      <div class="showcase__stage demo-surface">
        <keep-alive>
          <q-grid
            v-if="demo === 'filter'"
            key="filter"
            :data="desserts"
            :columns="filterColumns"
            row_key="name"
            columns_filter
            header_filter
            global_search
            clear_filters
            :pagination="{ rowsPerPage: 6 }"
          />
          <q-grid
            v-else-if="demo === 'totals'"
            key="totals"
            :data="desserts"
            :columns="totalColumns"
            row_key="name"
            groupby_filter
            global_search
            :pagination="{ rowsPerPage: 6 }"
          />
          <q-grid
            v-else-if="demo === 'edit'"
            key="edit"
            :data="editable"
            :columns="editColumns"
            row_key="name"
            draggable
            :pagination="{ rowsPerPage: 6 }"
          />
          <q-grid
            v-else
            key="big"
            :data="orders"
            :columns="orderColumns"
            row_key="id"
            virtual_scroll
            height="420px"
            dense
            columns_filter
            excel_download
            file_name="orders"
          />
        </keep-alive>
        <div class="showcase__caption">{{ demos.find(d => d.key === demo).caption }}</div>
      </div>
    </section>

    <!-- stats -->
    <section class="stats">
      <div v-for="s in stats" :key="s.label" class="stats__item">
        <div class="stats__value">{{ s.value }}</div>
        <div class="stats__label">{{ s.label }}</div>
      </div>
    </section>

    <!-- features -->
    <section class="section">
      <div class="section__eyebrow">Features</div>
      <h2 class="display display--md">Everything a business table needs</h2>
      <p class="section__lead">Opt in to what you need with a single prop. Everything else stays plain QTable.</p>
      <div class="features">
        <router-link v-for="(f, i) in features" :key="f.title" :to="f.to" class="feature">
          <div class="feature__orb" :style="{ background: orb(i) }" />
          <div class="feature__title">{{ f.title }} <span v-if="f.isNew" class="badge-new">New</span></div>
          <div class="feature__desc">{{ f.desc }}</div>
        </router-link>
      </div>
    </section>

    <!-- free vs paid -->
    <section class="section">
      <div class="section__eyebrow">Free, MIT licensed</div>
      <h2 class="display display--md">Features other grids keep behind a paywall</h2>
      <p class="section__lead">
        Excel export, aggregation, row grouping and master/detail rows are enterprise-tier features in many
        commercial grids. In QGrid they are a prop away.
      </p>
      <div class="compare">
        <div class="compare__row compare__row--head">
          <span>Feature</span><span>QGrid</span><span>Typical commercial grid</span>
        </div>
        <div v-for="row in compare" :key="row[0]" class="compare__row">
          <span>{{ row[0] }}</span>
          <span><q-icon name="check" size="18px" /> Free</span>
          <span class="muted">{{ row[1] }}</span>
        </div>
      </div>
    </section>

    <!-- install -->
    <section class="section section--split">
      <div>
        <div class="section__eyebrow">Get started</div>
        <h2 class="display display--md">Install in one command</h2>
        <p class="section__lead">
          The App Extension registers <code>&lt;q-grid&gt;</code> globally and works with
          <b>@quasar/app-vite</b> v1–v3 and <b>@quasar/app-webpack</b> v3–v4.
        </p>
        <div class="hero__ctas">
          <router-link to="/docs/quickstart" class="pill pill--solid">Read the quickstart</router-link>
          <router-link to="/docs/api" class="pill pill--ghost">API reference</router-link>
        </div>
      </div>
      <div>
        <code-block :tabs="installTabs" />
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <h2 class="display display--md">Ship your next admin table today</h2>
      <div class="hero__ctas" style="justify-content: center">
        <router-link to="/docs" class="pill pill--solid pill--lg">Read the docs</router-link>
        <a href="https://github.com/sponsors/pratik227" target="_blank" rel="noopener" class="pill pill--ghost pill--lg">Sponsor the project</a>
      </div>
    </section>

    <footer class="home-footer">
      <brand-mark />
      <span class="muted">MIT License · © 2020–{{ year }} Pratik Patel · Built with Quasar</span>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMeta } from 'quasar'
import BrandMark from '../components/BrandMark.vue'
import CodeBlock from '../components/CodeBlock.vue'
import { desserts as dessertRows, makeOrders } from '../examples/data.js'

useMeta({ title: 'QGrid — the data grid for Quasar' })

const year = new Date().getFullYear()
const desserts = dessertRows
const editable = ref(dessertRows.map(d => ({ ...d })))
const orders = Object.freeze(makeOrders(50000))

const demo = ref('filter')
const demos = [
  { key: 'filter', label: 'Filtering', dot: 'linear-gradient(135deg,#f9c58d,#f48c6d)', caption: 'Type in the filter row, or open a header filter for an Excel-like value list.' },
  { key: 'totals', label: 'Grouping & totals', dot: 'linear-gradient(135deg,#b8e6c9,#2f5d8a)', caption: 'Footer totals follow your filters. Group by Category from the toolbar.' },
  { key: 'edit', label: 'Editing & drag', dot: 'linear-gradient(135deg,#d9c3ff,#8f7cf2)', caption: 'Click Price or Calories to edit in place. Drag rows to reorder them.' },
  { key: 'big', label: '50k rows', dot: 'linear-gradient(135deg,#c9e7ff,#3c5a99)', caption: '50,000 rows with virtual scroll, filters and real .xlsx export.' }
]

const filterColumns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true, show_filter: true },
  { name: 'category', label: 'Category', field: 'category', align: 'left', filter_type: 'select', show_filter: true },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true, filter_type: 'number_range' },
  { name: 'created_at', label: 'Added', field: 'created_at', sortable: true, filter_type: 'date', date_format: 'DD/MM/YYYY' },
  { name: 'price', label: 'Price', field: 'price', sortable: true, format: v => '$' + v.toFixed(2) }
]

const totalColumns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true, aggregate: 'count', aggregate_label: 'Items' },
  { name: 'category', label: 'Category', field: 'category', align: 'left', grouping: true },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true, aggregate: 'avg' },
  { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true, aggregate: 'sum' },
  { name: 'price', label: 'Price', field: 'price', sortable: true, format: v => '$' + v.toFixed(2), aggregate: 'sum', aggregate_format: v => '$' + v.toFixed(2) }
]

const editColumns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left' },
  { name: 'category', label: 'Category', field: 'category', align: 'left', editable: true, edit_type: 'select', edit_options: ['Ice cream', 'Pastry', 'Cookie', 'Candy'] },
  { name: 'calories', label: 'Calories', field: 'calories', editable: true, edit_type: 'number', validate: v => v >= 0 || 'Must be positive' },
  { name: 'price', label: 'Price', field: 'price', format: v => '$' + Number(v).toFixed(2), editable: true, edit_type: 'number' }
]

const orderColumns = [
  { name: 'order', label: 'Order', field: 'order', align: 'left', sortable: true },
  { name: 'customer', label: 'Customer', field: 'customer', align: 'left' },
  { name: 'region', label: 'Region', field: 'region', align: 'left', filter_type: 'select' },
  { name: 'status', label: 'Status', field: 'status', align: 'left', filter_type: 'select' },
  { name: 'total', label: 'Total', field: 'total', sortable: true, format: v => '$' + v.toFixed(2), aggregate: 'sum', aggregate_format: v => '$' + Math.round(v).toLocaleString() }
]

const stats = [
  { value: 'MIT', label: 'free for commercial use' },
  { value: '0 deps', label: 'for Excel export' },
  { value: '50k+', label: 'rows with virtual scroll' },
  { value: '~30 KB', label: 'gzipped, dist bundle' }
]

const features = [
  { title: 'Column & header filters', desc: 'Text, select, date range and number range filters, plus searchable value lists in headers.', to: '/docs/filtering' },
  { title: 'Grouping & totals', desc: 'Group by any column; sum, avg, min, max, count or custom footer totals.', to: '/docs/grouping', isNew: true },
  { title: 'Excel & CSV export', desc: 'Real .xlsx with typed cells. Exports exactly what is on screen.', to: '/docs/export', isNew: true },
  { title: 'Inline editing', desc: 'Text, number, select and textarea editors with validation.', to: '/docs/editing', isNew: true },
  { title: 'Drag & drop', desc: 'Reorder rows and columns, across pages, filters and slots.', to: '/docs/drag-and-drop' },
  { title: 'Virtual scroll', desc: 'Tens of thousands of rows with a sticky header.', to: '/docs/large-data', isNew: true },
  { title: 'Server-side ready', desc: 'Column filters, sort and pagination sent to your API.', to: '/docs/large-data', isNew: true },
  { title: 'Master / detail', desc: 'Expandable rows with any content.', to: '/docs/customization', isNew: true },
  { title: 'Save & restore', desc: 'Persist filters, sort, column order and visibility.', to: '/docs/large-data#save-and-restore-state', isNew: true }
]

const compare = [
  ['Excel (.xlsx) export', 'Paid / enterprise tier'],
  ['Aggregation & footer totals', 'Paid / enterprise tier'],
  ['Row grouping', 'Paid / enterprise tier'],
  ['Master / detail rows', 'Paid / enterprise tier'],
  ['Searchable set (value) filter', 'Paid / enterprise tier'],
  ['Column chooser', 'Often paid']
]

const palettes = [
  ['#f9c58d', '#f48c6d', '#8fb7ff'], ['#b8e6c9', '#5fb6a6', '#2f5d8a'], ['#d9c3ff', '#8f7cf2', '#f3a6c8'],
  ['#ffe09a', '#f7a35c', '#c75d5d'], ['#c9e7ff', '#77b4e6', '#3c5a99'], ['#e6e1d6', '#bdb4a3', '#7c7466']
]
function orb (i) {
  const p = palettes[i % palettes.length]
  return `radial-gradient(60% 60% at 30% 30%, ${p[0]}, transparent 70%), radial-gradient(70% 70% at 70% 60%, ${p[1]}, transparent 70%), radial-gradient(90% 90% at 50% 90%, ${p[2]}, transparent 75%), #ece7df`
}

const installTabs = [
  { label: 'Quasar CLI', lang: 'bash', code: 'quasar ext add qgrid' },
  {
    label: 'Vue plugin',
    lang: 'js',
    code: `// npm i quasar-ui-qgrid
import { createApp } from 'vue'
import { Quasar } from 'quasar'
import QGrid from 'quasar-ui-qgrid'
import 'quasar-ui-qgrid/dist/index.css'

createApp(App).use(Quasar).use(QGrid).mount('#app')`
  },
  {
    label: 'Usage',
    lang: 'vue',
    code: `<q-grid
  :data="rows"
  :columns="columns"
  columns_filter
  global_search
  excel_download
/>`
  }
]
</script>

<style>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.display {
  margin: 0;
  color: var(--text-strong);
  font: 300 64px/1.05 var(--font-display);
  letter-spacing: -.035em;
}

.display--md {
  font-size: 44px;
  line-height: 1.1;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: end;
  gap: 48px;
  padding: 96px 0 48px;
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 32px;
}

.hero__lead {
  margin: 0 0 6px;
  color: var(--text-strong);
  font-size: 18px;
  line-height: 1.6;
}

.hero__lead code {
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--surface);
  font-size: 15px;
}

.showcase {
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  background: var(--surface);
  overflow: hidden;
}

.showcase__tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 5px;
}

.showcase__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border: 0;
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-2);
  font: 400 15px/1 var(--font-sans);
  cursor: pointer;
  transition: background-color .15s, color .15s;
}

.showcase__tab:hover {
  color: var(--text-strong);
}

.showcase__tab.active {
  background: var(--bg);
  color: var(--text-strong);
  box-shadow: var(--ring);
}

.showcase__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.showcase__stage {
  margin: 0 5px 5px;
  padding: 24px;
  border-radius: calc(var(--radius-xl) - 6px);
  background: var(--bg);
}

.showcase__caption {
  margin-top: 14px;
  color: var(--text-2);
  font-size: 14px;
  text-align: center;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 56px 0 24px;
}

.stats__item {
  padding-left: 16px;
  border-left: 1px solid var(--border-strong);
}

.stats__value {
  color: var(--text-strong);
  font: 300 36px/1.1 var(--font-display);
  letter-spacing: -.03em;
}

.stats__label {
  margin-top: 4px;
  color: var(--text-2);
  font-size: 14px;
}

.section {
  padding: 96px 0 0;
}

.section__eyebrow {
  margin-bottom: 12px;
  color: var(--text-2);
  font-size: 14px;
}

.section__lead {
  max-width: 640px;
  margin: 16px 0 0;
  color: var(--text-2);
  font-size: 17px;
  line-height: 1.6;
}

.section__lead code {
  font-size: 15px;
}

.section--split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 56px;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 40px;
}

.feature {
  display: block;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg);
  color: inherit;
  text-decoration: none;
  transition: transform .2s, box-shadow .2s;
}

.feature:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, .06);
}

.feature__orb {
  width: 56px;
  height: 56px;
  margin-bottom: 20px;
  border-radius: 50%;
  filter: saturate(1.1);
}

.feature__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-strong);
  font-size: 17px;
  font-weight: 500;
}

.feature__desc {
  margin-top: 6px;
  color: var(--text-2);
  font-size: 15px;
  line-height: 1.55;
}

.compare {
  margin-top: 40px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg);
  overflow: hidden;
}

.compare__row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.4fr;
  gap: 16px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  font-size: 15px;
}

.compare__row span:nth-child(2) {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-strong);
  font-weight: 500;
}

.compare__row--head {
  border-top: 0;
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 13px;
  font-weight: 500;
}

.compare__row--head span:nth-child(2) {
  color: var(--text-2);
}

.cta {
  margin: 120px 0 0;
  padding: 80px 24px;
  border-radius: var(--radius-xl);
  background:
    radial-gradient(50% 80% at 15% 20%, rgba(249, 197, 141, .55), transparent 70%),
    radial-gradient(45% 70% at 85% 30%, rgba(143, 183, 255, .5), transparent 70%),
    radial-gradient(60% 80% at 50% 120%, rgba(217, 195, 255, .6), transparent 70%),
    var(--surface);
  text-align: center;
}

.home-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 48px 0;
  font-size: 13px;
}

@media (max-width: 1023px) {
  .hero, .section--split { grid-template-columns: 1fr; gap: 24px; }
  .hero { padding-top: 56px; }
  .display { font-size: 48px; }
  .display--md { font-size: 34px; }
  .features { grid-template-columns: repeat(2, 1fr); }
  .stats { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 599px) {
  .home { padding: 0 16px; }
  .display { font-size: 40px; }
  .features { grid-template-columns: 1fr; }
  .showcase__tabs { grid-template-columns: repeat(2, 1fr); }
  .showcase__stage { padding: 12px; }
  .compare__row { grid-template-columns: 1.4fr 1fr; }
  .compare__row span:nth-child(3) { display: none; }
}
</style>
