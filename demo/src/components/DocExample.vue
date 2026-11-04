<template>
  <div class="doc-example">
    <div class="doc-example__bar">
      <div class="seg" role="tablist">
        <button
          role="tab"
          :aria-selected="view === 'preview'"
          :class="{ active: view === 'preview' }"
          @click="view = 'preview'"
        >Preview</button>
        <button
          role="tab"
          :aria-selected="view === 'code'"
          :class="{ active: view === 'code' }"
          @click="view = 'code'"
        >Code</button>
      </div>
      <div class="doc-example__file mono">{{ file }}.vue</div>
    </div>

    <div v-show="view === 'preview'" class="doc-example__preview demo-surface">
      <component :is="component" v-if="component" />
      <div v-else class="doc-example__loading">
        <q-spinner size="22px" />
      </div>
    </div>
    <code-block v-if="view === 'code' && source" :code="source" lang="vue" flush max-height="560px" />
  </div>
</template>

<script setup>
import { defineAsyncComponent, ref, shallowRef, watch } from 'vue'
import CodeBlock from './CodeBlock.vue'

const props = defineProps({
  file: { type: String, required: true }
})

const modules = import.meta.glob('../examples/*.vue')
const sources = import.meta.glob('../examples/*.vue', { query: '?raw', import: 'default' })

const view = ref('preview')
const component = shallowRef(null)
const source = ref('')

watch(() => props.file, file => {
  const key = '../examples/' + file + '.vue'
  view.value = 'preview'
  source.value = ''
  component.value = modules[key] ? defineAsyncComponent(modules[key]) : null
  if (sources[key]) sources[key]().then(code => { source.value = code })
}, { immediate: true })
</script>

<style>
.doc-example {
  margin: 16px 0 32px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--bg);
  overflow: hidden;
}

.doc-example__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 8px 8px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

.doc-example__file {
  color: var(--text-3);
  font-size: 12px;
}

.doc-example__preview {
  padding: 20px;
  overflow-x: auto;
}

.doc-example__loading {
  display: flex;
  justify-content: center;
  padding: 48px;
  color: var(--text-3);
}
</style>
