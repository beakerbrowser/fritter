/* globals app */

const yo = require('yo-yo')
const renderFollowButton = require('./follow-btn')

// exported api
// =

module.exports = function renderProfile () {
  if (!app.viewedProfile) {
    return yo`
      <div class="profile-view">
        <p>Profile not found</p>
      </div>
    `
  }

  var isUserProfile = app.viewedProfile && app.viewedProfile.getRecordOrigin() === app.currentUserProfile.getRecordOrigin()
  return yo`
    <div class="profile-view">
      <div class="header">
        ${app.viewedProfile.avatar
          ? yo`
            <div class="avatar-container">
              <img class="avatar" src="${app.viewedProfile.getRecordOrigin()}${app.viewedProfile.avatar}?cache_buster=${Date.now()}"/>
            </div>`
          : yo`
            <div class="avatar-container">
              <span class="avatar empty"></span>
            </div>`
        }

        <span class="name">${app.viewedProfile.name}</span>
      </div>

      <p class="bio">${app.viewedProfile.bio}</p>

      ${isUserProfile ? '' : renderFollowButton(app.viewedProfile)}
    </div>
  `
}
