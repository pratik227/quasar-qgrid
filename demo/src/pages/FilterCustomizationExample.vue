<template>
  <q-page>
    <div :class="($q.platform.is.mobile ? '' : 'q-mx-xl')">

      <div class="markdown-nav-bar shadow-10">
        <div class="title">
          <span class="ellipsis">{{ title }}</span>
        </div>
      </div>

      <example-viewer
        title="QGrid Filter Customization"
        file="FilterCustomization"
      />

      <page-footer></page-footer>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent, defineComponent } from 'vue'

const year = (new Date()).getFullYear()

export default defineComponent({
  name: 'FilterCustomizationExample',
  setup () {
    return {
      title: 'QGrid Filter Customization',
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
