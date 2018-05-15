const svg = require('../../lib/svg')

module.exports = function render () {
  return svg.create('#heart-icon-svg', {
    class: 'icon heart',
    width: '98px',
    height: '93px',
    viewBox: '0 0 98 93'
  })
}
