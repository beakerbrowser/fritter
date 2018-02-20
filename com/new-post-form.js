/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')
const mentionCheck = require('./mention-check.js')

let possibleMentions = null

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
    possibleMentions = mentionCheck(app.postDraftText)

    // TODO: Conditional render of floating mentions list

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
