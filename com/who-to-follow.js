/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderFollowButton = require('./follow-btn')

// exported api
// =

module.exports = function renderWhoToFollow () {
  if (!app.whoToFollow.length) return ''
  return yo`
    <div class="who-to-follow-container">
      <h2>Who to follow</h2>
      <div class="who-to-follow">${app.whoToFollow.map(renderProfileLite)}</div>
    </div>
  `
}

// internal methods
// =

function renderProfileLite (profile) {
  return yo`
    <div onclick=${e => app.gotoProfile(profile, e)} class="profile-lite">
      ${renderAvatar(profile)}
      <span class="content">
        <div class="name">${profile.name}</div>
        ${renderFollowButton(profile)}
      </span>
    </div>
  `
}
