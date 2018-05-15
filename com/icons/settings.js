const svg = require('../../lib/svg')

module.exports = function render () {
  return svg.create('#settings-icon-svg', {
    width: '48',
    height: '48',
    viewBox: '0 0 48 48'
  })
}
