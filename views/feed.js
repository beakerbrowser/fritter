/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile-card')
const renderFooter = require('../com/footer')
const renderProfileHeader = require('../com/profile-header')
const renderNewPostForm = require('../com/new-post-form')
const renderBackToFeed = require('../com/back-to-feed')
const renderFeed = require('../com/feed')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view feed">
      <div class="sidebar-col">
        ${app.viewedProfile ? renderBackToFeed() : ''}
        ${renderProfileCard(app.viewedProfile || app.currentUserProfile)}
        ${renderFooter()}
        ${''/* TODO renderFriendsList(app.viewedProfile || app.currentUserProfile) */}
      </div>

      <div class="main-col">
        ${app.viewedProfile ? renderProfileHeader(app.viewedProfile) : ''}

        <div class="view-content">
          ${!app.viewedProfile ? renderNewPostForm() : ''}
        </div>

        ${renderFeed()}
      </div>
    </div>
  `
}

