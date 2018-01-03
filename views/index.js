/* globals app document */

const yo = require('yo-yo')
const renderHeader = require('../com/header')
const renderFeed = require('./feed')
const renderFriends = require('./friends')
const renderFollowing = require('./following')
const renderThread = require('./thread')
const renderNewUser = require('./new-user')
const renderEditProfile = require('./edit-profile')
const renderLoading = require('./loading')
const renderError = require('./error')

exports.render = function render () {
  yo.update(document.querySelector('body'), yo`
    <body>
      ${renderHeader()}

      <main>
        ${renderView()}
      </main>

      <style>body{--theme-color: ${app.getThemeColor('base')}}</style>
      <style>body{--theme-color-faded: ${app.getThemeColor('faded')}}</style>
      <style>body{--theme-color-box-shadow: ${app.getThemeColor('boxShadow')}}</style>
      <style>body{--theme-color-border: ${app.getThemeColor('border')}}</style>
    </body>
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
    case 'edit':
      return renderEditProfile()
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
