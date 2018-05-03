/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('../avatar')
const renderMentions = require('./mention-window')
const {buildNewPost, addMention, checkForMentions} = require('../../lib/posts')

const ARROW_UP = 38
const ARROW_DOWN = 40
const ENTER_KEY = 13

// exported api
// =

module.exports = function renderNewPostForm (onSubmit = null) {
  const isEditingPost = app.isEditingPost || app.postDraftText.length
  var editingCls = isEditingPost ? 'editing' : ''
  return yo`
    <form class="new-post-form ${editingCls}" onsubmit=${onSubmit || onSubmitPost}>
      <div class="inputs">
        ${renderAvatar(app.currentUserProfile, 'small')}

        <textarea
          placeholder="Write a post"
          style="border-color: ${app.getAppColor('border')}; height: ${isEditingPost ? '60px' : '35px'};"
          onfocus=${onToggleNewPostForm}
          onblur=${onToggleNewPostForm}
          onkeyup=${onChangePostDraft}
          onkeydown=${onDraftKeyDown}>${app.postDraftText}</textarea>

        ${app.possibleMentions && app.possibleMentions.length && app.isEditingPost
          ? renderMentions()
          : ''
        }
      </div>

      <div class="actions ${editingCls}">
        <span class="char-count">${app.postDraftText.length || ''}</span>
        ${isEditingPost ? yo`<button disabled=${!app.postDraftText.length} class="btn new-post" type="submit">Submit post</button>` : ''}
      </div>
    </form>`

  function rerender (submitCallback) {
    yo.update(document.querySelector('.new-post-form'), renderNewPostForm(submitCallback))
  }

  function onChangePostDraft (e) {
    app.postDraftText = e.target.value

    const checkResults = checkForMentions(app.postDraftText)

    app.possibleMentions = checkResults.mentions
    if (checkResults.coordinates) {
      app.mentionCoordinates = `${checkResults.coordinates.x}px, ${checkResults.coordinates.y}px`
    }

    rerender(onSubmit)
  }

  // Separate function to handle arrow keys, enter key, etc. and prevent default
  function onDraftKeyDown (e) {
    // if we have mentions available...
    if (app.possibleMentions && app.possibleMentions.length) {
      let dirty = false

      // if we're past the length of the current mention list, move to the last mention
      // (ie if the length of the list just changed)
      if (app.selectedMention >= app.possibleMentions.length) {
        app.selectedMention = Math.max(app.possibleMentions.length - 1, 0)
        dirty = true
      }

      // if we hit an up or down arrow and mentions are open, change the selected mention
      if (app.possibleMentions.length && (e.keyCode === ARROW_UP || e.keyCode === ARROW_DOWN)) {
        e.preventDefault()

        app.selectedMention += (e.keyCode === ARROW_UP ? -1 : 1)

        // jump to the end of the list
        if (app.selectedMention < 0) {
          app.selectedMention = app.possibleMentions.length - 1
        } else if (app.selectedMention >= app.possibleMentions.length) {
          // loop to the start of the list
          app.selectedMention = 0
        }

        dirty = true
      }

      // if we hit "enter" and the mentions are open, click the selected mention
      if (e.keyCode === ENTER_KEY) {
        e.preventDefault()
        addMention(app.possibleMentions[app.selectedMention])
        dirty = true
      }

      // only rerender if we need to
      if (dirty) {
        rerender(onSubmit)
      }
    }
  }

  async function onSubmitPost (e) {
    e.preventDefault()
    await app.libfritter.feed.post(app.currentUser, buildNewPost({ text: app.postDraftText }))
    app.postDraftText = ''
    app.posts = await app.loadFeedPosts()
    app.render()
  }

  async function onToggleNewPostForm () {
    app.isEditingPost = !app.isEditingPost
    rerender(onSubmit)
  }
}
