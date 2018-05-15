const yo = require('yo-yo')

// to try /avatar.png, /avatar.jpg, /avatar.gif, in that order:
// imgWithFallbacks([`${f.url}/avatar.png`, `${f.url}/avatar.jpg`, `${f.url}/avatar.gif`], {cls: 'avatar'})
module.exports = function imgWithFallbacks (srcs, {cls} = {}) {
  return render(srcs, cls)
}

function render (srcs, cls) {
  const url = srcs.shift()
  return yo`
    <img class=${cls} src=${url} onerror=${(e) => onerror(e, srcs, cls)} />
  `
}

function onerror (e, srcs, cls) {
  if (srcs.length > 0) {
    yo.update(e.target, render(srcs, cls))
  }
}
