/* globals app window DatArchive */

const yo = require('yo-yo')

// exported api
// =

module.exports = function renderProfilePicker () {
  const isNew = !app.currentUserProfile
  var hasValue = !!app.profilePickerInputUrl

  return yo`
    <div>
      <h2>${isNew ? 'Use existing' : 'Use a different'} profile</h2>

      <form id="import-profile" onsubmit=${onImportProfile}>
        <button type="button" onclick=${onSelectProfile} class="btn">Select profile from Library</button>

        <p>
          <input oninput=${validateProfileUrl} name="profileUrl" type="text" placeholder="Paste profile URL" value=${app.profilePickerInputUrl||''}/>
        </p>

        <button id="import-profile-btn" type="submit" class="btn primary" ${hasValue ? '' : 'disabled'}>
          ${isNew ? 'Go to feed' : 'Use this profile'}
        </button>
      </form>
    </div>
  `

  async function onSelectProfile (e) {
    let profileUrlInput = document.querySelector('input[name="profileUrl"]')
    let profileImportSubmitBtn = document.getElementById('import-profile-btn')

    var profileArchive = await DatArchive.selectArchive({
      title: 'Choose an existing profile',
      buttonLabel: 'Use this profile',
      filters: {isOwner: true}
    })

    app.profilePickerInputUrl = profileUrlInput.value = profileArchive.url
    profileImportSubmitBtn.disabled = false
  }

  function validateProfileUrl (e) {
    let profileUrlInput = document.querySelector('input[name="profileUrl"]')
    let profileImportSubmitBtn = document.getElementById('import-profile-btn')
    const isDatHashRegex = /^[a-z0-9]{64}/i
    let profileUrl = e.target.value

    // handle the user pasting their full Fritter URL
    if (profileUrl.startsWith(`${window.location.href}user/`)) {
      profileUrl = profileUrl.substr(`${window.location.href}user/`.length)
    } else if (profileUrl.startsWith('dat://fritter.hashbase.io/user/')) {
      profileUrl = profileUrl.substr('dat://fritter.hashbase.io/user/'.length)
    }

    // validate that it's a dat:// hash
    if (profileUrl.startsWith('dat://')) {
      if (isDatHashRegex.test(profileUrl.substr('dat://'.length))) {
        profileImportSubmitBtn.disabled = false
      }
    } else if (isDatHashRegex.test(profileUrl)) {
      profileImportSubmitBtn.disabled = false
    } else {
      profileImportSubmitBtn.disabled = true
    }

    profileUrlInput.value = profileUrl
  }

  async function onImportProfile (e) {
    e.preventDefault()

    window.localStorage.userUrl = e.target.profileUrl.value
    await app.libfritter.db.delete() // clear index
    window.location.reload()
  }
}
