<template>
  <q-layout view="hHh LpR fff" class="docs-layout">
    <q-header class="docs-header">
      <div class="docs-header__row">
        <q-btn
          flat round dense
          icon="menu"
          class="lt-md q-mr-xs"
          aria-label="Menu"
          @click="drawer = !drawer"
        />
        <brand-mark />
        <span class="docs-header__product gt-xs">Docs</span>

        <button class="docs-search" aria-label="Search" @click="searchOpen = true">
          <q-icon name="search" size="18px" />
          <span class="docs-search__label">Search</span>
          <kbd class="gt-xs">/</kbd>
        </button>

        <nav class="docs-header__links gt-sm">
          <a href="https://github.com/pratik227/quasar-qgrid" target="_blank" rel="noopener">GitHub</a>
          <a href="https://www.npmjs.com/package/quasar-app-extension-qgrid" target="_blank" rel="noopener">npm</a>
          <router-link to="/docs/whats-new">Changelog</router-link>
        </nav>
        <a class="btn-square btn-square--solid gt-xs" href="https://github.com/sponsors/pratik227" target="_blank" rel="noopener">Sponsor</a>
        <q-btn
          flat round dense
          class="q-ml-xs"
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          :aria-label="$q.dark.isActive ? 'Light theme' : 'Dark theme'"
          @click="$q.dark.toggle()"
        />
      </div>
      <nav class="docs-tabs">
        <router-link
          v-for="t in tabs"
          :key="t.key"
          :to="t.to"
          class="docs-tabs__tab"
          :class="{ active: t.key === currentTab.key }"
        >{{ t.title }}</router-link>
      </nav>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="264"
      :breakpoint="1023"
      class="docs-drawer"
    >
      <nav class="docs-nav" aria-label="Section navigation">
        <div v-for="section in currentTab.sections" :key="section.title" class="docs-nav__section">
          <div class="docs-nav__heading">{{ section.title }}</div>
          <template v-for="item in section.items" :key="item.title">
            <a v-if="item.href" :href="item.href" target="_blank" rel="noopener" class="docs-nav__item">
              {{ item.title }} <q-icon name="north_east" size="12px" />
            </a>
            <router-link
              v-else
              :to="item.to"
              class="docs-nav__item"
              :class="{ active: isActive(item) }"
              @click="closeOnMobile"
            >
              <span>{{ item.title }}</span>
              <span v-if="item.isNew" class="badge-new">New</span>
            </router-link>
          </template>
        </div>
      </nav>
    </q-drawer>

    <q-page-container>
      <q-page class="docs-page">
        <div class="docs-grid">
          <main ref="mainRef" class="docs-main">
            <router-view v-slot="{ Component }">
              <component :is="Component" :key="$route.path" />
            </router-view>
          </main>
          <aside v-if="toc.length > 1" class="docs-toc gt-md" aria-label="On this page">
            <div class="docs-toc__title">On this page</div>
            <a
              v-for="h in toc"
              :key="h.id"
              :href="'#' + h.id"
              class="docs-toc__item"
              :class="{ 'docs-toc__item--sub': h.level === 3, active: h.id === activeId }"
              @click.prevent="scrollTo(h.id)"
            >{{ h.text }}</a>
          </aside>
        </div>
        <footer class="docs-footer">
          <span>MIT License · © 2020–{{ year }} Pratik Patel</span>
          <span class="docs-footer__links">
            <a href="https://github.com/pratik227/quasar-qgrid" target="_blank" rel="noopener">GitHub</a>
            <a href="https://github.com/sponsors/pratik227" target="_blank" rel="noopener">Sponsor</a>
            <a href="https://quasar.dev" target="_blank" rel="noopener">Quasar</a>
          </span>
        </footer>
      </q-page>
    </q-page-container>

    <search-dialog v-model="searchOpen" />
  </q-layout>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import BrandMark from '../components/BrandMark.vue'
import SearchDialog from '../components/SearchDialog.vue'
import { tabs, tabForPath } from '../docs/nav.js'

const $q = useQuasar()
const $route = useRoute()
const $router = useRouter()

const drawer = ref(false)
const searchOpen = ref(false)
const mainRef = ref(null)
const toc = ref([])
const activeId = ref('')
const year = new Date().getFullYear()

const currentTab = computed(() => tabs.find(t => t.key === tabForPath($route.path)))

function isActive (item) {
  return item.to === $route.path
}

function closeOnMobile () {
  if ($q.screen.lt.md) drawer.value = false
}

const slugify = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

function buildToc () {
  const root = mainRef.value
  if (!root) return
  const seen = {}
  toc.value = Array.from(root.querySelectorAll('.prose h2, .prose h3')).map(el => {
    if (!el.id) {
      let id = slugify(el.textContent)
      seen[id] = (seen[id] || 0) + 1
      if (seen[id] > 1) id += '-' + seen[id]
      el.id = id
    }
    return { id: el.id, text: el.textContent.trim(), level: el.tagName === 'H3' ? 3 : 2 }
  })
  onScroll()
}

function onScroll () {
  const offset = 140
  let current = toc.value.length ? toc.value[0].id : ''
  toc.value.forEach(h => {
    const el = document.getElementById(h.id)
    if (el && el.getBoundingClientRect().top - offset <= 0) current = h.id
  })
  activeId.value = current
}

function scrollTo (id) {
  $router.replace({ hash: '#' + id })
  const el = document.getElementById(id)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 128, behavior: 'smooth' })
}

let observer = null

function onKey (e) {
  const tag = (e.target && e.target.tagName) || ''
  const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)
  if ((e.key === '/' && !typing) || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
    e.preventDefault()
    searchOpen.value = true
  }
}

watch(() => $route.path, () => nextTick(() => setTimeout(buildToc, 60)))

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  // async pages / examples render after navigation: rebuild the TOC when the content changes
  observer = new MutationObserver(() => {
    clearTimeout(observer.timer)
    observer.timer = setTimeout(buildToc, 120)
  })
  if (mainRef.value) observer.observe(mainRef.value, { childList: true, subtree: true })
  setTimeout(buildToc, 60)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  if (observer) observer.disconnect()
})
</script>

<style>
.docs-layout {
  background: var(--bg);
}

.docs-header {
  background: var(--bg);
  color: var(--text);
  border-bottom: 1px solid var(--border);
}

.docs-header__row {
  display: flex;
  align-items: center;
  gap: 12px;
  height: var(--header-h);
  padding: 0 32px;
}

.docs-header__product {
  margin-left: -4px;
  padding-left: 10px;
  border-left: 1px solid var(--border-strong);
  color: var(--text-2);
  font-size: 15px;
}

.docs-search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 560px;
  height: 36px;
  margin: 0 12px 0 20px;
  padding: 0 8px 0 10px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text-2);
  font: 500 14px/1 var(--font-sans);
  cursor: pointer;
  transition: border-color .15s;
}

.docs-search:hover {
  border-color: var(--text-3);
}

.docs-search__label {
  flex: 1;
  text-align: left;
}

.docs-header__links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.docs-header__links a {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: 14px;
  text-decoration: none;
}

.docs-header__links a:hover {
  background: var(--surface-hover);
  color: var(--text-strong);
}

.docs-tabs {
  display: flex;
  gap: 24px;
  height: var(--tabs-h);
  padding: 0 32px;
  overflow-x: auto;
}

.docs-tabs__tab {
  display: flex;
  align-items: center;
  border-bottom: 2px solid transparent;
  color: var(--text-2);
  font-size: 14.5px;
  text-decoration: none;
  white-space: nowrap;
}

.docs-tabs__tab:hover {
  color: var(--text-strong);
}

.docs-tabs__tab.active {
  border-bottom-color: var(--text-strong);
  color: var(--text-strong);
  font-weight: 600;
}

.docs-drawer {
  background: var(--bg);
  border-right: 1px solid var(--border);
}

.docs-drawer.q-drawer--mobile {
  background: var(--bg);
}

.docs-nav {
  padding: 28px 16px 48px 24px;
}

.docs-nav__section + .docs-nav__section {
  margin-top: 28px;
}

.docs-nav__heading {
  margin: 0 0 6px 8px;
  color: var(--text-strong);
  font-size: 13px;
  font-weight: 600;
}

.docs-nav__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: 14px;
  line-height: 22px;
  text-decoration: none;
  transition: background-color .12s, color .12s;
}

.docs-nav__item:hover {
  background: var(--surface-hover);
  color: var(--text-strong);
}

.docs-nav__item.active {
  background: var(--surface-active);
  color: var(--text-strong);
  font-weight: 500;
}

.docs-grid {
  display: flex;
  justify-content: center;
  gap: 56px;
  padding: 40px 48px 0 72px;
}

.docs-main {
  flex: 1;
  min-width: 0;
  max-width: 820px;
}

.docs-toc {
  position: sticky;
  top: calc(var(--header-h) + var(--tabs-h) + 40px);
  align-self: flex-start;
  width: 220px;
  flex: none;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.docs-toc__title {
  margin-bottom: 12px;
  color: var(--text-strong);
  font-size: 14px;
  font-weight: 500;
}

.docs-toc__item {
  display: block;
  padding: 4px 0 4px 14px;
  border-left: 1px solid var(--border-strong);
  color: var(--text-2);
  font-size: 14px;
  line-height: 20px;
  text-decoration: none;
}

.docs-toc__item--sub {
  padding-left: 26px;
}

.docs-toc__item:hover {
  color: var(--text-strong);
}

.docs-toc__item.active {
  border-left: 2px solid var(--text-strong);
  padding-left: 13px;
  color: var(--text-strong);
}

.docs-toc__item--sub.active {
  padding-left: 25px;
}

.docs-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  max-width: 1150px;
  margin: 72px auto 0;
  padding: 24px 48px 40px 72px;
  border-top: 1px solid var(--border);
  color: var(--text-3);
  font-size: 13px;
}

.docs-footer__links {
  display: flex;
  gap: 16px;
}

.docs-footer a {
  color: var(--text-2);
  text-decoration: none;
}

.docs-footer a:hover {
  color: var(--text-strong);
}

@media (max-width: 1023px) {
  .docs-header__row, .docs-tabs { padding: 0 16px; }
  .docs-grid { padding: 28px 20px 0; }
  .docs-footer { padding: 24px 20px 32px; }
}
</style>
