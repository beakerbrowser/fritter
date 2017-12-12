/* globals app */

const yo = require('yo-yo')
const imgWithFallbacks = require('./img-with-fallbacks')

module.exports = function renderAvatar (profile) {
  return yo`
    <div onclick=${e => app.gotoProfile(profile, e)} class="avatar-container">
      ${imgWithFallbacks(`${profile.getRecordOrigin ? profile.getRecordOrigin() : profile.url}/avatar`, ['png', 'jpg', 'jpeg', 'gif'], {cls: 'avatar'})}
    </div>
  `
}
