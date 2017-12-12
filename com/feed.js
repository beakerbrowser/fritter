/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderPostActions = require('./post-actions')
const {timestamp} = require('../lib/util')

// exported api
// =

module.exports = function renderFeed () {
  return yo`
    <div class="feed">
      ${!app.posts.length ? yo`<div class="loading-container"><div class="spinner"></div></div>` : ''}
      <div class="new-posts-indicator"></div>
      ${app.posts.map(renderPostFeedItem)}
    </div>
  `
}

// internal methods
// =

function renderPostFeedItem (p) {
  return yo`
    <div class="feed-item post" onclick=${() => app.gotoThread(p)}>
      ${renderAvatar(p.author)}
      <div class="post-content">
        <div class="post-header">
          <div>
            <span onclick=${e => app.gotoProfile(p.author)} class="name">${p.author.name}</span>
            <span class="timestamp">
              <span class="bullet">•</span>
              <span class="value">${timestamp(p.createdAt)}</span>
            </span>
          </div>

          ${p.threadParent ? yo`
            <div class="reply-info" onclick=${() => app.gotoThread(p.threadParent)}>
              Replying to
              <span class="url" >${p.threadParent.author.name}</span>
            </div>`
          : ''}
        </div>

        <p class="text">${p.text}</p>
      </div>

      ${renderPostActions(p)}
    </div>
  `
}
