/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const mentionCheck = require('./mention-check')
const renderMentions = require('./mention-window')

let mentionCoordinates = null

// exported api
// =

module.exports = function renderNewPostForm () {
  const isEditingPost = app.isEditingPost || app.postDraftText.length
  var editingCls = isEditingPost ? 'editing' : ''
  return yo`
    <form class="new-post-form ${editingCls}" onsubmit=${onSubmitPost}>
      <div class="inputs">
        ${renderAvatar(app.currentUserProfile, 'small')}

        <textarea
          placeholder="Write a post"
          style="border-color: ${app.getAppColor('border')}; height: ${isEditingPost ? '60px' : '35px'};"
          onfocus=${onToggleNewPostForm}
          onblur=${onToggleNewPostForm}
          onkeyup=${onChangePostDraft}>${app.postDraftText}</textarea>

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

  function rerender () {
    yo.update(document.querySelector('.new-post-form'), renderNewPostForm())
  }

  function onChangePostDraft (e) {
    app.postDraftText = e.target.value

    const checkResults = mentionCheck(app.postDraftText)

    app.possibleMentions = checkResults.mentions
    if (checkResults.coordinates) {
      app.mentionCoordinates = `${ checkResults.coordinates.x }px, ${ checkResults.coordinates.y }px`
    }

    rerender()
  }

  async function onSubmitPost (e) {
    e.preventDefault()
    await app.libfritter.feed.post(app.currentUser, {text: app.postDraftText})
    app.postDraftText = ''
    app.posts = await app.loadFeedPosts()
    app.render()
  }

  async function onToggleNewPostForm () {
    app.isEditingPost = !app.isEditingPost
    rerender()
  }
}
