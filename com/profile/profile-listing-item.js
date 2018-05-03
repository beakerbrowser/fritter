/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('../avatar')
const renderFollowButton = require('../follow-btn')

// exported api
// =

module.exports = function renderProfileListingItem (profile) {
  return yo`
    <div class="feed-item profile" onclick=${e => app.gotoProfile(profile, e)}>
        ${renderAvatar(profile, 'small')}

        <a href=${app.profileUrl(profile)} class="name" onclick=${e => app.gotoProfile(profile, e)}>
          ${profile.name || 'Anonymous'}
        </a>

        ${renderFollowButton(profile)}
    </div>
  `
}
