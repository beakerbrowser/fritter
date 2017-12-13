/* globals app */

const yo = require('yo-yo')
const imgWithFallbacks = require('./img-with-fallbacks')

module.exports = function renderAvatar (profile) {
  if (!profile) return ''
  return yo`
    <a href=${app.profileUrl(profile)} onclick=${e => app.gotoProfile(profile, e)} class="avatar-container">
      ${imgWithFallbacks(`${profile.getRecordOrigin ? profile.getRecordOrigin() : profile.url}/avatar`, ['png', 'jpg', 'jpeg', 'gif'], {cls: 'avatar'})}
    </a>
  `
}
