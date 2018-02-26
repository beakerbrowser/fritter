/* globals app window Event URL */
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
  let h = (max + min) / 2
  let s = (max + min) / 2
  let l = (max + min) / 2

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
      return (new Date(date)).toLocaleDateString()
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

const urlRegex = `((?:https?|dat)(?::\\/\\/)[a-zA-Z0-9-_.]+(?:[-a-zA-Z0-9:%_+.~#?&\\/\\/=@]*))`

exports.linkifyText = function (input, opts) {
  const text = typeof input == 'string' ? input : input.text

  let fullRegex = urlRegex
  let mentionNames = []

  // build mention regexpressions if we have mentions
  if (input.hasOwnProperty('mentions')) {
    const mappedNames = input.mentions.map(mention => `(@${ mention.name })`)
    fullRegex += `|(?:${ mappedNames })`

    // save names for later searching (prepend '@' to match fret text)
    mentionNames = input.mentions.map(mention => `@${ mention.name }`)
  }

  fullRegex = new RegExp(fullRegex, 'g')
  // split text by urls and mentions
  const splitText = text.split(fullRegex)

  // create document fragment made of linkified urls, images, and mentions
  let frag = splitText.reduce((frag, text, index) => {

    if (text && mentionNames.find(name => text == name)) {

      // find the relevant mention's complete object
      const obj = input.mentions.find(mention => `@${ mention.name }` == text)
      // create a link to the mentioned user's profile
      let a = yo`<a href="/user/${obj.url}" target="_blank" rel="noopener noreferrer">${ text }</a>`
      // append link
      frag.appendChild(a)

    } else if ( text && (text.startsWith('http') || text.startsWith('dat')) ) {
      // default to link
      let a = yo`<a href=${text} title=${text} target="_blank" rel="noopener noreferrer">${exports.shortenString(text, 45)}</a>`
      // must end with jpg, png, gif, or svg, as well as allow image embedding in settings
      if (text
        && opts.inlineImages
        && !text.match(/^(.*\.(?!(jpg|png|gif|svg)$))?[^.]*$/i)
        && app.isAllowedImage(text)) {
        a = yo`<img src=${text} alt=${text} class="post-image"></img>`
      }
      if (opts.cls) {
        a.classList.add(opts.cls)
      }
      frag.appendChild(a)
    } else if (text && text.length > 0) {
      frag.appendChild(document.createTextNode(text))
    }

    return frag
  }, document.createDocumentFragment())

  // attach onclick handlers for links
  // (don't propagate the event so that the link works)
  if (frag) {
    Array.from(frag.querySelectorAll('a'), a => {
      a.addEventListener('click', e => e.stopPropagation())
    })
  }

  return frag
}

exports.buildNewPost = function (startingValue) {

  const output = startingValue || {}

  if (app.draftMentions) {
    // Remove duplicates
    const uniqueMentions = []
    app.draftMentions.map((mention, i) => {
      if (!uniqueMentions.find(x => x.url == mention.url)){
        uniqueMentions.push(mention)
      }
    })
    // Filter out unused mentions
    const filteredMentions = uniqueMentions.filter(mention => output.text.includes(`@${ mention.name }`))

    if (filteredMentions.length) {
      output.mentions = filteredMentions
     }
   }

   return output
 }
