/* globals app document FileReader */

const yo = require('yo-yo')

// exported api
// =

module.exports = function renderImageSettings(){
  // Don't show on new user creation
  const isNew = !app.currentUserProfile
  if( isNew ) return yo``

  return yo`
    <div id="image-settings" class="image-settings-wrap">
      <h2>Image Settings</h2>

      <p>Embedding images creates a more seamless timeline, but can be used to pixel-track users (<a href="https://github.com/beakerbrowser/fritter/issues/10">link</a>). Choose the setting that works best for you:</p>

      <form class="image-settings" onsubmit=${onUpdateImageSettings}>

        <input ${isCurrentSetting('all') ? 'checked' : ''} type="radio" id="choice-all" name="embedImages" value="all">
        <label for="choice-all">Embed all images</label><br>

        <input ${isCurrentSetting('dat') ? 'checked' : ''} type="radio" id="choice-dat" name="embedImages" value="dat">
        <label for="choice-dat">Embed only images from dat:// sources</label><br>

        <input ${isCurrentSetting('dat-followed') ? 'checked' : ''} type="radio" id="choice-dat-followed" name="embedImages" value="dat-followed">
        <label for="choice-dat-followed">Embed only images from dat:// sources I follow</label><br>

        <input ${isCurrentSetting('none') ? 'checked' : ''} type="radio" id="choice-none" name="embedImages" value="none">
        <label for="choice-none">Don't embed images</label><br>

        <div class="actions">
          <button type="button" class="btn" onclick=${app.gotoFeed}>Cancel</button>
          <button type="submit" class="btn primary">Save</button>
        </div>
      </form>
    </div>
  `

  async function onUpdateImageSettings(e){
    e.preventDefault()

    // Load existing settings
    const settings = JSON.parse(window.localStorage.settings || '{}')

    // Save new value of settings
    const imageSetting = document.querySelector('input[name=embedImages]:checked').value
    settings.imageEmbed = imageSetting

    await app.updateSettings(settings)

    app.gotoFeed()
  }

  function isCurrentSetting(val){
    const settings = JSON.parse(window.localStorage.settings || '{}')
    return val === settings.imageEmbed || (!settings.imageEmbed && val === 'none')
  }
}
