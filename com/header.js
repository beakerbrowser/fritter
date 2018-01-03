const yo = require('yo-yo')
const renderHomeIcon = require('../com/icons/home')

// exported api

module.exports = function renderHeader () {
  return yo`
    <header>
      <nav>
        <a class="nav-item active" onclick=${e => app.gotoFeed(e)} href="/">
          <span class="icon">${renderHomeIcon()}</span>
          <span class="label">Home</span>
        </a>
      </nav>
    </header>
  `
}