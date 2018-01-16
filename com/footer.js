const yo = require('yo-yo')

// exported api

module.exports = function renderFooter () {
  return yo`
    <footer class="module">
      <nav>
        <a href="https://github.com/beakerbrowser/fritter/blob/master/README.md">About Fritter</a>
        <a href="dat://beakerbrowser.com">Learn more about Beaker</a>
        <a href="https://github.com/beakerbrowser/fritter">View Source</a>
      </footer>
    </footer>
  `
}
