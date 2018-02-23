/* globals app */

const yo = require('yo-yo')
let coordinates = '0, 0'
let selectedIndex = 0

// exported api
// =

module.exports = function renderMentions() {

  return yo`
    <div class="mention-window" style="transform: translate(${ app.mentionCoordinates })">
      ${ app.possibleMentions.map((mention, i) => renderPossibleMention(mention, i)) }
    </div>
  `
}

// internal methods
// =

function renderPossibleMention(mention, index) {
  return yo`
    <button class="${ index === selectedIndex ? 'selected' : '' }">${ mention.name }</button>
  `
}
