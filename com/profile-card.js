/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderFollowButton = require('./follow-btn')
const renderLinkIcon = require('./icons/link')

// exported api
// =

module.exports = function renderProfileCard (profile) {
  if (!profile) return ''
  return yo`
    <div class="profile-card module">
      <div class="profile-card-header">
        ${renderAvatar(profile)}

        <div class="name">
          <a href=${app.profileUrl(profile)} onclick=${e => app.gotoProfile(profile, e)} class="name">${profile.name || 'Anonymous'}</a>
        </div>

        ${app.currentUser.url === profile.getRecordOrigin()
          ? yo`<a href="/edit" onclick=${app.gotoEditProfile} class="btn edit-profile-btn">Edit profile</a>`
          : renderFollowButton(profile)
        }
      </div>

      ${profile.bio ? yo`<p class="bio">${profile.bio}</p>` : ''}
    </div>
  `
}
