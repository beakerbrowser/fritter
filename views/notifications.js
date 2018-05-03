/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile/profile-card')
const renderFooter = require('../com/layout/footer')
const renderWhoToFollow = require('../com/who-to-follow')
const renderNotifications = require('../com/notifications')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view notifications">
      <div class="sidebar-col">
        ${renderProfileCard()}
        ${renderWhoToFollow()}
        ${renderFooter()}
      </div>

      <div class="main-col">
        ${renderNotifications()}
      </div>
    </div>
  `
}
