/* globals */

const yo = require('yo-yo')
const renderProfileEditor = require('../com/profile/profile-editor')
const renderProfilePicker = require('../com/profile/profile-picker')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view new-user">
      <div>
        <h1>Welcome to Fritter!</h1>

        <p>
          Fritter is an example Twitter clone. It demonstrates how to build
          peer-to-peer Web applications with the
          <a href="https://beakerbrowser.com">Beaker Browser</a>,
          <a href="https://datproject.org">Dat</a>, and
          <a href="https://github.com/beakerbrowser/webdb">WebDB</a>.
        </p>
      </div>

      <div>
        ${renderProfilePicker()}
      </div>

      <div>
        ${renderProfileEditor()}
      </div>
    </div>
  `
}
