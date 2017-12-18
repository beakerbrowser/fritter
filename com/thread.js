/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderFollowButton = require('./follow-btn')
const renderPostActions = require('./post-actions')
const renderReply = require('./post-reply')
const {timestamp} = require('../lib/util')

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
          ${renderAvatar(viewedPost)}

          <div>
            <a class="name" href=${app.profileUrl(viewedPost.author)} onclick=${e => app.gotoProfile(viewedPost.author, e)}>${viewedPost.author.name}</a>
            <div class="timestamp">${timestamp(viewedPost.createdAt)}</div>
          </div>

          ${renderFollowButton(viewedPost.author)}
        </div>

        <div class="text">${viewedPost.text}</div>

        ${renderPostActions(viewedPost)}
      </div>

      <form class="reply-form ${editingCls}" onsubmit=${onSubmitReply}>
        ${renderAvatar(app.currentUserProfile)}
        <textarea
          placeholder="Write a reply"
          style="border-color: ${app.getThemeColor('border')}"
          onfocus=${onToggleIsReplying}
          onblur=${onToggleIsReplying}
          onkeyup=${onChangeReplyDraft}>${app.replyDraftText}</textarea>
        <div class="actions ${editingCls}">
          ${app.isEditingReply ? yo`<button disabled=${!app.replyDraftText} class="btn new-reply" type="submit">Reply</button>` : ''}
        </div>
      </form>

      ${renderReplies(viewedPost)}
    </div>
  `

  async function onSubmitReply (e) {
    e.preventDefault()
    await app.libfritter.feed.post(app.currentUser, {
      text: app.replyDraftText,
      threadRoot: app.viewedPost.threadRoot || app.viewedPost.getRecordURL(),
      threadParent: app.viewedPost.getRecordURL()
    })
    app.replyDraftText = ''
    app.isEditingReply = false

    // reload the post
    app.viewedPost = await app.libfritter.feed.getThread(app.viewedPost.getRecordURL())
    app.render()
  }

  function onToggleIsReplying () {
    if (!app.replyDraftText) {
      app.isEditingReply = !app.isEditingReply
      app.render()
    }
  }

  function onChangeReplyDraft (e) {
    const oldLen = app.replyDraftText.length
    app.replyDraftText = e.target.value
    if (oldLen === 0 || app.replyDraftText.length === 0) {
      app.render()
    }
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
