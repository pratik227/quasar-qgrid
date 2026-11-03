<template>
  <div class="callout" :class="'callout--' + type">
    <q-icon :name="icon" size="18px" class="callout__icon" />
    <div class="callout__body">
      <div v-if="title" class="callout__title">{{ title }}</div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'note' }, // note | tip | warning
  title: String
})

const icon = computed(() => ({ note: 'info', tip: 'lightbulb', warning: 'warning' })[props.type] || 'info')
</script>

<style>
.callout {
  display: flex;
  gap: 12px;
  margin: 16px 0 24px;
  padding: 14px 16px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius);
  background: var(--note-bg);
  font-size: 15px;
  line-height: 24px;
}

.callout__icon {
  margin-top: 3px;
  color: var(--text-2);
}

.callout__title {
  color: var(--text-strong);
  font-weight: 600;
}

.callout__body > :last-child {
  margin-bottom: 0;
}

.callout--tip {
  border-color: rgba(15, 123, 62, .28);
  background: var(--new-bg);
}

.callout--tip .callout__icon {
  color: var(--new);
}

.callout--warning {
  border-color: rgba(180, 83, 9, .3);
  background: rgba(245, 158, 11, .08);
}

.callout--warning .callout__icon {
  color: #b45309;
}
</style>
