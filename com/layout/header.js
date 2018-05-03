/* globals app */

const yo = require('yo-yo')
const renderHomeIcon = require('../icons/home')
const renderErrorIcon = require('../icons/error')
const renderSettingsIcon = require('../icons/settings')
const renderAvatar = require('../avatar')

// exported api

module.exports = function renderHeader () {
  if (!app.currentUserProfile) return ''

  return yo`
    <header>
      <nav>
        <a class="nav-item ${app.currentView === 'feed' ? 'active' : ''}" onclick=${app.gotoFeed} href="/">
          <span class="icon">${renderHomeIcon()}</span>
          <span class="label">Home</span>
        </a>

        <a class="nav-item ${app.currentView === 'notifications' ? 'active' : ''}" href="/notifications" onclick=${app.gotoNotifications}>
          <span class="icon settings">${renderErrorIcon()}</span>
          <span class="label">Notifications</span>
          ${app.unreadNotifications ? yo`<span class="count">${app.unreadNotifications}</span>` : ''}
        </a>

        <a class="nav-item ${app.currentView === 'settings' ? 'active' : ''}" href="/settings" onclick=${app.gotoSettings}>
          <span class="icon settings">${renderSettingsIcon()}</span>
          <span class="label">Settings</span>
        </a>

        <span class="nav-item profile" onclick=${e => app.gotoProfile(app.currentUserProfile, e)}>
          <span class="label name">${app.currentUserProfile.name || 'Anonymous'}</span>
          ${renderAvatar(app.currentUserProfile, 'small')}
        </span>

        <span class="nav-item new-post">
          <a href="/" onclick=${e => app.gotoFeed(e)} class="btn primary">New post</a>
        </span>
      </nav>
    </header>
  `
}
