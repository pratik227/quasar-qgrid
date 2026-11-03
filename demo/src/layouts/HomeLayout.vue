<template>
  <q-layout view="hhh lpr fff" class="home-layout">
    <div class="announce">
      <span class="badge-new">New</span>
      <span>QGrid 1.2 — column pinning & resizing, multi-sort, context menu and clipboard.</span>
      <router-link to="/docs/whats-new" class="pill pill--ghost announce__pill">See what's new</router-link>
    </div>

    <q-page-container>
      <div class="sheet">
        <header class="home-nav">
          <brand-mark />
          <nav class="home-nav__links gt-sm">
            <router-link to="/docs">Docs</router-link>
            <router-link to="/docs/examples">Examples</router-link>
            <router-link to="/docs/api">API</router-link>
            <a href="https://github.com/pratik227/quasar-qgrid" target="_blank" rel="noopener">GitHub</a>
            <router-link to="/docs/sponsor">Sponsor</router-link>
          </nav>
          <div class="home-nav__actions">
            <q-btn
              flat round dense
              :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
              :aria-label="$q.dark.isActive ? 'Light theme' : 'Dark theme'"
              @click="$q.dark.toggle()"
            />
            <a class="pill pill--ghost gt-xs" href="https://github.com/pratik227/quasar-qgrid" target="_blank" rel="noopener">
              <q-icon name="star_outline" size="16px" /> Star
            </a>
            <router-link to="/docs/installation" class="pill pill--solid">Get started</router-link>
          </div>
        </header>
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import BrandMark from '../components/BrandMark.vue'
</script>

<style>
.home-layout {
  background: var(--bg-page);
}

.announce {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 48px;
  padding: 6px 16px;
  color: var(--text-strong);
  font-size: 14px;
}

.announce__pill {
  height: 30px;
  padding: 0 12px;
  font-size: 13px;
}

.sheet {
  min-height: calc(100vh - 48px);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  background: var(--bg-soft);
  box-shadow: 0 0 0 1px var(--border);
}

.home-nav {
  display: flex;
  align-items: center;
  gap: 40px;
  max-width: 1200px;
  height: 72px;
  margin: 0 auto;
  padding: 0 24px;
}

.home-nav__links {
  display: flex;
  gap: 4px;
}

.home-nav__links a {
  padding: 6px 12px;
  border-radius: 9999px;
  color: var(--text-strong);
  font-size: 14px;
  text-decoration: none;
}

.home-nav__links a:hover {
  background: var(--surface-hover);
}

.home-nav__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
</style>
