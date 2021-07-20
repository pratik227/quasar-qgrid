import { boot } from 'quasar/wrappers'
import JsonApiViewer from 'quasar-ui-json-api-viewer/src/components/JsonApiViewer'
// import MarkdownPage from '../components/MarkdownPage.vue'
import MarkdownLink from '../components/MarkdownLink.vue'
import ExampleViewer from 'quasar-ui-example-viewer/src'
import VueMarkdownIt from 'vue3-markdown-it';

export default boot(({ app }) => {
  // app.use(VuePlugin)
  app.use(ExampleViewer)
  app.use(VueMarkdownIt)
  app.component('JsonApiViewer', JsonApiViewer)
  // app.component('MarkdownPage', MarkdownPage)
  app.component('MarkdownLink', MarkdownLink)
})
