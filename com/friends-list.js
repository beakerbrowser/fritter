/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const {pluralize} = require('../lib/util')

// exported api
// =

module.exports = function renderFriendsList (profile) {
  if (profile.isCurrentUser || !profile.friends) return ''
  return yo`
    <div class="friends-list-container">
      <span class="url" onclick=${e => app.onUpdateViewFilter('friends')}>
        ${profile.friends.length ? `${profile.friends.length} ${pluralize(profile.friends.length, 'follower')} you know` : ''}
      </span>
      <div class="friends-list">${profile.friends.map(renderAvatar)}</div>
    </div>
  `
}
