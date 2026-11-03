<template>
  <doc-page title="Examples" lead="Every example is a live QGrid with its full source one click away.">
    <template v-for="group in groups" :key="group.title">
      <h2>{{ group.title }}</h2>
      <div class="doc-cards">
        <doc-card
          v-for="(ex, i) in group.items"
          :key="ex.slug"
          :to="'/docs/examples/' + ex.slug"
          :title="ex.title"
          :desc="ex.desc"
          :tone="i + group.tone"
          :icon="ex.icon"
          :is-new="ex.isNew"
        />
      </div>
    </template>
  </doc-page>
</template>

<script setup>
import DocPage from '../../components/DocPage.vue'
import DocCard from '../../components/DocCard.vue'
import { examples } from '../../docs/nav.js'

const icons = {
  Core: 'table_chart', Filtering: 'filter_alt', Data: 'functions', 'Drag & drop': 'drag_indicator',
  Layout: 'view_column', Slots: 'widgets', Advanced: 'tune'
}

const groups = []
examples.forEach(ex => {
  let g = groups.find(x => x.title === ex.group)
  if (!g) {
    g = { title: ex.group, items: [], tone: groups.length }
    groups.push(g)
  }
  g.items.push(Object.assign({ icon: icons[ex.group] }, ex))
})
</script>
