/* globals app */

const yo = require('yo-yo')
const { addMention } = require('../../lib/posts')

// exported api
// =

module.exports = renderMentions

// internal methods
// =

function renderMentions () {
  return yo`
    <div class="mention-picker" style="transform: translate(${app.mentionCoordinates})">
      ${app.possibleMentions.map((mention, i) => renderPossibleMention(mention, i))}
    </div>
  `
}

function renderPossibleMention (mention, index) {
  return yo`
    <button
      class="${index === app.selectedMention ? 'selected' : ''}"
      onmousedown="${() => addMention(mention)}"
      onmouseenter="${() => setSelection(index)}">
      ${mention.name}
    </button>
  `
}

function setSelection (index) {
  app.selectedMention = index
  yo.update(document.querySelector('.mention-picker'), renderMentions())
}
