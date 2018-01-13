/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderName = require('./name')
const renderFollowButton = require('./follow-btn')
const {linkifyText} = require('../lib/util')

// exported api
// =

module.exports = function renderProfileCard (profile) {
  if (!profile) return ''
  return yo`
    <div class="profile-card module">
      <div class="profile-card-header">
        ${renderAvatar(profile)}

        <div class="name">
          ${renderName(profile)}
        </div>

        ${app.currentUser.url === profile.getRecordOrigin()
          ? yo`<a href="/settings" onclick=${app.gotoSettings} class="btn edit-profile-btn">Edit profile</a>`
          : renderFollowButton(profile)
        }
      </div>

      ${profile.bio ? yo`<p class="bio">${linkifyText(profile.bio, {cls: 'url'})}</p>` : ''}
    </div>
  `
}
