/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile-card')
const renderFooter = require('../com/footer')
const renderProfileHeader = require('../com/profile-header')
const renderProfileListingItem = require('../com/profile-listing-item')

// exported api
// =

module.exports = function renderFollowing () {
  const isEmpty = app.viewedProfile.follows.length === 0
  return yo`
    <div class="view following">
      <div class="sidebar-col">
        ${renderProfileCard(app.viewedProfile)}
        ${renderFooter()}
      </div>

      <div class="main-col">
        ${renderProfileHeader(app.viewedProfile)}
        <div class="view-content ${isEmpty ? 'empty' : ''}">
          ${isEmpty
            ? `${app.viewedProfile.name} is not following anyone`
            : yo`<div class="following-list">${app.viewedProfile.follows.map(renderProfileListingItem)}</div>`
          }
        </div>
      </div>
    </div>
  `
}
