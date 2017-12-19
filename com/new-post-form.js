/* globals app */

const yo = require('yo-yo')
const renderAvatar = require('./avatar')

// exported api
// =

module.exports = function renderNewPostForm () {
  const isEditingPost = app.isEditingPost || app.postDraftText.length
  var editingCls = isEditingPost ? 'editing' : ''
  return yo`
    <form class="new-post-form ${editingCls}" onsubmit=${onSubmitPost}>
      <div class="inputs">
        ${renderAvatar(app.currentUserProfile)}
        <textarea
          placeholder="Write a post"
          style="border-color: ${app.getThemeColor('border')}; height: ${isEditingPost ? '60px' : '35px'};"
          onfocus=${onToggleNewPostForm}
          onblur=${onToggleNewPostForm}
          onkeyup=${onChangePostDraft}>${app.postDraftText}</textarea>
      </div>
      <div class="actions ${editingCls}">
        ${isEditingPost ? yo`<button disabled=${!app.postDraftText.length} class="btn new-post" type="submit">Submit post</button>` : ''}
      </div>
    </form>`

  function rerender () {
    yo.update(document.querySelector('.new-post-form'), renderNewPostForm())
  }

  function onChangePostDraft (e) {
    const oldLen = app.postDraftText.length
    app.postDraftText = e.target.value
    if (oldLen === 0 || app.postDraftText.length === 0) {
      rerender()
    }
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
