/* globals app */
const yo = require('yo-yo')
const caretCoordinates = require('textarea-caret')
const {shortenString} = require('./util')

const urlRegex = `((?:https?|dat)(?::\\/\\/)[a-zA-Z0-9-_.]+(?:[-a-zA-Z0-9:%_+.~#?&\\/\\/=@]*))`

exports.linkifyText = function (input, opts) {
  const text = typeof input == 'string' ? input : input.text

  let fullRegex = urlRegex
  let mentionNames = []

  // build mention regexpressions if we have mentions
  if (input.hasOwnProperty('mentions')) {
    const mappedNames = input.mentions.map(mention => `(@${ mention.name })`).join('|')
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
      let a = yo`<a href=${text} title=${text} target="_blank" rel="noopener noreferrer">${shortenString(text, 45)}</a>`
      // must end with jpg, png, gif, or svg, as well as allow image embedding in settings
      if (text
        && opts.inlineImages
        && !text.match(/^(.*\.(?!(jpg|png|gif|svg)$))?[^.]*$/i)
        && app.isAllowedImage(text) ) {
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

exports.replaceBetween = function (string, start, end, replacement) {
  return string.substring(0, start) + replacement + string.substring(end);
}

exports.addMention = function (mention, context = 'postDraftText') {
  const originalText = app[context]

  // get section to replace
  const cursorPos = document.activeElement.selectionStart
  const atIndex = originalText.slice(0, cursorPos).lastIndexOf('@')

  // add name to draft
  app[context] = exports.replaceBetween(originalText, atIndex, cursorPos, `@${ mention.name } `)

  // add mention to post data
  app.draftMentions.push({
   name: mention.name,
   url: mention.url
  })

  // clear out list of possible mentions and reset selected mention
  app.possibleMentions = []
  app.selectedMention = 0

  // refocus element
  setTimeout(() => {
   const textarea = document.querySelector('textarea')
   if (textarea) {
     textarea.focus()
   }
  }, 50)
}

exports.checkForMentions = function (text) {
  const allFollowed = app.currentUserProfile.follows
  const activeElement = document.activeElement
  const cursorPos = activeElement.selectionStart

  // look for the last @ before the cursor
  const atIndex = text.slice(0, cursorPos).lastIndexOf('@')

  // cancel if there's no @
  if (atIndex == -1) {
    return false
  }

  let coordinates = false

  // check for a followed name between the @ and the cursor
  const textToSearch = text.slice(atIndex + 1, cursorPos).toLowerCase()

  // if we're just starting the mention, add the caret coordinate (calculate bottom left, accounting for scroll)
  if (textToSearch.length == 0) {
    const rawCoordinates = caretCoordinates(activeElement, cursorPos)
    const y = rawCoordinates.top + rawCoordinates.height - activeElement.scrollTop
    coordinates = { x: rawCoordinates.left, y }
  }

  const mentions = allFollowed.filter(user => user.name.toLowerCase().includes(textToSearch))
  if (!mentions.length) return false
  return { mentions, coordinates }
}

var measurementDiv
exports.measureTextareaHeight = function (textarea) {
  if (!measurementDiv) {
    measurementDiv = yo`<div class="textarea-measurement-div"></div>`
    document.body.append(measurementDiv)
  }

  measurementDiv.innerHTML = textarea.value + '\nx';
  return measurementDiv.getBoundingClientRect().height
}
