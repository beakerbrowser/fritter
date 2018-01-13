/* globals window Event */
const yo = require('yo-yo')

exports.findParent = function findParent (node, test) {
  if (typeof test === 'string') {
    // classname default
    var cls = test
    test = el => el.classList && el.classList.contains(cls)
  }

  while (node) {
    if (test(node)) {
      return node
    }
    node = node.parentNode
  }
}

exports.pluralize = function pluralize (num, base, suffix = 's') {
  if (num === 1) { return base }
  return base + suffix
}

exports.polyfillHistoryEvents = function polyfillHistoryEvents () {
  // HACK FIX
  // the good folk of whatwg didnt think to include an event for pushState(), so let's add one
  // -prf
  var _wr = function (type) {
    var orig = window.history[type]
    return function () {
      var rv = orig.apply(this, arguments)
      var e = new Event(type.toLowerCase())
      e.arguments = arguments
      window.dispatchEvent(e)
      return rv
    }
  }
  window.history.pushState = _wr('pushState')
  window.history.replaceState = _wr('replaceState')
}

exports.toCSSColor = function toCSSColor (hslaObj) {
  const {h, s, l, a} = hslaObj
  return `hsla(${h}, ${s}%, ${l}%, ${a})`
}

exports.cssColorToHsla = function (color) {
  if (color.startsWith('#')) color = color.slice(1)

  let bigint = parseInt(color, 16)
  let r = (bigint >> 16) & 255
  let g = (bigint >> 8) & 255
  let b = bigint & 255

  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    var d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  h = Math.round(360 * h)
  s = Math.round(s * 100)
  l = Math.round(l * 100)
  return {h, s, l, a: 1}
}

exports.timestamp = function (date) {
  var seconds = Math.floor((new Date() - date) / 1000)
  var interval = Math.floor(seconds / 2592000)

  if (interval >= 1) {
    if (interval >= 3) {
      return date.toLocaleDateString()
    }
    return interval + 'mo ago'
  }
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return interval + 'd ago'
  }
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return interval + 'h ago'
  }
  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return interval + 'm ago'
  }
  return Math.floor(seconds) + 's ago'
}

exports.getURLOrigin = function (url) {
  return (new URL(url)).origin
}

exports.shortenDatURL = function (url) {
  return url.slice(0, 10) + '..' + url.slice(-2)
}

exports.shortenString = function (str, n) {
  if (str.length > n) {
    return str.slice(0, n - 3) + '...'
  }
  return str
}

// Capture the whole URL in group 1 to keep string.split() support
const urlRegex = () => (/((?:(?:https?|dat)(?::\/\/))[a-zA-Z0-9-_.]+(?:[-a-zA-Z0-9:%_+.~#?&//=@]*))/g)

exports.linkifyText = function (input, opts) {
  return input.split(urlRegex()).reduce((frag, text, index) => {
    if (index % 2) { // URLs are always in odd positions
      let a = text.match(/^(.*\.(?!(jpg|png|gif|svg)$))?[^.]*$/i) ?
        yo`<a href=${text} title=${text} target="_blank">${exports.shortenString(text, 30)}</a>` :
        yo`<img src=${text} alt=${text} class="post-image"></img>`
      if (opts.cls) {
        a.classList.add(opts.cls)
      }
      frag.appendChild(a)
    } else if (text.length > 0) {
      frag.appendChild(document.createTextNode(text))
    }

    return frag
  }, document.createDocumentFragment())
}
