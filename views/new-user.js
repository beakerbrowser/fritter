/* globals app */

const yo = require('yo-yo')
const renderProfileEditor = require('../com/profile-editor')

// exported api
// =

module.exports = function () {
  return yo`
    <div class="view new-user">
      <div>
        <h1>Welcome to Fritter!</h1>

        <p>
          Fritter is an example Twitter clone. It demonstrates how to build
          peer-to-peer Web applications with the
          <a href="https://beakerbrowser.com">Beaker Browser</a>,
          <a href="https://datproject.org">Dat</a>, and
          <a href="https://github.com/beakerbrowser/webdb">WebDB</a>.
        </p>

        <h2>Fritter profiles</h2>
        <p>
          A Fritter profile is a bit different than a Twitter or Facebook profile.
          It's simply a website! This means you can look at all the files that
          comprise a profile. Check out
          <a href="dat://232ac2ce8ad4ed80bd1b6de4cbea7d7b0cad1441fa62312c57a6088394717e41/" target="_blank">
          Dog Legs McBoots's profile</a> to see for yourself.
        </p>
      </div>

      <div>
        ${renderProfileEditor()}
      </div>

      <div>
        <h2>Learn more</h2>
        <p>
          View <a href="https://github.com/beakerbrowser/fritter">Fritter's source
          code</a> to learn more about building peer-to-peer Web apps.
        </p>
      </div>
    </div>
  `
}

