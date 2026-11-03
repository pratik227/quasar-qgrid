<template>
  <doc-page title="Installation" lead="Use the App Extension in Quasar CLI projects, or the UI package anywhere Vue 3 and Quasar run.">
    <h2>Quasar CLI (recommended)</h2>
    <p>From your Quasar project folder:</p>
    <code-block lang="bash" code="quasar ext add qgrid" />
    <p>That's it — <code>&lt;q-grid&gt;</code> is now registered globally. Compatible with:</p>
    <table class="doc-table">
      <thead><tr><th>Package</th><th>Versions</th></tr></thead>
      <tbody>
        <tr><td><code>quasar</code></td><td>v2</td></tr>
        <tr><td><code>@quasar/app-vite</code></td><td>v1, v2, v3</td></tr>
        <tr><td><code>@quasar/app-webpack</code></td><td>v3, v4 (and the legacy <code>@quasar/app</code> v3)</td></tr>
      </tbody>
    </table>
    <p>To remove it:</p>
    <code-block lang="bash" code="quasar ext remove qgrid" />

    <h2>Vue plugin (Vite / Vue CLI)</h2>
    <code-block lang="bash" code="npm install quasar-ui-qgrid" />
    <code-block lang="js" title="main.js" :code="vuePlugin" />

    <h2>UMD / CDN</h2>
    <code-block lang="html" title="index.html" :code="umd" />

    <callout-note type="note" title="Icons">
      QGrid ships its own SVG icons, so it works whatever icon set your app uses. Override any of them with the <code>icons</code> prop.
    </callout-note>
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import CodeBlock from '../../components/CodeBlock.vue'
import DocExample from '../../components/DocExample.vue'
import CalloutNote from '../../components/CalloutNote.vue'
import DocCard from '../../components/DocCard.vue'

const vuePlugin = `import { createApp } from 'vue'
import { Quasar } from 'quasar'
import QGrid from 'quasar-ui-qgrid'
import 'quasar/dist/quasar.css'
import 'quasar-ui-qgrid/dist/index.css'

import App from './App.vue'

createApp(App)
  .use(Quasar)
  .use(QGrid) // registers <q-grid>
  .mount('#app')`

const umd = `<link href="https://cdn.jsdelivr.net/npm/quasar@2/dist/quasar.prod.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/quasar-ui-qgrid/dist/index.min.css" rel="stylesheet">

<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/quasar@2/dist/quasar.umd.prod.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/quasar-ui-qgrid/dist/index.umd.min.js"><\/script>

<script>
  const app = Vue.createApp({ /* ... */ })
  app.use(Quasar)
  app.use(QGrid)
  app.mount('#q-app')
<\/script>`
</script>
