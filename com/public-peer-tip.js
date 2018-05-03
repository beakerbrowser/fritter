/* globals app */
const yo = require('yo-yo')
const renderLinkIcon = require('./icons/link')

// exported api

module.exports = function renderPublicPeerTip () {
  if (app.settings.dismissedPublicPeerTip) return ''

  return yo`
    <div class="module">
      <p>
        Make sure your profile stays online! Share your profile URL with a
        public peer like <a href="https://hashbase.io">Hashbase</a>.
      </p>

      <p>
        Feeling ambitious?
        <a href="https://github.com/beakerbrowser/hashbase">Deploy your own
        public peer</a>.
      </p>

      <button class="btn full-width" onclick=${app.copyProfileUrl}>
        Copy your profile URL
        ${renderLinkIcon()}
      </button>

      <button class="btn dismiss-btn" onclick=${onDismiss}></button>
    </div>
  `

  function onDismiss () {
    app.updateSettings({dismissedPublicPeerTip: true})
    app.render()
  }
}
