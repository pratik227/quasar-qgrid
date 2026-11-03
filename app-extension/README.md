# Quasar App Extension qgrid

Registers **QGrid** (`<q-grid>`) in your Quasar CLI app: a free data grid on top of QTable with column & header filters, grouping, footer totals, inline editing, drag & drop, real Excel export, virtual scroll and state persistence.

Compatible with `quasar` v2, `@quasar/app-vite` v1 – v3 and `@quasar/app-webpack` v3 – v4.

[![npm](https://img.shields.io/npm/v/quasar-app-extension-qgrid.svg?label=quasar-app-extension-qgrid)](https://www.npmjs.com/package/quasar-app-extension-qgrid)
[![npm](https://img.shields.io/npm/dt/quasar-app-extension-qgrid.svg)](https://www.npmjs.com/package/quasar-app-extension-qgrid)

# Install
```bash
quasar ext add qgrid
```
Quasar CLI will retrieve it from NPM and install the extension.

# Uninstall
```bash
quasar ext remove qgrid
```

# Info
The extension:
- adds a boot file that installs the `quasar-ui-qgrid` Vue plugin,
- makes webpack transpile the component sources (app-webpack) or keeps Vite's dependency optimizer away from them (app-vite),
- registers the component API, so `quasar describe QGrid` works.

Docs, examples and API: https://next-quasar-qgrid.netlify.app

# Sponsors

<p align="center">
  <a href="https://github.com/pratik227/static/blob/main/sponsors.svg">
    <img src='https://github.com/pratik227/static/blob/main/sponsors.svg'/>
  </a>
</p>

# Donate

If this helped you in any way, you can contribute to this project for long term survival by supporting me:

### [💜 Support my open-source work on GitHub](https://github.com/sponsors/pratik227)

Be sure to check out my sponsor page.

Thank you so much!!!

# License
MIT (c) pratikpatelpp802@gmail.com
