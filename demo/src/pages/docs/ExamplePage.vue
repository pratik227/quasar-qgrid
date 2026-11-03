<template>
  <doc-page v-if="example" :key="example.slug" :title="example.title" :lead="example.desc" :eyebrow="'Examples · ' + example.group" :is-new="example.isNew">
    <doc-example :file="example.file" />
    <p class="muted">
      Source: <a :href="'https://github.com/pratik227/quasar-qgrid/blob/next/demo/src/examples/' + example.file + '.vue'" target="_blank" rel="noopener">demo/src/examples/{{ example.file }}.vue</a>
    </p>
  </doc-page>
  <doc-page v-else title="Example not found" lead="This example does not exist (anymore).">
    <p><router-link to="/docs/examples">Browse all examples</router-link></p>
  </doc-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DocPage from '../../components/DocPage.vue'
import DocExample from '../../components/DocExample.vue'
import { examples } from '../../docs/nav.js'

const $route = useRoute()
const example = computed(() => examples.find(e => e.slug === $route.params.slug))
</script>
