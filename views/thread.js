/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile-card')
const renderWhoToFollow = require('../com/who-to-follow')
const renderBackToFeed = require('../com/back-to-feed')
const renderThread = require('../com/thread')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view feed">
      <div class="sidebar-col">
        ${renderBackToFeed()}
        ${renderProfileCard(app.viewedProfile || app.currentUserProfile)}
        ${renderWhoToFollow()}
      </div>

      <div class="main-col">
        ${renderThread()}
      </div>
    </div>
  `
}

