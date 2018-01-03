/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile-card')
const renderFooter = require('../com/footer')
const renderBackToFeed = require('../com/back-to-feed')
const renderErrorIcon = require('../com/icons/error')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view feed">
      <div class="sidebar-col">
        ${renderBackToFeed()}
        ${renderProfileCard(app.viewedProfile || app.currentUserProfile)}
        ${renderFooter()}
      </div>

      <div class="main-col">
        <div class="error-view">
          ${typeof app.viewError === 'string' ? yo`<div>${renderErrorIcon()} ${app.viewError}</div>` : app.viewError}
        </div>
      </div>
    </div>
  `
}

