import { defineBoot } from '#q-app'
import { Dark, LocalStorage } from 'quasar'
import { watch } from 'vue'

const KEY = 'qgrid-docs-theme'

// remember the light/dark choice between visits (defaults to the OS setting)
export default defineBoot(() => {
  const saved = LocalStorage.getItem(KEY)
  if (saved === 'dark' || saved === 'light') Dark.set(saved === 'dark')
  watch(() => Dark.isActive, val => { LocalStorage.set(KEY, val ? 'dark' : 'light') })
})
