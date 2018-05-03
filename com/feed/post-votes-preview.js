const yo = require('yo-yo')
const renderAvatar = require('../avatar')

// exported api
// =

module.exports = function renderPostVotesPreview (p) {
  if (!p.votes.upVoters.length) return ''
  return yo`
    <div class="post-votes-preview">
      <span class="votes-label">
        Likes
      </span>

      <span class="upvoters">
        ${p.votes.upVoters.slice(0, 8).map(upvoter => renderAvatar(upvoter, 'tiny'))}
      </span>
    </div>
  `
}
