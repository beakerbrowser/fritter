/* globals window Event */

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

exports.timestamp = function (date) {
  var seconds = Math.floor((new Date() - date) / 1000)
  var interval = Math.floor(seconds / 31536000)

  if (interval > 1) {
    return interval + 'y ago'
  }
  interval = Math.floor(seconds / 2592000)
  if (interval > 1) {
    return interval + 'mo ago'
  }
  interval = Math.floor(seconds / 86400)
  if (interval > 1) {
    return interval + 'd ago'
  }
  interval = Math.floor(seconds / 3600)
  if (interval > 1) {
    return interval + 'h ago'
  }
  interval = Math.floor(seconds / 60)
  if (interval > 1) {
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