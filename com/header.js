/* globals app */

const yo = require('yo-yo')
const renderHomeIcon = require('../com/icons/home')
const renderSettingsIcon = require('../com/icons/settings')
const renderAvatar = require('../com/avatar')

// exported api

module.exports = function renderHeader () {
  return yo`
    <header>
      <nav>
        <a class="nav-item ${app.currentView === 'feed' ? 'active' : ''}" onclick=${e => app.gotoFeed(e)} href="/">
          <span class="icon">${renderHomeIcon()}</span>
          <span class="label">Home</span>
        </a>

        <a class="nav-item ${app.currentView === 'edit' ? 'active' : ''}" href="/edit" onclick=${app.gotoEditProfile}>
          <span class="icon settings">${renderSettingsIcon()}</span>
          <span class="label">Settings</span>
        </a>

        <span class="nav-item profile" onclick=${e => app.gotoProfile(app.currentUserProfile, e)}>
          <span class="label name">${app.currentUserProfile.name}</span>
          ${renderAvatar(app.currentUserProfile, 'small')}
        </span>

        <span class="nav-item new-post">
          <a href="/" onclick=${e => app.gotoFeed(e)} class="btn primary">New post</a>
        </span>
      </nav>
    </header>
  `
}