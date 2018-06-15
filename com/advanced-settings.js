/* globals app */

const yo = require('yo-yo')

// exported api
// =

module.exports = function renderAdvancedSettings () {
  return yo`
    <div>
      <h2>Advanced</h2>

      <p>
        <button class="btn" onclick=${onRebuildDatabase}>Rebuild database</button>
      </p>
    </div>
  `

  async function onRebuildDatabase (e) {
    e.preventDefault()
    await app.libfritter.db.delete() // clear index
    window.location.pathname = '/'
  }
}


