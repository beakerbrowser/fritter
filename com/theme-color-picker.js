/* globals app */

const yo = require('yo-yo')

// exported api
// =

module.exports = function renderThemeColorPicker () {
  return yo`
    <div>
      <h2>Theme color</h2>

      <form id="pick-theme-color">
        <input name="theme-color" type="color" oninput=${onUpdateThemeColor} value=${app.settings.themeColor}>
        <code class="theme-color-label">${app.settings.themeColor}</code>
      </form>
    </div>
  `

  async function onUpdateThemeColor (e) {
    app.updateSettings({themeColor: e.target.value})
    app.setAppColors()
    app.render()
  }
}
