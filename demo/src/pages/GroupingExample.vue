<template>
  <q-page>
    <div :class="($q.platform.is.mobile ? '' : 'q-mx-xl')">

      <div class="markdown-nav-bar shadow-10">
        <div class="title">
          <span class="ellipsis">{{ title }}</span>
        </div>
      </div>

      <example-viewer
        title="QGrid Grouping Example"
        file="Grouping"
      />

      <page-footer></page-footer>
    </div>
  </q-page>
</template>

<script>
import {defineAsyncComponent, defineComponent, ref} from 'vue'

const year = (new Date()).getFullYear()

export default defineComponent({
  name: "GroupingExample",
  setup() {
    return {
      title: 'QGrid Grouping Example',
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
