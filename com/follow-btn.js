/* globals app */

const yo = require('yo-yo')

// globals
let isHovering = false
let btnText

// exported api
// =

module.exports = function renderFollowButton (profile) {
  if (profile.isCurrentUser) return ''

  if (app.isCurrentUserFollowing(profile)) {
    if (isHovering) {
      btnText = 'Unfollow'
      cls = 'unfollow'
    } else {
      btnText = 'Following'
      cls = 'following'
    }
  } else {
    btnText = 'Follow'
    cls = ''
  }
  return yo`
    <button class="follow-btn btn ${cls}" onclick=${onToggleFollowing} onmouseover=${onMouseOver} onmouseout=${onMouseOut}>
      ${btnText}
    </button>`

  async function onToggleFollowing (e) {
    e.preventDefault()
    e.stopPropagation()
    await app.toggleFollowing(profile)
  }

  function onMouseOver () {
    if (!isHovering) {
      isHovering = true
      app.render()
    }
  }

  function onMouseOut () {
    if (isHovering) {
      isHovering = false
      app.render()
    }
  }
}
