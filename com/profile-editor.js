/* globals app document FileReader */

const yo = require('yo-yo')
const cropPopup = require('./crop-popup')

// exported api
// =

module.exports = function renderProfileEditor () {
  const isNew = !app.currentUserProfile
  var avatar = app.currentUserProfile && app.currentUserProfile.avatar ? app.currentUserProfile.avatar : ''
  var avatarUrl = avatar ? (app.currentUserProfile.getRecordOrigin() + '/' + avatar) : ''
  var name = app.currentUserProfile && app.currentUserProfile.name ? app.currentUserProfile.name : ''
  var bio = app.currentUserProfile && app.currentUserProfile.bio ? app.currentUserProfile.bio : ''

  return yo`
    <div>
      <h2>${isNew ? 'Create' : 'Edit'} profile</h2>

      <form class="edit-profile" onsubmit=${onSaveProfile}>

        <label for="avatar">Avatar</label>
        <div title="Update your avatar" class="avatar-container">
          <input onchange=${onUpdateTmpAvatar} name="avatar" class="avatar-input" type="file" accept="image/*"/>
          ${avatar
            ? yo`<img class="avatar editor" src="${avatarUrl}?cache-buster=${Date.now()}"/>`
            : yo`<span class="avatar editor empty">+</span>`}
        </div>

        <label for="name">Name</label>
        <input autofocus type="text" name="name" placeholder="Name" value=${name}/>

        <label for="bio">Bio (optional)</label>
        <textarea name="bio" placeholder="Enter a short bio">${bio}</textarea>

        <div class="actions">
          <button type="submit" class="btn primary">${isNew ? 'Create profile' : 'Save'}</button>
        </div>
      </form>
    </div>
  `

  async function onSaveProfile (e) {
    e.preventDefault()

    await app.updateProfile({
      name: e.target.name.value || '',
      bio: e.target.bio.value || ''
    })
    app.gotoFeed()
  }

  function onUpdateTmpAvatar (e) {
    if (e.target.files) {
      var f = e.target.files[0]
      var reader = new FileReader()

      reader.onload = () => {
        e.target.value = null // clear the input
        cropPopup.create(reader.result, res => {
          var avatarEl = document.querySelector('img.editor.avatar')
          if (avatarEl) {
            avatarEl.src = res.dataUrl
          } else {
            var placeholderEl = document.querySelector('span.editor.avatar')
            placeholderEl.parentNode.replaceChild(yo`<img class="avatar editor" src=${res.dataUrl}/>`, placeholderEl)
          }
          app.tmpAvatar = res
        })
      }
      reader.readAsDataURL(f)
    }
  }
}
