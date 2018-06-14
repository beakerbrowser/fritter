/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile/profile-card')
const renderFooter = require('../com/layout/footer')
const renderIndexingStatuses = require('../com/indexing-statuses').render
const renderPublicPeerTip = require('../com/public-peer-tip')
const renderWhoToFollow = require('../com/who-to-follow')
const renderProfileHeader = require('../com/profile/profile-header')
const renderNewPostForm = require('../com/feed/new-post-form')
const renderFeed = require('../com/feed/feed')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view feed">
      <div class="sidebar-col">
        ${renderProfileCard()}
        ${renderPublicPeerTip()}
        ${renderIndexingStatuses()}
        ${renderWhoToFollow()}
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
