const svg = require('../../lib/svg')

module.exports = function render () {
  return svg.render(`
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512">
    <path d="M512 295.222l-256-198.713-256 198.714v-81.019l256-198.713 256 198.714zM448 288v192h-128v-128h-128v128h-128v-192l192-144z"></path>
</svg>
  `)
}
