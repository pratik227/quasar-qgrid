<template>
  <article class="doc-page">
    <div class="doc-page__eyebrow">{{ eyebrow || $route.meta.section }}</div>
    <div class="doc-page__head">
      <h1 class="doc-page__title">
        {{ title }}
        <span v-if="isNew" class="badge-new q-ml-sm">New</span>
      </h1>
      <button class="btn-square doc-page__copy" @click="copyLink">
        <q-icon :name="copied ? 'check' : 'link'" size="16px" />
        {{ copied ? 'Copied' : 'Copy link' }}
      </button>
    </div>
    <p v-if="lead" class="doc-page__lead">{{ lead }}</p>

    <div class="prose">
      <slot />
    </div>

    <nav v-if="prev || next" class="doc-page__pager">
      <router-link v-if="prev" :to="prev.to" class="doc-page__pager-link">
        <span class="muted">Previous</span>
        <span>{{ prev.title }}</span>
      </router-link>
      <span v-else />
      <router-link v-if="next" :to="next.to" class="doc-page__pager-link doc-page__pager-link--next">
        <span class="muted">Next</span>
        <span>{{ next.title }}</span>
      </router-link>
    </nav>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { copyToClipboard, useMeta } from 'quasar'
import { tabs, tabForPath } from '../docs/nav.js'

const props = defineProps({
  title: { type: String, required: true },
  lead: String,
  eyebrow: String,
  isNew: Boolean
})

useMeta(() => ({ title: props.title + ' · QGrid' }))

const $route = useRoute()
const copied = ref(false)

const flat = computed(() => {
  const tab = tabs.find(t => t.key === tabForPath($route.path))
  return tab.sections.reduce((acc, s) => acc.concat(s.items.filter(i => i.to && i.to.indexOf('#') === -1)), [])
})
const index = computed(() => flat.value.findIndex(i => i.to === $route.path))
const prev = computed(() => index.value > 0 ? flat.value[index.value - 1] : null)
const next = computed(() => index.value !== -1 && index.value < flat.value.length - 1 ? flat.value[index.value + 1] : null)

function copyLink () {
  copyToClipboard(window.location.href.split('#')[0]).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 1600)
  })
}
</script>

<style>
.doc-page__eyebrow {
  margin-bottom: 8px;
  color: var(--text-2);
  font-size: 14px;
  font-weight: 500;
}

.doc-page__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.doc-page__title {
  margin: 0;
  color: var(--text-strong);
  font: 800 36px/45px var(--font-sans);
  letter-spacing: -.025em;
}

.doc-page__copy {
  flex: none;
  margin-top: 6px;
}

.doc-page__lead {
  margin: 12px 0 32px;
  color: var(--text-2);
  font-size: 18px;
  line-height: 28px;
}

.doc-page__pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 64px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.doc-page__pager-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 16px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color .15s;
}

.doc-page__pager-link .muted {
  font-size: 13px;
  font-weight: 400;
}

.doc-page__pager-link:hover {
  background: var(--surface-hover);
}

.doc-page__pager-link--next {
  align-items: flex-end;
  text-align: right;
}

@media (max-width: 599px) {
  .doc-page__copy { display: none; }
  .doc-page__title { font-size: 30px; line-height: 38px; }
}
</style>
