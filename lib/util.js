/* globals window Event */

const moment = require('moment')

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

exports.timestamp = function timestamp (ts, opts) {
  const endOfToday = moment().endOf('day')
  if (typeof ts === 'number') { ts = moment(ts) }

  // TODO: lord forgive me for i have sinned -tbv
  // here's what you get when the moment.js docs are taking too long to parse
  // and i'm in a rush:
  if (ts.isSame(endOfToday, 'day')) {
    var fromNow = ts.fromNow()
    fromNow = fromNow.substring(0, fromNow.indexOf(' ago'))
    fromNow = fromNow.replace('an ', '1')
    fromNow = fromNow.replace('a ', '1')
    fromNow = fromNow.replace('hours', 'h')
    fromNow = fromNow.replace('hour', 'h')
    fromNow = fromNow.replace('minutes', 'm')
    fromNow = fromNow.replace('minute', 'm')
    fromNow = fromNow.replace('seconds', 's')
    fromNow = fromNow.replace('second', 's')
    fromNow = fromNow.replace('few', '')
    fromNow = fromNow.replace(' ', '')
    return fromNow
  } else {
    return ts.format('MMM D')
  }
}
