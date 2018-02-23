/* globals app */

const yo = require('yo-yo')
let coordinates = '0, 0'

// exported api
// =

module.exports = function renderMentions(possibleMentions) {

  // update coordinates if necessary
  if (possibleMentions.coordinates !== false) {
    coordinates = `${ possibleMentions.coordinates.x }px, ${ possibleMentions.coordinates.y }px`
  }

  return yo`
    <div class="mention-window" style="transform: translate(${ coordinates })">
      ${ possibleMentions.mentions.map(mention => renderPossibleMention(mention)) }
    </div>
  `
}

// internal methods
// =

function renderPossibleMention(mention) {
  return yo`
    <button>${ mention.name }</button>
  `
}
