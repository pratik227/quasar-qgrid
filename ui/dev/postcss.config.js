import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    autoprefixer({ overrideBrowserslist: ['baseline widely available'] })
  ]
}
