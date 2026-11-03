// Configuration for your app
// https://quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app'
import { fileURLToPath } from 'node:url'

const uiDir = fileURLToPath(new URL('../ui', import.meta.url))

export default defineConfig(() => {
  return {
    // QGrid itself is registered by the local App Extension (quasar.extensions.json)
    boot: ['theme'],

    css: ['app.css'],

    extras: ['material-icons'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14']
      },

      vueRouterMode: 'history',

      extendViteConf (viteConf) {
        // Always document the *current* source of the component (../ui),
        // not whatever quasar-ui-qgrid version npm installed.
        viteConf.resolve = viteConf.resolve || {}
        viteConf.resolve.alias = Object.assign({}, viteConf.resolve.alias, {
          'quasar-ui-qgrid': uiDir
        })
        // ../ui has no node_modules of its own at runtime: resolve shared deps from here
        viteConf.resolve.dedupe = ['vue', 'quasar', 'sortablejs', '@quasar/extras']
        viteConf.server = viteConf.server || {}
        viteConf.server.fs = { allow: ['..'] }
      }
    },

    devServer: {
      open: false
    },

    framework: {
      config: {
        dark: 'auto'
      },
      plugins: ['Notify', 'Dark', 'LocalStorage']
    },

    animations: []
  }
})
