import { defineRouter } from '#q-app'
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import routes from './routes'

export default defineRouter(() => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : (import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  return createRouter({
    scrollBehavior (to, from, saved) {
      if (saved) return saved
      if (to.hash) return { el: to.hash, top: 120, behavior: 'smooth' }
      if (to.path !== from.path) return { left: 0, top: 0 }
    },
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE)
  })
})
