import QGrid from '../src/components/QGrid'

import pkg from '../package.json'
const { version } = pkg

function install (app) {
  app.component(QGrid.name, QGrid)
}

export {
  version,
  QGrid,

  install
}
