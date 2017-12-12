/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderFollowButton = require('./follow-btn')

// exported api
// =

module.exports = function renderProfileListingItem (profile) {
  return yo`
    <div class="feed-item profile" onclick=${e => app.gotoProfile(profile)}>
      <div class="profile-feed-item-header">
        ${renderAvatar(profile)}

        <div>
          <div class="name" onclick=${e => app.gotoProfile(profile)}>${profile.name || 'Anonymous'}</div>
          ${renderFollowButton(profile)}
        </div>
      </div>

      <p class="bio">${profile.bio}</p>
    </div>
  `
}
