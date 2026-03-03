<template>
  <q-page>
    <div :class="($q.platform.is.mobile ? '' : 'q-mx-xl')">

      <div class="markdown-nav-bar shadow-10">
        <div class="title">
          <span class="ellipsis">{{ title }}</span>
        </div>
      </div>

      <example-viewer
        title="QGrid Array Field (tags)"
        file="ArrayField"
      />

      <page-footer></page-footer>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent, defineComponent } from 'vue'

const year = (new Date()).getFullYear()

export default defineComponent({
  name: 'ArrayFieldExample',
  setup () {
    return {
      title: 'QGrid Array Field (tags)',
      year,
      openLink (href) {
        window.open(href)
      }
    }
  },
  components: {
    PageFooter: defineAsyncComponent(() => import('components/PageFooter')),
  }
})
</script>
