const fs = require('fs')
const path = require('path')

const dist = path.resolve(__dirname, '../dist')
if (fs.existsSync(dist)) {
  fs.readdirSync(dist).forEach(file => {
    fs.rmSync(path.join(dist, file), { recursive: true, force: true })
  })
}
console.log(` 💥 Cleaned build artifacts.\n`)
