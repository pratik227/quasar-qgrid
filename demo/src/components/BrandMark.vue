<template>
  <router-link to="/" class="brand" aria-label="QGrid home">
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" rx="2.5" fill="currentColor" />
      <rect x="12" y="1" width="9" height="9" rx="2.5" fill="currentColor" opacity=".35" />
      <rect x="1" y="12" width="9" height="9" rx="2.5" fill="currentColor" opacity=".35" />
      <rect x="12" y="12" width="9" height="9" rx="2.5" fill="currentColor" />
    </svg>
    <span>QGrid</span>
  </router-link>
</template>

<style>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--text-strong);
  font: 700 19px/1 var(--font-sans);
  letter-spacing: -.03em;
  text-decoration: none;
}
</style>
