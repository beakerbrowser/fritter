/* globals app */

const yo = require('yo-yo')
const imgWithFallbacks = require('./img-with-fallbacks')

module.exports = function renderAvatar (profile, cls = '') {
  if (!profile) return ''
  if (!profile.url && !profile.getRecordOrigin) profile = {url: profile}

  let imgEl
  if (profile.avatar) {
    // if it's defined, use the path declared in profile.avatar
    const avatarUrl = `${profile.getRecordOrigin ? profile.getRecordOrigin() : profile.url}/${profile.avatar}?cache=${Date.now()}`
    imgEl = yo`<img src=${avatarUrl} class="avatar ${cls}"/>`
  } else {
    // otherwise guess the avatar's path
    imgEl = imgWithFallbacks(`${profile.getRecordOrigin ? profile.getRecordOrigin() : profile.url}/avatar`, ['png', 'jpg', 'jpeg', 'gif'], {cls: `avatar ${cls}`})
  }

  return yo`
    <a href=${app.profileUrl(profile)} onclick=${e => app.gotoProfile(profile, e)} class="avatar-container ${cls}">
      ${imgEl}
    </a>
  `
}
