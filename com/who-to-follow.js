/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderName = require('./name')
const renderFollowButton = require('./follow-btn')

// exported api
// =

module.exports = function renderWhoToFollow () {
  if (!app.whoToFollow || !app.whoToFollow.length) return ''

  return yo`
    <div class="who-to-follow module">
      <h2>Who to follow</h2>

      <div class="who-to-follow-list">
        ${app.whoToFollow.map(renderProfile)}
      </div>
    </div>
  `
}

// internal methods
// =

function renderProfile (profile) {
  return yo`
    <div class="profile">
      ${renderAvatar(profile, 'small')}
      ${renderName(profile)}
      ${renderFollowButton(profile)}
    </div>
  `
}
