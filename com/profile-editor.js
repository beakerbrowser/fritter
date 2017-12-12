/* globals app document FileReader */

const yo = require('yo-yo')
const cropPopup = require('./crop-popup')

// exported api
// =

module.exports = function renderProfileEditor () {
  return yo`
    <div>
      <h2>Edit your profile</h2>

      <form class="edit-profile" onsubmit=${onSaveProfile}>

        <label for="avatar">Avatar</label>
        <div title="Update your avatar" class="avatar-container">
          <input onchange=${onUpdateTmpAvatar} name="avatar" class="avatar-input" type="file" accept="image/*"/>
          <img class="avatar editor" src="${app.viewedProfile.avatar ? app.viewedProfile.getRecordOrigin() + app.viewedProfile.avatar : ''}?cache-buster=${Date.now()}"/>
          ${app.viewedProfile.avatar ? '' : yo`<span class="avatar editor empty">+</span>`}
        </div>

        <label for="name">Name</label>
        <input autofocus type="text" name="name" placeholder="Name" value=${app.viewedProfile.name || ''}/>

        <label for="bio">Bio (optional)</label>
        <textarea name="bio" placeholder="Enter a short bio">${app.viewedProfile.bio || ''}</textarea>

        <div class="actions">
          <button type="button" class="btn" onclick=${app.onToggleEditingProfile}>Cancel</button>
          <button type="submit" class="btn">Save</button>
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

    window.history.pushState({}, null, '/')
  }

  function onUpdateTmpAvatar (e) {
    if (e.target.files) {
      var f = e.target.files[0]
      var reader = new FileReader()

      reader.onload = () => {
        e.target.value = null // clear the input
        cropPopup.create(reader.result, res => {
          document.querySelector('img.editor.avatar').src = res.dataUrl
          app.tmpAvatar = res
        })
      }
      reader.readAsDataURL(f)
    }
  }
}
