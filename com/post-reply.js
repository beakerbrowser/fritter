/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderPostActions = require('./post-actions')
const {timestamp} = require('../lib/util')

// exported api
// =

module.exports = function renderReply (r) {
  return yo`
    <div class="reply feed-item post" onclick=${e => app.gotoThread(r, e)}>
      ${renderAvatar(r.author)}
      <div class="post-content">
        <div class="post-header">
          <span onclick=${e => app.gotoProfile(r.author, e)} class="name">${r.author.name}</span>
          <span class="timestamp">
            <span class="bullet">•</span>
            <span class="value">${timestamp(r.createdAt)}</span>
          </span>
        </div>

        <p class="text">${r.text}</p>
      </div>

      ${renderPostActions(r)}
    </div>
  `
}
