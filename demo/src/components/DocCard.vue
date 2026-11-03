<template>
  <router-link v-if="to" :to="to" class="doc-card">
    <div class="doc-card__art" :style="{ background: gradient }">
      <q-icon v-if="icon" :name="icon" size="28px" />
    </div>
    <div class="doc-card__body">
      <div class="doc-card__title">
        {{ title }}
        <span v-if="isNew" class="badge-new q-ml-xs">New</span>
      </div>
      <div class="doc-card__desc">{{ desc }}</div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const palettes = [
  ['#f9c58d', '#f48c6d', '#8fb7ff'],
  ['#b8e6c9', '#5fb6a6', '#2f5d8a'],
  ['#d9c3ff', '#8f7cf2', '#f3a6c8'],
  ['#ffe09a', '#f7a35c', '#c75d5d'],
  ['#c9e7ff', '#77b4e6', '#3c5a99'],
  ['#e6e1d6', '#bdb4a3', '#7c7466']
]

const props = defineProps({
  to: String,
  title: String,
  desc: String,
  icon: String,
  tone: { type: Number, default: 0 },
  isNew: Boolean
})

const gradient = computed(() => {
  const p = palettes[props.tone % palettes.length]
  return `radial-gradient(120% 90% at 20% 10%, ${p[0]} 0%, transparent 60%),
    radial-gradient(90% 90% at 85% 30%, ${p[1]} 0%, transparent 65%),
    radial-gradient(120% 100% at 50% 110%, ${p[2]} 0%, transparent 70%), #f2efea`
})
</script>

<style>
.doc-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--bg);
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  transition: transform .2s, box-shadow .2s;
}

.doc-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .06);
}

.doc-card__art {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: rgba(0, 0, 0, .7);
}

.doc-card__art .q-icon {
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, .85);
  box-shadow: 0 2px 10px rgba(0, 0, 0, .08);
}

.doc-card__body {
  padding: 16px 18px 18px;
}

.doc-card__title {
  color: var(--text-strong);
  font: 600 16px/22px var(--font-sans);
  letter-spacing: -.01em;
}

.doc-card__desc {
  margin-top: 4px;
  color: var(--text-2);
  font-size: 14px;
  line-height: 21px;
}

.doc-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin: 16px 0 32px;
}
</style>
