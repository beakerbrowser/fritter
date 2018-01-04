/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile-card')
const renderFooter = require('../com/footer')
const renderThread = require('../com/thread')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view feed">
      <div class="sidebar-col">
        ${renderProfileCard(app.viewedProfile || app.currentUserProfile)}
        ${renderFooter()}
      </div>

      <div class="main-col">
        ${renderThread()}
      </div>
    </div>
  `
}

