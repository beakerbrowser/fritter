/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const renderName = require('./name')
const renderFollowButton = require('./follow-btn')
const renderPostActions = require('./post-actions')
const renderPostVotesPreview = require('./post-votes-preview')
const renderReply = require('./post-reply')
const {linkifyText, timestamp} = require('../lib/util')

const mentionCheck = require('./mention-check')
const renderMentions = require('./mention-window')
const {buildNewPost, addMention} = require('../lib/util')

const ARROW_UP = 38
const ARROW_DOWN = 40
const ENTER_KEY = 13
const ESC_KEY = 27

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

      ${renderReplyForm()}

      ${renderReplies(viewedPost)}
    </div>
  `

  function renderReplyForm () {
    return yo`
      <form class="reply-form ${editingCls}" onsubmit=${onSubmitReply}>
        <div class="inputs">
          ${renderAvatar(app.currentUserProfile)}
          <textarea
            placeholder="Write a reply"
            style="border-color: ${app.getAppColor('border')}"
            onfocus=${onToggleIsReplying}
            onblur=${onToggleIsReplying}
            onkeyup=${onChangeReplyDraft}
            onkeydown=${onReplyKeyDown}>${app.replyDraftText}</textarea>

          ${app.possibleMentions && app.possibleMentions.length && app.isEditingReply
            ? renderMentions()
            : ''
          }
        </div>

        <div class="actions ${editingCls}">
          ${app.isEditingReply ? yo`<button disabled=${!app.replyDraftText} class="btn new-reply" type="submit">Reply</button>` : ''}
        </div>
      </form>
    `
  }

  // Separate function to handle arrow keys, enter key, etc. and prevent default
  function onReplyKeyDown (e) {
    // if we have mentions available...
    if (app.possibleMentions && app.possibleMentions.length){

      let dirty = false

      // if we're past the length of the current mention list, move to the last mention
      // (ie if the length of the list just changed)
      if (app.selectedMention >= app.possibleMentions.length) {
        app.selectedMention = Math.max(app.possibleMentions.length - 1, 0)
        dirty = true
      }

      // if we hit an up or down arrow and mentions are open, change the selected mention
      if (app.possibleMentions.length && (e.keyCode == ARROW_UP || e.keyCode == ARROW_DOWN)) {
        e.preventDefault()

        app.selectedMention += (e.keyCode == ARROW_UP ? -1 : 1)

        // jump to the end of the list
        if (app.selectedMention < 0){
          app.selectedMention = app.possibleMentions.length - 1
        } else if (app.selectedMention >= app.possibleMentions.length) {
          // loop to the start of the list
          app.selectedMention = 0
        }

        dirty = true
      }

      // if we hit "enter" and the mentions are open, click the selected mention
      if (e.keyCode == ENTER_KEY) {
        e.preventDefault()
        addMention(app.possibleMentions[app.selectedMention], 'replyDraftText')
        dirty = true
      }

      // only rerender if we need to
      if (dirty) {
        rerender()
      }
    }
  }

  function rerender () {
    yo.update(document.querySelector('.reply-form'), renderReplyForm())
  }

  async function onSubmitReply (e) {
    e.preventDefault()
    await app.libfritter.feed.post(app.currentUser,
      buildNewPost({
        text: app.replyDraftText,
        threadRoot: app.viewedPost.threadRoot || app.viewedPost.getRecordURL(),
        threadParent: app.viewedPost.getRecordURL()
      })
    )
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
    possibleMentions = mentionCheck(app.replyDraftText)

    const checkResults = mentionCheck(app.replyDraftText)

    app.possibleMentions = checkResults.mentions
    if (checkResults.coordinates) {
      app.mentionCoordinates = `${ checkResults.coordinates.x }px, ${ checkResults.coordinates.y }px`
    }


    //if (oldLen === 0 || app.replyDraftText.length === 0) {
      app.render()
    //}
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
