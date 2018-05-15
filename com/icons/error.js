const svg = require('../../lib/svg')

module.exports = function render () {
  return svg.create('#error-icon-svg', {
    width: '16',
    height: '16',
    viewBox: '0 0 512 512'
  })
}
