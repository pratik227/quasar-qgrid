// Playground for the QGrid component sources (../src)
// https://quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app'
import { fileURLToPath } from 'node:url'

const uiEntry = fileURLToPath(new URL('../src/index.esm.js', import.meta.url))

export default defineConfig(() => {
  return {
    boot: ['register.js'],

    css: ['app.css'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      vueRouterMode: 'history',

      extendViteConf (viteConf) {
        viteConf.resolve = viteConf.resolve || {}
        // "ui" -> the component sources being developed
        viteConf.resolve.alias = Object.assign({}, viteConf.resolve.alias, { ui: uiEntry })
        // ../src has no node_modules at runtime: resolve shared deps from here
        viteConf.resolve.dedupe = ['vue', 'quasar', 'sortablejs']
        viteConf.server = viteConf.server || {}
        viteConf.server.fs = { allow: ['..'] }
      }
    },

    devServer: {
      open: true
    },

    framework: {
      config: {},
      plugins: ['Notify']
    },

    animations: []
  }
})
