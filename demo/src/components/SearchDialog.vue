<template>
  <q-dialog v-model="open" position="top" transition-show="jump-down" transition-hide="fade" @hide="needle = ''">
    <div class="search-dialog">
      <div class="search-dialog__input">
        <q-icon name="search" size="20px" />
        <input
          ref="inputRef"
          v-model="needle"
          placeholder="Search docs and examples…"
          aria-label="Search docs"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="go(results[active])"
        >
        <kbd>esc</kbd>
      </div>
      <div class="search-dialog__results">
        <button
          v-for="(r, i) in results"
          :key="r.to"
          class="search-dialog__result"
          :class="{ active: i === active }"
          @mouseenter="active = i"
          @click="go(r)"
        >
          <span class="search-dialog__section">{{ r.section }}</span>
          <span class="search-dialog__title">{{ r.title }}</span>
          <span v-if="r.desc" class="search-dialog__desc">{{ r.desc }}</span>
        </button>
        <div v-if="results.length === 0" class="muted q-pa-lg text-center">No results for “{{ needle }}”</div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { searchIndex } from '../docs/nav.js'

const open = defineModel({ type: Boolean, default: false })
const router = useRouter()
const needle = ref('')
const active = ref(0)
const inputRef = ref(null)
const index = searchIndex()

const results = computed(() => {
  const n = needle.value.trim().toLowerCase()
  const list = n
    ? index.filter(i => (i.title + ' ' + i.section + ' ' + (i.desc || '')).toLowerCase().includes(n))
    : index
  return list.slice(0, 12)
})

watch(results, () => { active.value = 0 })
watch(open, val => { if (val) nextTick(() => inputRef.value && inputRef.value.focus()) })

function move (step) {
  const len = results.value.length
  if (len) active.value = (active.value + step + len) % len
}

function go (r) {
  if (!r) return
  open.value = false
  router.push(r.to)
}
</script>

<style>
.search-dialog {
  width: 640px;
  max-width: calc(100vw - 32px);
  margin-top: 72px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--bg);
  box-shadow: 0 24px 64px rgba(0, 0, 0, .18);
  overflow: hidden;
}

.search-dialog__input {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-2);
}

.search-dialog__input input {
  flex: 1;
  border: 0;
  outline: 0;
  background: none;
  color: var(--text-strong);
  font: 400 16px/1 var(--font-sans);
}

.search-dialog__results {
  max-height: 60vh;
  padding: 6px;
  overflow-y: auto;
}

.search-dialog__result {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.search-dialog__result.active {
  background: var(--surface-active);
}

.search-dialog__section {
  color: var(--text-3);
  font-size: 12px;
}

.search-dialog__title {
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 500;
}

.search-dialog__desc {
  color: var(--text-2);
  font-size: 13px;
}
</style>
