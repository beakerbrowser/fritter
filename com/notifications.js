/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderName = require('./name')
const renderPostActions = require('./post-actions')
const renderHeartIcon = require('./icons/heart')
const {timestamp, linkifyText} = require('../lib/util')

// exported api
// =

module.exports = function renderFeed () {
  return yo`
    <div class="feed">
      ${!app.notifications.length ? yo`<div class="empty">No notifications yet!</div>` : ''}
      ${app.notifications.map(renderNotification)}
      <button class="show-posts-btn load-more" onclick=${() => app.loadMoreNotifications()}>
        Load more
      </button>
    </div>
  `
}

// internal methods
// =

function renderNotification (n) {
  const unreadCls = (app.notificationsLastReadTS < n.createdAt) ? 'unread' : ''
  if (n.type === 'vote') {
    return yo`
      <div class="feed-item like ${unreadCls}" onclick=${e => app.gotoThread(n.post, e)}>
        ${renderHeartIcon()}
        <div class="like-content">
          <div class="like-header">
            <div>
              ${renderAvatar(n.author, 'small')}
              ${renderName(n.author)} liked your post
              <span class="timestamp">
                <span class="bullet">•</span>
                <a href=${app.threadUrl(n.post)} class="value">${timestamp(n.createdAt)}</a>
              </span>
            </div>
          </div>

          <div class="post-quote">
            <div class="post-header">
              <div>
                ${renderName(n.post.author)}
                <span class="timestamp">
                  <span class="bullet">•</span>
                  <a href=${app.threadUrl(n.post)} class="value">${timestamp(n.post.createdAt)}</a>
                </span>
              </div>
            </div>
            <p class="text">${linkifyText(n.post.text, {cls: 'url', inlineImages: true})}</p>
          </div>
        </div>
      </div>
    `
  }
  if (n.type === 'reply') {
    let p = n.post
    return yo`
      <div class="feed-item post ${unreadCls}" onclick=${e => app.gotoThread(p, e)}>
        ${renderAvatar(p.author)}
        <div class="post-content">
          <div class="post-header">
            <div>
              ${renderName(p.author)}
              <span class="timestamp">
                <span class="bullet">•</span>
                <a href=${app.threadUrl(p)} class="value">${timestamp(p.createdAt)}</a>
              </span>
            </div>

            ${p.threadParent ? yo`
              <div class="reply-info" onclick=${e => app.gotoThread(p.threadParent, e)}>
                Replying to
                <span class="url" >your post</span>
              </div>`
            : ''}
          </div>

          <p class="text">${linkifyText(p.text, {cls: 'url', inlineImages: true})}</p>
        </div>

        ${renderPostActions(p)}
      </div>
    `
  }
  if (n.type === 'mention') {
    console.log(n)
    let p = n.post
    return yo`
      <div class="feed-item post ${unreadCls}" onclick=${e => app.gotoThread(p, e)}>
        ${renderAvatar(p.author)}
        <div class="post-content">
          <div class="post-header">
            <div>
              ${renderName(p.author)}
              <span class="timestamp">
                <span class="bullet">•</span>
                <a href=${app.threadUrl(p)} class="value">${timestamp(p.createdAt)}</a>
              </span>
            </div>

            ${p.threadParent ? yo`
              <div class="reply-info" onclick=${e => app.gotoThread(p.threadParent, e)}>
                Replying to
                <span class="url" >your post</span>
              </div>`
            : ''}
          </div>

          <p class="text">${linkifyText(p.text, {cls: 'url', inlineImages: true})}</p>
        </div>

        ${renderPostActions(p)}
      </div>
    `
  }
  return ''
}
