/* globals app document */

const yo = require('yo-yo')
const renderHeader = require('../com/layout/header')
const renderFeed = require('./feed')
const renderFriends = require('./friends')
const renderFollowing = require('./following')
const renderThread = require('./thread')
const renderNewUser = require('./new-user')
const renderNotifications = require('./notifications')
const renderSettings = require('./settings')
const renderLoading = require('./loading')
const renderError = require('./error')

exports.render = function render () {
  yo.update(document.querySelector('#app-container'), yo`
    <div id="app-container">
      ${renderHeader()}

      <main>
        ${renderView()}
      </main>

      <style>body{--theme-color: ${app.getAppColor('base')}}</style>
      <style>body{--primary-btn-hover: ${app.getAppColor('primaryBtnHover')}}</style>
      <style>body{--theme-color-faded: ${app.getAppColor('faded')}}</style>
      <style>body{--theme-color-box-shadow: ${app.getAppColor('boxShadow')}}</style>
      <style>body{--theme-color-border: ${app.getAppColor('border')}}</style>
      <style>body{--theme-color-hover: ${app.getAppColor('hover')}}</style>
      <input id="profile-url" type="text" value=${app.currentUser ? app.currentUser.url : ''}>
    </div>
  `)
}

// internal methods
// =

function renderView () {
  if (app.viewError) {
    return renderError()
  }
  switch (app.currentView) {
    case 'following':
    case 'friends':
      return renderFriends()
    case 'thread':
      if (!app.viewedPost) {
        return renderLoading()
      }
      return renderThread()
    case 'notifications':
      if (!app.notifications) {
        return renderLoading()
      }
      return renderNotifications()
    case 'settings':
      return renderSettings()
    case 'user':
      if (app.currentSubview === 'following') {
        return renderFollowing()
      }
      if (!app.viewedProfile) {
        return renderLoading()
      }
    case 'feed':
    default:
      if (!app.currentUser) {
        return renderNewUser()
      }
      if (!app.posts) {
        return renderLoading()
      }
      return renderFeed()
  }
}
