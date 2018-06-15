const yo = require('yo-yo')
const renderSpinnerIcon = require('./icons/spinner')
const renderErrorIcon = require('./icons/error')

// exported api

exports.render = function () {
  var isExpanded = app.isIndexingStatusesExpanded
  var numIndexed = 0
  var numIndexing = 0
  var numMissing = 0
  var numErrored = 0
  for (var status of Object.values(app.indexingStatuses)) {
    if (status.isIndexing) numIndexing++
    else if (status.error === 'missing') numMissing++
    else if (status.error) numErrored++
    else numIndexed++
  }
  if (!numMissing && !numErrored && !numIndexing) {
    return ''
  }

  function renderList () {
    var els = []
    for (let [url, status] of Object.entries(app.indexingStatuses)) {
      if (!status.isIndexing && !status.error) continue
      els.push(yo`
        <div class="indexing-statuses-list-item">
          <div class="status ${status.error ? 'error' : ''}">
            ${status.isIndexing
              ? renderSpinnerIcon()
              : status.error
                ? renderErrorIcon()
                : ''}
          </div>
          <div><a class="dat-url link" href="/user/${url}" onclick=${onGoto}>${url.slice(6, 12)}..${url.slice(-2)}</a></div>
          ${status.error
            ? yo`<div class="error-desc">${status.error === 'missing' ? 'Timed out.' : status.error.toString()}</div>`
            : ''}
          <div class="unfollow link" onclick=${() => app.unfollowByURL(url)}>unfollow</div>
        </div>`
      )
    }
    return yo`<div class="indexing-statuses-list">${els}</div>`
  }

  function onGoto (e) {
    e.preventDefault()
    window.history.pushState({}, null, e.currentTarget.getAttribute('href'))
  }

  return yo`
    <div id="indexing-statuses" class="module">
      <div class="indexing-statuses-summary" onclick=${() => app.toggleIndexingStatusesExpanded()}>
        <div>${isExpanded ? caret() : renderSpinnerIcon()}</div>
        <div><span>${numIndexed}</span> feeds synced</div>
        ${numIndexing > 0
          ? yo`<div><span>${numIndexing}</span> loading</div>`
          : ''}
        ${numMissing > 0
          ? yo`<div><span>${numMissing}</span> timed out</div>`
          : ''}
        ${numErrored > 0
          ? yo`<div><span>${numErrored}</span> errored</div>`
          : ''}
      </div>
      ${isExpanded ? renderList() : ''}
    </div>
  `
}

exports.rerender = function () {
  var el = document.getElementById('indexing-statuses')
  if (el) {
    var newEl = exports.render()
    if (newEl) yo.update(el, newEl)
    else el.parentNode.removeChild(el)
  }
}

function caret () {
  var el = yo`<span class="caret"></span>`
  el.innerHTML = `&#8227;`
  return el
}
