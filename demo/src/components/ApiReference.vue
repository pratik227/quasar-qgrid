<template>
  <div class="api-ref">
    <div class="api-ref__toolbar">
      <div class="seg" role="tablist" aria-label="API sections">
        <button
          v-for="t in sections"
          :key="t.key"
          role="tab"
          :aria-selected="tab === t.key"
          :class="{ active: tab === t.key }"
          @click="tab = t.key"
        >{{ t.label }} <span class="seg__count">{{ t.count }}</span></button>
      </div>
      <label class="filter-input api-ref__filter">
        <q-icon name="search" size="18px" />
        <input v-model="needle" type="search" placeholder="Filter props, slots, events…" aria-label="Filter the API">
        <button v-if="needle" class="filter-input__clear" aria-label="Clear filter" @click.prevent="needle = ''">
          <q-icon name="close" size="16px" />
        </button>
      </label>
    </div>

    <div class="api-ref__list">
      <div v-for="entry in entries" :key="entry.name" class="api-ref__item">
        <div class="api-ref__name">
          <code>{{ entry.name }}</code>
          <span v-if="entry.type" class="api-ref__type mono">{{ entry.type }}</span>
          <span v-if="entry.default !== undefined" class="api-ref__default mono">default: {{ entry.default }}</span>
        </div>
        <div class="api-ref__desc">{{ entry.desc }}</div>
        <div v-if="entry.extra" class="api-ref__extra mono">{{ entry.extra }}</div>
      </div>
      <div v-if="entries.length === 0" class="muted q-pa-md">No match.</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import api from 'quasar-ui-qgrid/src/components/QGrid.json'

const tab = ref('props')
const needle = ref('')

const typeOf = t => Array.isArray(t) ? t.join(' | ') : t

const all = {
  props: Object.keys(api.props).map(name => {
    const p = api.props[name]
    return { name, type: typeOf(p.type), default: p.default, desc: p.desc, extra: p.values ? 'values: ' + p.values.join(', ') : '' }
  }),
  slots: Object.keys(api.slots).map(name => ({ name: '#' + name, desc: api.slots[name].desc })),
  events: Object.keys(api.events).map(name => {
    const e = api.events[name]
    const params = e.params ? Object.keys(e.params).map(k => k + (e.params[k].desc ? ' ' + e.params[k].desc : '')).join(', ') : ''
    return { name: '@' + name, desc: e.desc, extra: params ? '(' + params + ')' : '' }
  }),
  methods: Object.keys(api.methods).map(name => {
    const m = api.methods[name]
    const params = m.params ? Object.keys(m.params).join(', ') : ''
    return { name: name + '(' + params + ')', type: m.returns ? '→ ' + m.returns.type : '', desc: m.desc }
  })
}

const sections = computed(() => [
  { key: 'props', label: 'Props', count: all.props.length },
  { key: 'slots', label: 'Slots', count: all.slots.length },
  { key: 'events', label: 'Events', count: all.events.length },
  { key: 'methods', label: 'Methods', count: all.methods.length }
])

const entries = computed(() => {
  const n = (needle.value || '').toLowerCase()
  return all[tab.value].filter(e => !n || e.name.toLowerCase().includes(n) || (e.desc || '').toLowerCase().includes(n))
})
</script>

<style>
.api-ref {
  margin: 16px 0 32px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.api-ref__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

.api-ref__filter {
  width: 260px;
  max-width: 100%;
}

.api-ref__filter input::-webkit-search-cancel-button {
  display: none;
}

@media (max-width: 599px) {
  .api-ref__filter {
    width: 100%;
  }

  .api-ref .seg {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
  }

  .api-ref .seg button {
    justify-content: center;
    padding: 0 4px;
  }

  .api-ref .seg__count {
    display: none;
  }
}

.api-ref__item {
  padding: 14px 18px;
  border-top: 1px solid var(--border);
}

.api-ref__item:first-child {
  border-top: 0;
}

.api-ref__name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.api-ref__name code {
  color: var(--text-strong);
  font-size: 14px;
  font-weight: 500;
}

.api-ref__type, .api-ref__default {
  padding: 1px 7px;
  border-radius: 6px;
  background: var(--surface-active);
  color: var(--text-2);
  font-size: 12px;
}

.api-ref__desc {
  margin-top: 4px;
  color: var(--text-2);
  font-size: 14px;
  line-height: 22px;
}

.api-ref__extra {
  margin-top: 4px;
  color: var(--text-3);
  font-size: 12px;
}
</style>
