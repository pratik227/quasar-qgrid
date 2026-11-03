<template>
  <div class="not-found">
    <div class="not-found__code">404</div>
    <h1>This page could not be found.</h1>
    <p class="muted">The link may be broken, or the page may have moved.</p>
    <div class="row q-gutter-sm justify-center">
      <router-link to="/" class="pill pill--solid pill--lg">Back home</router-link>
      <router-link to="/docs" class="pill pill--ghost pill--lg">Read the docs</router-link>
    </div>
  </div>
</template>

<style>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--bg-soft);
  text-align: center;
}

.not-found__code {
  color: var(--text-3);
  font: 300 120px/1 var(--font-display);
  letter-spacing: -.04em;
}

.not-found h1 {
  margin: 16px 0 8px;
  color: var(--text-strong);
  font: 300 36px/1.15 var(--font-display);
  letter-spacing: -.02em;
}

.not-found p {
  margin-bottom: 28px;
}
</style>
