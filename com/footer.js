const yo = require('yo-yo')
const renderHomeIcon = require('../com/icons/home')

// exported api

module.exports = function renderHeader () {
  return yo`
    <footer>
      <nav>
        <a href="https://github.com/beakerbrowser/fritter">
          About Fritter
        </a>
        <a href="https://github.com/beakerbrowser/fritter">
          View source
        </a>
        <a href="https://github.com/beakerbrowser/fritter">
          What is Fritter?
        </a>
      </footer>
    </header>
  `
}