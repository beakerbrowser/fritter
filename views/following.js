/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile-card')
const renderProfileHeader = require('../com/profile-header')
const renderBackToFeed = require('../com/back-to-feed')
const renderProfileListingItem = require('../com/profile-listing-item')

// exported api
// =

module.exports = function renderFollowing () {
  return yo`
    <div class="view following">
      <div class="sidebar-col">
        ${renderBackToFeed()}
        ${renderProfileCard(app.viewedProfile)}
      </div>

      <div class="main-col">
        ${renderProfileHeader(app.viewedProfile)}
        <div class="view-content">
          ${app.viewedProfile.follows.length === 0
            ? `${app.viewedProfile.name} is not following anyone`
            : yo`<div class="following-list">${app.viewedProfile.follows.map(renderProfileListingItem)}</div>`
          }
        </div>
      </div>
    </div>
  `
}
