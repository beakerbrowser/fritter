/* globals app */

const yo = require('yo-yo')
const renderRepliesIcon = require('../icons/replies')
const renderHeartIcon = require('../icons/heart')

// exported api
// =

module.exports = function renderPostActions (p) {
  const currentUserUpvoted = app.currentUser && p.votes.upVoters.includes(app.currentUser.url)
  return yo`
    <div class="post-actions">
      <div class="action reply">
        <span onclick=${e => app.gotoThread(p, e)} class="replies-icon">
          ${renderRepliesIcon()}
        </span>

        ${p.replies ? yo`
          <span class="count">
            ${typeof p.replies === 'number' ? p.replies : p.replies.length}
          </span>`
        : ''}
      </div>

      <div class="action vote ${currentUserUpvoted ? 'voted' : ''}">
        <span onclick=${e => onToggleLiked(e, p)} class="vote-icon ${currentUserUpvoted ? 'voted' : ''}">
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
