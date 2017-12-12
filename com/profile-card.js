/* globals app */

const yo = require('yo-yo')
const imgWithFallbacks = require('./img-with-fallbacks')
const renderFollowButton = require('./follow-btn')

// exported api
// =

module.exports = function renderProfileCard (profile) {
  return yo`
    <div class="profile-card" href="/${profile.getRecordOrigin().slice('dat://'.length)}">
      <div class="profile-card-header">
        ${imgWithFallbacks(`${profile.getRecordOrigin()}/avatar`, ['png', 'jpg', 'jpeg', 'gif'], {cls: 'avatar'})}
      </div>

      <span onclick=${e => app.gotoProfile(profile, e)} class="name">${profile.name || 'Anonymous'}</span>

      <p class="bio">${profile.bio}</p>

      ${renderFollowButton(profile)}
    </div>
  `
}
