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
      ${app.posts.map(renderFeedItem)}
    </div>
  `
}

// internal methods
// =

function renderFeedItem (p) {
  return yo`
    <div class="feed-item post" onclick=${e => app.gotoThread(p, e)}>
      ${renderAvatar(p.author)}
      <div class="post-content">
        <div class="post-header">
          <div>
            <a href=${app.profileUrl(p.author)} onclick=${e => app.gotoProfile(p.author, e)} class="name">${p.author.name}</a>
            <span class="timestamp">
              <span class="bullet">•</span>
              <a href=${app.threadUrl(p)} class="value">${timestamp(p.createdAt)}</a>
            </span>
          </div>

          ${p.threadParent ? yo`
            <div class="reply-info" onclick=${e => app.gotoThread(p.threadParent, e)}>
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
