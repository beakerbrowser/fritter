/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('../avatar')
const renderName = require('../name')
const renderPostActions = require('../feed/post-actions')
const {timestamp} = require('../../lib/util')
const {linkifyText} = require('../../lib/posts')

// exported api
// =

module.exports = function renderFeed () {
  return yo`
    <div class="feed">
      ${!app.posts.length ? yo`<div class="empty">No posts yet! Maybe you should change that?</div>` : ''}
      ${app.hasNewPost ?
        yo`<div class="show-posts-btn new-posts" onclick=${() => app.reloadFeed()}>New posts</div>`
        : ''}
      ${app.posts.map(renderFeedItem)}
      ${app.viewedProfile && app.posts.length >= app.viewedProfilePostsCount
        ? ''
        : yo`
          <button class="show-posts-btn load-more" onclick=${() => app.loadMorePosts(app.viewedProfile)}>
            ${app.isLoadingPosts ? 'Loading...' : 'Load more posts'}
          </button>`
      }
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
            ${renderName(p.author)}
            <span class="timestamp">
              <span class="bullet">•</span>
              <a href=${app.threadUrl(p)} class="value">${timestamp(p.createdAt)}</a>
            </span>
          </div>

          ${p.threadParent
            ? yo`
              <div class="reply-info" onclick=${e => app.gotoThread(p.threadParent, e)}>
                Replying to
                <a href=${app.threadUrl(p.threadParent)} class="url">
                  ${p.threadParentPost && p.threadParentPost.author
                    ? renderName(p.threadParentPost.author)
                    : 'this post'
                  }
                </a>
              </div>`
            : ''
          }
        </div>

        <p class="text">
          ${linkifyText(p, {cls: 'url', inlineImages: true})}
        </p>
      </div>

      ${renderPostActions(p)}
    </div>
  `
}
