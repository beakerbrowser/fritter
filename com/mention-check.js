/* globals app */

const caretCoordinates = require('textarea-caret')
let allFollowed

// exported api
// =

module.exports = function mentionCheck(text) {

  // save our list of followed users if we haven't yet
  if (!allFollowed) {
    allFollowed = app.currentUserProfile.follows
  }

  const activeElement = document.activeElement
  const cursorPos = activeElement.selectionStart

  // look for the last @ before the cursor
  const atIndex = text.slice(0, cursorPos).lastIndexOf('@')

  // cancel if there's no @
  if (atIndex == -1) {
    return false
  }

  let coordinates = false

  // check for a followed name between the @ and the cursor
  const textToSearch = text.slice(atIndex + 1, cursorPos).toLowerCase()

  // if we're just starting the mention, add the caret coordinate (calculate bottom left, accounting for scroll)
  if (textToSearch.length == 0) {
    const rawCoordinates = caretCoordinates(activeElement, cursorPos)
    const y = rawCoordinates.top + rawCoordinates.height - activeElement.scrollTop
    coordinates = { x: rawCoordinates.left, y }
  }

  const mentions = allFollowed.filter(user => user.name.toLowerCase().includes(textToSearch))

  return { mentions, coordinates }
}
