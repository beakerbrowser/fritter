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
    <div class="profile-card">
      <div class="profile-card-header">
        ${renderAvatar(profile)}
        <div class="profile-card-header-attrs">
          <p class="name"><a href=${app.profileUrl(profile)} onclick=${e => app.gotoProfile(profile, e)} class="name">${profile.name || 'Anonymous'}</a></p>
        </div>
      </div>

      <p class="bio">${profile.bio}</p>

      ${!app.currentUser
        ? ''
        : app.currentUser.url === profile.getRecordOrigin()
          ? yo`<a href="/edit" onclick=${app.gotoEditProfile} class="btn">Edit profile</a>`
          : renderFollowButton(profile)}
      <a href=${app.profileUrl(profile)} onclick=${e => app.gotoProfile(profile, e)} title="Profile link" class="profile-link">${renderLinkIcon()} Profile link</a>
    </div>
  `
}
