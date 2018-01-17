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

      <form class="image-settings">

        <input type="radio" id="choice-all" name="embedImages" value="all">
        <label for="choice-all">Embed all images</label><br>

        <input type="radio" id="choice-dat" name="embedImages" value="dat">
        <label for="choice-dat">Embed only images from dat:// sources</label><br>

        <input type="radio" id="choice-dat-followed" name="embedImages" value="dat-followed">
        <label for="choice-dat-followed">Embed only images from dat:// sources I follow</label><br>

        <input type="radio" id="choice-none" name="embedImages" value="none">
        <label for="choice-none">Don't embed images</label><br>

        <div class="actions">
          <button type="button" class="btn" onclick=${app.gotoFeed}>Cancel</button>
          <button type="submit" class="btn primary">Save</button>
        </div>
      </form>
    </div>
  `
}
