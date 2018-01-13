/* globals app */

const yo = require('yo-yo')
const renderProfileCard = require('../com/profile-card')
const renderFooter = require('../com/footer')
const renderProfileEditor = require('../com/profile-editor')
const renderProfilePicker = require('../com/profile-picker')
const renderThemeColorPicker = require('../com/theme-color-picker')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view feed">
      <div class="sidebar-col">
        ${renderProfileCard(app.currentUserProfile)}
        ${renderFooter()}
      </div>

      <div class="main-col">
        <div class="settings-view">
          ${renderProfileEditor()}
        </div>

        <div class="settings-view">
          ${renderProfilePicker()}
        </div>

        <div class="settings-view">
          ${renderThemeColorPicker()}
        </div>
      </div>
    </div>
  `
}

