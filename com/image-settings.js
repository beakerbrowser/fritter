/* globals app document */

const yo = require('yo-yo')

// exported api
// =

module.exports = function renderImageSettings () {
  return yo`
    <div id="image-settings" class="image-settings-wrap">
      <h2>Image settings</h2>

      <p>Embedding images creates a more seamless timeline, but enables <a href="https://github.com/beakerbrowser/fritter/issues/10">pixel-tracking</a>. Choose the setting that works best for you:</p>

      <form class="image-settings" onsubmit=${onUpdateImageSettings}>

        <div class="input-wrap">
          <input ${isCurrentSetting('all') ? 'checked' : ''} type="radio" id="choice-all" name="embedImages" value="all">
          <label for="choice-all">Embed all images</label>
        </div>

        <div class="input-wrap">
          <input ${isCurrentSetting('dat') ? 'checked' : ''} type="radio" id="choice-dat" name="embedImages" value="dat">
          <label for="choice-dat">Embed images from <code>dat://</code> sources</label>
        </div>

        <div class="input-wrap">
          <input ${isCurrentSetting('dat-followed') ? 'checked' : ''} type="radio" id="choice-dat-followed" name="embedImages" value="dat-followed">
          <label for="choice-dat-followed">Embed images from <code>dat://</code> sources I follow</label>
        </div>

        <div class="input-wrap">
          <input ${isCurrentSetting('none') ? 'checked' : ''} type="radio" id="choice-none" name="embedImages" value="none">
          <label for="choice-none">Don't embed images</label>
        </div>

        <div class="actions">
          <button type="submit" class="btn primary">Save</button>
        </div>
      </form>
    </div>
  `

  async function onUpdateImageSettings (e) {
    e.preventDefault()

    // Save new value of settings
    const imageSetting = document.querySelector('input[name=embedImages]:checked').value
    app.settings.imageEmbed = imageSetting

    await app.updateSettings(app.settings)

    app.gotoFeed()
  }

  function isCurrentSetting (val) {
    // const settings = JSON.parse(window.localStorage.settings || '{}')
    return val === app.settings.imageEmbed || (!app.settings.imageEmbed && val === 'none')
  }
}
