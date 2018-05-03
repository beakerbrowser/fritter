/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile/profile-card')
const renderFooter = require('../com/layout/footer')
const renderThread = require('../com/feed/thread')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view feed">
      <div class="sidebar-col">
        ${renderProfileCard()}
        ${renderFooter()}
      </div>

      <div class="main-col">
        ${renderThread()}
      </div>
    </div>
  `
}
