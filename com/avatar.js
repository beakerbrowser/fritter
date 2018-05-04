/* globals app */

const yo = require('yo-yo')
const imgWithFallbacks = require('./img-with-fallbacks')

module.exports = function renderAvatar (profile, cls = '') {
  if (!profile) return ''
  if (!profile.url && !profile.getRecordOrigin) profile = {url: profile}

  let imgEl
  const origin = profile.getRecordOrigin ? profile.getRecordOrigin() : profile.url
  if (profile.avatar) {
    // if it's defined, use the path declared in profile.avatar
    imgEl = yo`<img src="${origin}/${profile.avatar}" class="avatar ${cls}"/>`
  } else {
    // otherwise guess the avatar's path
    imgEl = imgWithFallbacks([`${origin}/avatar.png`, `${origin}/avatar.jpg`, `${origin}/avatar.jpeg`, `${origin}/avatar.gif`, '/assets/default-avatar.png'], {cls: `avatar ${cls}`})
  }

  return yo`
    <a href=${app.profileUrl(profile)} onclick=${e => app.gotoProfile(profile, e)} class="avatar-container ${cls}">
      ${imgEl}
    </a>
  `
}
