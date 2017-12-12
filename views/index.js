/* globals app document */

const yo = require('yo-yo')
const renderFeed = require('./feed')
const renderFriends = require('./friends')
const renderFollowing = require('./following')
const renderThread = require('./thread')

exports.render = function render () {
  yo.update(document.querySelector('body'), yo`
    <body>
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
  switch (app.currentView) {
    case 'following':
    case 'friends':
      return renderFriends()
    case 'thread':
      return renderThread()
    case 'user':
      if (app.currentSubview === 'following') {
        return renderFollowing()
      }
    case 'feed':
    default:
      return renderFeed()
  }
}
