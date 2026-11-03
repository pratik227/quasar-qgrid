/**
 * Registers the QGrid component globally.
 *
 * Intentionally does not import `boot` from 'quasar/wrappers' (deprecated since
 * @quasar/app-vite v2 / @quasar/app-webpack v4) nor `defineBoot` from '#q-app'
 * (only available on the newest CLIs): both are identity helpers, so exporting
 * the boot function directly works on every supported Quasar CLI.
 */
import * as VuePlugin from 'quasar-ui-qgrid/src/vue-plugin'

export default ({ app }) => {
  app.use(VuePlugin)
}
