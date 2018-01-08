/* globals app */

const yo = require('yo-yo')

module.exports = function renderName (profile) {
  if (!profile) return ''
  return yo`
    <a href=${app.profileUrl(profile)} onclick=${e => app.gotoProfile(profile, e)} class="name">
      ${profile.name || 'Anonymous'}
    </a>
  `
}
