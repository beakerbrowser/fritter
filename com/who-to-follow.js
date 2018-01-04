/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderFollowButton = require('./follow-btn')

// exported api
// =

module.exports = function renderWhoToFollow () {
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
      <a class="name" onclick=${e => app.gotoProfile(profile, e)}>${profile.name}</div>
      ${renderFollowButton(profile)}
    </div>
  `
}