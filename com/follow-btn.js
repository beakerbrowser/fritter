/* globals app */

const yo = require('yo-yo')

// exported api
// =

module.exports = function renderFollowButton (profile) {
  if (profile.isCurrentUser) return ''
  var cls = profile.isCurrentUserFollowing ? 'following' : ''
  return yo`
    <button class="follow-btn btn ${cls}" onclick=${onToggleFollowing}>
      ${profile.isCurrentUserFollowing ? 'Following' : 'Follow'}
    </button>`

  async function onToggleFollowing (e) {
    e.preventDefault()
    e.stopPropagation()
    await app.toggleFollowing(profile)
  }
}
