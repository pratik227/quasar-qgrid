<template>
  <q-page>
    <div :class="($q.platform.is.mobile ? '' : 'q-mx-xl')">

      <div class="markdown-nav-bar shadow-10">
        <div class="title">
          <span class="ellipsis">{{ title }}</span>
        </div>
      </div>

      <example-viewer
        title="QGrid Column Filter"
        file="ColumnFilter"
      />

      <page-footer></page-footer>
    </div>
  </q-page>
</template>

<script>
import {defineAsyncComponent, defineComponent, ref} from 'vue'

const year = (new Date()).getFullYear()

export default defineComponent({
  name: "ColumnFilterExample",
  setup() {
    return {
      title: 'QGrid Column Filter',
      year,
      openLink(href) {
        window.open(href)
      }
    }
  },
  components: {
    PageFooter: defineAsyncComponent(() => import('components/PageFooter')),
  }
})
</script>

<style scoped>

</style>
