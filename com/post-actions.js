/* globals app */

const yo = require('yo-yo')
const renderRepliesIcon = require('./icons/replies')
const renderHeartIcon = require('./icons/heart')

// exported api
// =

module.exports = function renderPostActions (p) {
  return yo`
    <div class="post-actions">
      <div class="action">
        <span onclick=${e => app.gotoThread(p)} class="replies-icon">
          ${renderRepliesIcon()}
        </span>

        ${p.replies ? yo`
          <span class="count">
            ${p.replies.length}
          </span>`
        : ''}
      </div>

      <div class="action ${p.votes.currentUsersVote ? 'voted' : ''}">
        <span onclick=${e => onToggleLiked(e, p)} class="vote-icon ${p.votes.currentUsersVote ? 'voted' : ''}">
          ${renderHeartIcon()}
        </span>

        <span class="count">
          ${p.votes.value || ''}
        </span>
      </div>
    </div>
  `

  async function onToggleLiked (e) {
    e.stopPropagation()
    app.toggleLiked(p)
  }
}
