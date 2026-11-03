/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 *
 * Supported Quasar CLIs:
 *   - @quasar/app-vite    v1, v2, v3
 *   - @quasar/app-webpack v3, v4 (and the legacy @quasar/app v3)
 *
 * Why plain CommonJS and no `defineIndexScript()` from '#q-app'?
 *   `defineIndexScript` is an identity helper used only for typings, and
 *   '#q-app' only resolves on the newest CLIs. A CommonJS function export is
 *   loaded correctly by every CLI listed above (both through `require()` and
 *   through native `import()`), so one script keeps working everywhere.
 */

const AE_PKG = 'quasar-app-extension-qgrid'
const UI_PKG = 'quasar-ui-qgrid'

/**
 * @quasar/app-vite v3+ is Vite-only and no longer exposes the
 * `api.hasVite` / `api.hasWebpack` flags, so fall back to package detection.
 */
function isWebpackCli (api) {
  if (api.hasWebpack === true) return true
  if (api.hasVite === true) return false
  return api.hasPackage('@quasar/app-webpack') || api.hasPackage('@quasar/app')
}

function extendConf (conf, api) {
  // register our boot file (it installs the QGrid Vue plugin)
  conf.boot.push(`~${AE_PKG}/src/boot/register.js`)

  if (isWebpackCli(api)) {
    // make sure the app extension files & the ui package (raw .vue/.js sources)
    // get transpiled by the host app's webpack/babel pipeline
    const transpile = conf.build.transpileDependencies
    if (Array.isArray(transpile)) {
      transpile.push(new RegExp(`${AE_PKG}[\\\\/]src`))
      transpile.push(new RegExp(`${UI_PKG}[\\\\/]src`))
    }
  }
}

module.exports = function (api) {
  // Quasar compatibility check
  api.compatibleWith('quasar', '^2.0.0')

  if (isWebpackCli(api)) {
    if (api.hasPackage('@quasar/app-webpack')) {
      api.compatibleWith('@quasar/app-webpack', '^3.0.0 || ^4.0.0')
    }
    else {
      api.compatibleWith('@quasar/app', '^3.0.0')
    }
  }
  else {
    api.compatibleWith('@quasar/app-vite', '^1.0.0 || ^2.0.0 || ^3.0.0')

    if (typeof api.extendViteConf === 'function') {
      // The ui package ships raw .vue sources: keep Vite's dependency optimizer
      // away from it so it goes through the app's Vue/Quasar plugins (and never
      // bundles a second copy of Quasar), while still pre-bundling its own deps.
      // The config is mutated in place: app-vite v1/v2 ignore returned values.
      api.extendViteConf(viteConf => {
        const optimizeDeps = viteConf.optimizeDeps = viteConf.optimizeDeps || {}

        optimizeDeps.exclude = (optimizeDeps.exclude || []).concat([AE_PKG, UI_PKG])
        optimizeDeps.include = (optimizeDeps.include || []).concat([`${UI_PKG} > sortablejs`])
      })
    }
  }

  // `quasar describe QGrid` support
  if (typeof api.registerDescribeApi === 'function') {
    api.registerDescribeApi('QGrid', `~${UI_PKG}/src/components/QGrid.json`)
  }

  // We extend /quasar.config file
  api.extendQuasarConf(extendConf)
}
