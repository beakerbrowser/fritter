/* globals app */

const yo = require('yo-yo')

// exported api
// =

module.exports = function renderFollowButton (profile) {
  if (profile.isCurrentUser) return ''
  var cls = app.isCurrentUserFollowing(profile) ? 'following' : ''
  return yo`
    <button class="follow-btn btn ${cls}" onclick=${onToggleFollowing}>
      ${app.isCurrentUserFollowing(profile) ? 'Following' : 'Follow'}
    </button>`

  async function onToggleFollowing (e) {
    e.preventDefault()
    e.stopPropagation()
    await app.toggleFollowing(profile)
  }
}
