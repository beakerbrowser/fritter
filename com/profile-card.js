/* globals app */

const yo = require('yo-yo')
const imgWithFallbacks = require('./img-with-fallbacks')
const renderFollowButton = require('./follow-btn')

// exported api
// =

module.exports = function renderProfileCard (profile) {
  if (!profile) return ''
  return yo`
    <div class="profile-card">
      <div class="profile-card-header">
        ${imgWithFallbacks(`${profile.getRecordOrigin()}/avatar`, ['png', 'jpg', 'jpeg', 'gif'], {cls: 'avatar'})}
      </div>

      <a href=${app.profileUrl(profile)} onclick=${e => app.gotoProfile(profile, e)} class="name">${profile.name || 'Anonymous'}</a>

      <p class="bio">${profile.bio}</p>

      ${!app.currentUser
        ? ''
        : app.currentUser.url === profile.getRecordOrigin()
          ? yo`<a href="/edit" onclick=${app.gotoEditProfile} class="btn">Edit profile</a>`
          : renderFollowButton(profile)}
    </div>
  `
}
