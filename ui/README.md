# Component QGrid

[![npm](https://img.shields.io/npm/v/quasar-ui-qgrid.svg?label=quasar-ui-qgrid)](https://www.npmjs.com/package/quasar-ui-qgrid)
[![npm](https://img.shields.io/npm/dt/quasar-ui-qgrid.svg)](https://www.npmjs.com/package/quasar-ui-qgrid)

**Compatible with Quasar UI v2 and Vue 3**.

QGrid turns Quasar's QTable into a full data grid: column & header filters, grouping, totals, inline editing,
drag & drop, real Excel export, virtual scroll and state persistence. Docs: https://next-quasar-qgrid.netlify.app

# Usage

## Quasar CLI project

Install the [App Extension](../app-extension): `quasar ext add qgrid`.

**OR** create and register a boot file:

```js
import { defineBoot } from '#q-app' // 'quasar/wrappers' on older Quasar CLIs
import QGrid from 'quasar-ui-qgrid'
import 'quasar-ui-qgrid/dist/index.css'

export default defineBoot(({ app }) => {
  app.use(QGrid)
})
```

## Vue / Vite project

```js
import { createApp } from 'vue'
import { Quasar } from 'quasar'
import QGrid from 'quasar-ui-qgrid'
import 'quasar-ui-qgrid/dist/index.css'

createApp(App).use(Quasar).use(QGrid).mount('#app')
```

**OR** locally:

```js
import { QGrid } from 'quasar-ui-qgrid'
```

## UMD variant

Exports `window.QGrid`. Add the following tags after the Quasar ones:

```html
<link href="https://cdn.jsdelivr.net/npm/quasar-ui-qgrid/dist/index.min.css" rel="stylesheet">
<!-- at end of body, AFTER Quasar script(s): -->
<script src="https://cdn.jsdelivr.net/npm/quasar-ui-qgrid/dist/index.umd.min.js"></script>
```

# Tests & benchmark

```bash
npm install
npm test          # unit tests (Node 22+; the .xlsx round-trip test uses python3 + openpyxl when available)
npm run bench     # filtering benchmark vs. v1.0.31 (pass a row count: node test/bench.mjs 200000)
```

# Setup
```bash
$ npm install
$ cd dev && npm install
```

# Developing
```bash
# start the playground (dev/, Quasar CLI app-vite v3)
$ npm run dev

# build and open the UMD test page
$ npm run dev:umd
```

# Building package
```bash
$ npm run build
```

# Adding Testing Components
in the `ui/dev/src/pages` you can add Vue files to test your component/directive. When using `npm run dev` to build the UI, any pages in that location will automatically be picked up by dynamic routing and added to the test page.

# Adding Assets
If you have a component that has assets, like language or icon-sets, you will need to provide these for UMD. In the `ui/build/script.javascript.js` file, you will find a couple of commented out commands that call `addAssets`. Uncomment what you need and add your assets to have them be built and put into the `ui/dist` folder.

# Donate
If this helped you in any way, you can contribute to this project for long term survival by supporting me:

### [💜 Support my open-source work on GitHub](https://github.com/sponsors/pratik227)

Be sure to check out my sponsor page.

Thank you so much!!!

# License
MIT (c) pratikpatelpp802@gmail.com
