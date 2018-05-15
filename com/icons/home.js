const svg = require('../../lib/svg')

module.exports = function render () {
  return svg.create('#home-icon-svg', {
    width: '12',
    height: '12',
    viewBox: '0 0 512 512'
  })
}
