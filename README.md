# QGrid

[![npm](https://img.shields.io/npm/v/quasar-app-extension-qgrid.svg?label=quasar-app-extension-qgrid)](https://www.npmjs.com/package/quasar-app-extension-qgrid)
[![npm](https://img.shields.io/npm/v/quasar-ui-qgrid.svg?label=quasar-ui-qgrid)](https://www.npmjs.com/package/quasar-ui-qgrid)

**QGrid** is a free, open-source data grid for [Quasar](https://quasar.dev) & Vue 3, shipped as a
[Quasar App Extension](https://quasar.dev/app-extensions/introduction). It renders a regular `QTable`
and adds the features business tables need — each one is a single prop.

| | |
|---|---|
| **Filtering** | Text, select, date-range & number-range column filters · Excel-like searchable header filters · global search |
| **Data** | Grouping · footer totals (sum / avg / min / max / count / custom) · master/detail rows · inline editing with validation |
| **Export** | Real **.xlsx** (typed cells, no dependency) and CSV — exactly what is on screen |
| **Layout** | Drag & drop rows and columns · column chooser · virtual scroll (50k+ rows) · sticky header · fullscreen |
| **Advanced** | Save & restore state · server-side pagination, sort & column filters · cell/header-cell/detail slots · i18n labels |

📖 **Docs & live examples:** https://next-quasar-qgrid.netlify.app

## Install

```bash
quasar ext add qgrid
```

Works with `quasar` v2 and `@quasar/app-vite` v1 – v3 / `@quasar/app-webpack` v3 – v4.
To remove it: `quasar ext remove qgrid`.

Not using Quasar CLI? `npm i quasar-ui-qgrid` and `app.use(QGrid)` — see [ui/README.md](ui/README.md).

## Usage

```vue
<template>
  <q-grid
    :data="rows"
    :columns="columns"
    row_key="name"
    columns_filter
    header_filter
    global_search
    excel_download
    file_name="desserts"
  />
</template>

<script setup>
const columns = [
  { name: 'name', label: 'Dessert', field: 'name', align: 'left', sortable: true, show_filter: true },
  { name: 'category', label: 'Category', field: 'category', filter_type: 'select', grouping: true },
  { name: 'calories', label: 'Calories', field: 'calories', sortable: true, filter_type: 'number_range', aggregate: 'avg' },
  { name: 'added', label: 'Added', field: 'added', filter_type: 'date', date_format: 'DD/MM/YYYY' },
  { name: 'price', label: 'Price', field: 'price', format: v => '$' + v.toFixed(2), editable: true, edit_type: 'number', aggregate: 'sum' }
]

const rows = [
  { name: 'Frozen Yogurt', category: 'Ice cream', calories: 159, added: '12/01/2024', price: 3.5 },
  { name: 'Eclair', category: 'Pastry', calories: 262, added: '18/02/2024', price: 2.75 }
  // ...
]
</script>
```

See the [API reference](https://next-quasar-qgrid.netlify.app/docs/api) (or run `quasar describe QGrid`)
and [what's new in 1.1](https://next-quasar-qgrid.netlify.app/docs/whats-new).

## Repository

| Folder | |
|---|---|
| [`ui/`](ui) | `quasar-ui-qgrid` — the component (`npm test`, `npm run bench`, `npm run build`) |
| [`app-extension/`](app-extension) | `quasar-app-extension-qgrid` — the Quasar CLI App Extension |
| [`demo/`](demo) | Documentation site & playground (`@quasar/app-vite` v3, uses `ui/` sources directly) |

```bash
cd demo && npm install && npm run dev   # docs on http://localhost:9000
cd ui && npm install && npm test        # unit tests
```

# Sponsors

<p align="center">
  <a href="https://github.com/pratik227/static/blob/main/sponsors.svg">
    <img src='https://github.com/pratik227/static/blob/main/sponsors.svg'/>
  </a>
</p>

# Support

If this helped you in any way, you can contribute to the package's long term survival by supporting me:

### [💜 Support my open-source work on GitHub](https://github.com/sponsors/pratik227)

Be sure to check out my sponsor page.

Thank you so much!!!

# License

MIT (c) pratikpatelpp802@gmail.com
