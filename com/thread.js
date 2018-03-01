/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderName = require('./name')
const renderFollowButton = require('./follow-btn')
const renderPostActions = require('./post-actions')
const renderPostVotesPreview = require('./post-votes-preview')
const renderReply = require('./post-reply')
const {linkifyText, timestamp} = require('../lib/util')

const renderReplyForm = require('./new-post-form')
const {buildNewPost} = require('../lib/util')

// exported api
// =

module.exports = function renderThread () {
  const viewedPost = app.viewedPost
  if (!viewedPost) return ''

  const editingCls = app.isEditingReply ? 'editing' : ''
  return yo`
    <div class="thread">
      ${viewedPost.parent ? yo`
        <div class="parents">
          ${recursiveParentRender(viewedPost)}
        </div>`
      : ''}

      <div class="main-post">
        <div class="post-header">
          ${renderAvatar(viewedPost.author)}

            <div>
              ${renderName(viewedPost.author)}

              <div class="timestamp">
                <a href=${app.threadUrl(viewedPost)} class="value">${timestamp(viewedPost.createdAt)}</a>
              </div>
            </div>

          ${renderFollowButton(viewedPost.author)}
        </div>

        ${viewedPost.threadParent
          ? yo`
            <div class="reply-info" onclick=${e => app.gotoThread(viewedPost.threadParent, e)}>
              Replying to
              <a href=${app.threadUrl(viewedPost.threadParent)} class="url">
                ${viewedPost.threadParentPost && viewedPost.threadParentPost.author
                  ? renderName(viewedPost.threadParentPost.author)
                  : 'this post'
                }
              </a>
            </div>`
          : ''
        }

        <div class="text">${linkifyText(viewedPost, {cls: 'url', inlineImages: true})}</div>

        ${renderPostVotesPreview(viewedPost)}

        ${renderPostActions(viewedPost)}
      </div>

      ${renderReplyForm(onSubmitReply)}

      ${renderReplies(viewedPost)}
    </div>
  `

  async function onSubmitReply (e) {
    e.preventDefault()
    await app.libfritter.feed.post(app.currentUser,
      buildNewPost({
        text: app.postDraftText,
        threadRoot: app.viewedPost.threadRoot || app.viewedPost.getRecordURL(),
        threadParent: app.viewedPost.getRecordURL()
      })
    )
    app.postDraftText = ''
    app.isEditingPost = false

    // reload the post
    app.viewedPost = await app.libfritter.feed.getThread(app.viewedPost.getRecordURL())
    app.render()
  }

}

// internal methods
// =

function recursiveParentRender (p) {
  var parents = []
  while (p.parent) {
    parents.unshift(renderReply(p.parent))
    p = p.parent
  }
  return parents
}

function renderReplies (p) {
  if (!(p.replies && p.replies.length)) return ''
  var replies = []
  function iterReplies (rs) {
    rs.forEach(r => {
      replies.push(renderReply(r))
      if (r.replies) {
        iterReplies(r.replies)
      }
    })
  }
  iterReplies(p.replies)
  return yo`
    <div class="replies-container">
      <div class="replies">${replies}</div>
    </div>
  `
}
