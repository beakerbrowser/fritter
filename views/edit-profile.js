/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile-card')
const renderFooter = require('../com/footer')
const renderProfileEditor = require('../com/profile-editor')
const renderBackToFeed = require('../com/back-to-feed')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view feed">
      <div class="sidebar-col">
        ${renderBackToFeed()}
        ${renderProfileCard(app.currentUserProfile)}
        ${renderFooter()}
      </div>

      <div class="main-col">
        <div class="edit-profile-view">
          ${renderProfileEditor()}
        </div>
      </div>
    </div>
  `
}

