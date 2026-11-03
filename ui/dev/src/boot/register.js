import { defineBoot } from '#q-app'
import VuePlugin from 'ui' // "ui" is aliased in quasar.config.js

export default defineBoot(({ app }) => {
  app.use(VuePlugin)
})
