/* globals app */

const yo = require('yo-yo')

// exported api
// =

module.exports = function renderProfileHeader (profile) {
  return yo`
    <div class="profile-header">
      <div onclick=${e => app.onUpdateViewFilter('feed')} class="nav-link ${currentView === 'feed' ? 'active' : ''}">
        <div class="label">Posts</div>
        <div class="value">${posts.length}</div>
      </div>

      <div onclick=${e => app.onUpdateViewFilter('following')} class="nav-link ${currentView === 'following' ? 'active' : ''}">
        <div class="label">Following</div>
        <div class="value">${profile.follows.length}</div>
      </div>
    </div>
  `
}
