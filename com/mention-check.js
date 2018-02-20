/* globals app */

// exported api
// =

let allFollowed

module.exports = function mentionCheck(text) {

  // save our list of followed users if we haven't yet
  if (!allFollowed) {
    allFollowed = app.currentUserProfile.follows
  }

  const cursorPos = document.activeElement.selectionEnd

  // look for an @
  const atIndex = text.indexOf('@')

  // cancel if there's no @ or we're in front of it
  if (atIndex == -1 || atIndex >= cursorPos) {
    return false
  }

  // check for a followed name between the @ and the cursor
  const textToSearch = text.slice(atIndex + 1, cursorPos + 1)
  const matches = allFollowed.filter(user => user.name.toLowerCase().includes(textToSearch))

  return matches
}
