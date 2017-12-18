/* globals app */

const yo = require('yo-yo')
const renderHomeIcon = require('./icons/home')

// exported api
// =

module.exports = function () {
  const larr = yo`<span></span>`
  larr.innerHTML = '&larr;'
  return yo`
    <a class="back-to-feed" onclick=${e => app.gotoFeed(e)} href="/">
      ${larr} ${renderHomeIcon()}
    </a>`
}
