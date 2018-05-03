/* globals app */

const yo = require('yo-yo')

// exported api
// =

module.exports = function renderProfileHeader (profile) {
  return yo`
    <div class="profile-header">
      <div onclick=${e => app.setSubview('feed')} class="nav-link ${app.currentSubview !== 'following' ? 'active' : ''}">
        <div class="label">Posts</div>
        <div class="value">${app.viewedProfilePostsCount}</div>
      </div>

      <div onclick=${e => app.setSubview('following')} class="nav-link ${app.currentSubview === 'following' ? 'active' : ''}">
        <div class="label">Following</div>
        <div class="value">${app.viewedProfile.follows.length}</div>
      </div>
    </div>
  `
}
