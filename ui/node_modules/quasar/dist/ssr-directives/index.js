const noopTransform = () => ({ props: [] })
module.exports = {
  'close-popup': noopTransform,
  'intersection': noopTransform,
  'morph': require('./Morph.js'),
  'mutation': noopTransform,
  'ripple': noopTransform,
  'scroll': noopTransform,
  'scroll-fire': noopTransform,
  'touch-hold': noopTransform,
  'touch-pan': noopTransform,
  'touch-repeat': noopTransform,
  'touch-swipe': noopTransform
}
