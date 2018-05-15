const svg = require('../../lib/svg')

module.exports = function render () {
  return svg.create('#replies-icon-svg', {
    class: 'icon replies',
    width: '96px',
    height: '94px',
    viewBox: '0 0 96 94'
  })
}