/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('../avatar')
const renderName = require('../name')
const renderPostActions = require('./post-actions')
const {timestamp} = require('../../lib/util')
const {linkifyText} = require('../../lib/util')

// exported api
// =

module.exports = function renderReply (r) {
  let cls = ''
  if (r.threadParent !== r.threadRoot) {
    cls = 'grandchild'
  }

  return yo`
    <div class="reply feed-item post ${cls}" onclick=${e => app.gotoThread(r, e)}>
      ${renderAvatar(r.author)}
      <div class="post-content">
        <div class="post-header">
          ${renderName(r.author)}
          <span class="timestamp">
            <span class="bullet">•</span>
            <a href=${app.threadUrl(r)} class="value">${timestamp(r.createdAt)}</a>
          </span>
        </div>

        <p class="text">${linkifyText(r.text, {cls: 'url', inlineImages: true})}</p>
      </div>

      ${renderPostActions(r)}
    </div>
  `
}
