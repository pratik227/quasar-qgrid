<template>
  <div class="code-block" :class="{ 'code-block--flush': flush }">
    <div v-if="title || tabs" class="code-block__bar">
      <div class="code-block__tabs">
        <template v-if="tabs">
          <button
            v-for="(tab, i) in tabs"
            :key="tab.label"
            class="code-block__tab"
            :class="{ 'code-block__tab--active': i === activeTab }"
            @click="activeTab = i"
          >{{ tab.label }}</button>
        </template>
        <span v-else class="code-block__title">{{ title }}</span>
      </div>
      <button class="code-block__copy" :aria-label="copied ? 'Copied' : 'Copy code'" @click="copy">
        <q-icon :name="copied ? 'check' : 'content_copy'" size="15px" />
        <span>{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>
    <button v-else class="code-block__copy code-block__copy--floating" :aria-label="copied ? 'Copied' : 'Copy code'" @click="copy">
      <q-icon :name="copied ? 'check' : 'content_copy'" size="15px" />
    </button>
    <pre :style="maxHeight ? { maxHeight } : null"><code class="hljs" v-html="highlighted" /></pre>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { copyToClipboard } from 'quasar'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('vue', xml)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('css', css)

const props = defineProps({
  code: { type: String, default: '' },
  lang: { type: String, default: 'vue' },
  title: String,
  tabs: Array, // [{ label, code, lang }]
  maxHeight: String,
  flush: Boolean
})

const activeTab = ref(0)
const copied = ref(false)

const current = computed(() => props.tabs
  ? props.tabs[activeTab.value]
  : { code: props.code, lang: props.lang })

// highlight.js escapes the source, so v-html only ever receives its own markup
const highlighted = computed(() =>
  hljs.highlight(current.value.code.replace(/\s+$/, ''), { language: current.value.lang || 'vue' }).value
)

function copy () {
  copyToClipboard(current.value.code).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 1600)
  })
}
</script>

<style>
.code-block {
  position: relative;
  margin: 12px 0 24px;
  border: 1px solid var(--code-border);
  border-radius: var(--radius);
  background: var(--code-bg);
  overflow: hidden;
}

.code-block--flush {
  margin: 0;
  border: 0;
  border-radius: 0;
}

.code-block__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  padding: 0 8px 0 4px;
  border-bottom: 1px solid var(--code-border);
}

.code-block__tabs {
  display: flex;
  align-items: center;
  height: 100%;
  overflow-x: auto;
}

.code-block__title {
  padding: 0 10px;
  color: var(--text-2);
  font: 500 13px/1 var(--font-mono);
}

.code-block__tab {
  height: 100%;
  padding: 0 10px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--text-2);
  font: 500 13px/1 var(--font-sans);
  cursor: pointer;
}

.code-block__tab--active {
  border-bottom-color: var(--text-strong);
  color: var(--text-strong);
}

.code-block__copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text-2);
  font: 500 12px/1 var(--font-sans);
  cursor: pointer;
}

.code-block__copy:hover {
  color: var(--text-strong);
}

.code-block__copy--floating {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 0 7px;
  opacity: 0;
  transition: opacity .15s;
}

.code-block:hover .code-block__copy--floating,
.code-block__copy--floating:focus-visible {
  opacity: 1;
}

.code-block pre {
  margin: 0;
  padding: 16px 18px;
  overflow: auto;
  font: 400 13px/1.7 var(--font-mono);
  tab-size: 2;
}

.code-block code.hljs {
  padding: 0;
  background: none;
  color: var(--text);
}

/* syntax theme (light) */
.hljs-comment, .hljs-quote { color: #8a8a8a; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #a626a4; }
.hljs-string, .hljs-attr-value, .hljs-template-variable { color: #2f7d32; }
.hljs-tag, .hljs-name { color: #1d4ed8; }
.hljs-attr, .hljs-attribute, .hljs-property { color: #b45309; }
.hljs-number, .hljs-literal { color: #c2410c; }
.hljs-title, .hljs-title.function_ { color: #0e7490; }
.hljs-meta, .hljs-symbol { color: #6b7280; }

/* syntax theme (dark) */
body.body--dark .hljs-comment, body.body--dark .hljs-quote { color: #7c7c7c; }
body.body--dark .hljs-keyword, body.body--dark .hljs-selector-tag, body.body--dark .hljs-built_in { color: #d19af0; }
body.body--dark .hljs-string, body.body--dark .hljs-attr-value { color: #9be29b; }
body.body--dark .hljs-tag, body.body--dark .hljs-name { color: #8ab4ff; }
body.body--dark .hljs-attr, body.body--dark .hljs-attribute, body.body--dark .hljs-property { color: #f5c37a; }
body.body--dark .hljs-number, body.body--dark .hljs-literal { color: #ffa07a; }
body.body--dark .hljs-title, body.body--dark .hljs-title.function_ { color: #67d4e6; }
</style>
