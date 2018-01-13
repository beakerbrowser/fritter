/* globals window */

const yo = require('yo-yo')
const nanorouter = require('nanorouter')
const LibFritter = require('@beaker/libfritter')
const views = require('../views/index')
const renderErrorIcon = require('../com/icons/error')
const {pluralize, toCSSColor, polyfillHistoryEvents, getURLOrigin, shortenDatURL, cssColorToHsla} = require('./util')

const MAX_WHO_TO_FOLLOWS = 20
// default 'who to follow' URLs so that everybody has somebody to start
const whoToFollowSeedUrls = [
  'dat://6348fac3c70e916885ead7dce6927f01e02c0efd1a9273849891c23b7e7bac4d',
  'dat://6e96b27838c76991ac3563f729beb7c6e6c362fe369793784cd1c729b2b37299'
]

module.exports = class FritterApp {
  constructor () {
    this.libfritter = new LibFritter('fritter')
    this.currentUser = null
    this.currentUserProfile = null
    this.currentView = 'feed'
    this.currentSubview = null
    this.currentLoaderPromise = null

    this.posts = null
    this.notifications = null
    this.unreadNotifications = 0
    this.notificationsLastReadTS = 0
    this.whoToFollow = null
    this.viewedProfile = null
    this.viewedPost = null
    this.viewError = null

    this.postDraftText = ''
    this.replyDraftText = ''
    this.isEditingPost = false
    this.isEditingReply = false
    this.tmpAvatar = null

    this.settings = null
    this.appColors = null
  }

  getAppColor (k) {
    return toCSSColor(this.appColors[k])
  }

  async setup () {
    // setup router
    this.router = nanorouter()
    this.router.on('/', () => this.setView('feed'))
    this.router.on('/thread/*', p => this.setView('thread', p.wildcard))
    this.router.on('/user/*', p => this.setView('user', p.wildcard))
    this.router.on('/notifications', p => this.setView('notifications'))
    this.router.on('/settings', p => this.setView('settings'))
    const onRouteChange = () => this.router(window.location.pathname)
    polyfillHistoryEvents()
    window.addEventListener('pushstate', onRouteChange)
    window.addEventListener('popstate', onRouteChange)

    // fetch settings from localStorage
    try {
      this.settings = JSON.parse(window.localStorage.settings)
    } catch (e) {
      this.settings = {}
    }

    // setup theme color
    if (!this.settings.themeColor) {
      this.settings.themeColor = '#000000'
    }
    this.setAppColors()

    // load global data
    await this.libfritter.db.open()
    await this.setCurrentUser(window.localStorage.userUrl)
    onRouteChange()

    // set up secondary data
    await this.checkForNotifications()

    // fetch new posts and notifications every 10 seconds
    window.setInterval(this.checkForNewPosts.bind(this), 10e3)
    window.setInterval(this.checkForNotifications.bind(this), 10e3)

    // kick off who-to-follow loads
    this.loadWhoToFollow()

    // index everybody the user follows
    if (this.currentUserProfile) {
      await Promise.all(this.currentUserProfile.followUrls.map(async (url) => {
        await this.libfritter.db.indexArchive(url)

        // TODO
        // this was added because we wanted to show newly-indexed posts
        // but it was creating a really bad performance problem
        // commenting out for now to see what it's like without the rerenders
        // -prf
        // if (this.currentView === 'feed') {
        //   // reload feed and render as each is loaded
        //   this.posts = await this.loadFeedPosts(this.viewedProfile)
        //   this.render()
        // }
      }))
    }
  }

  async setCurrentUser (url) {
    if (!url) return
    this.currentUser = new DatArchive(url)
    this.libfritter.setUser(this.currentUser)
    await this.libfritter.prepareArchive(this.currentUser)
    await this.libfritter.db.indexArchive(this.currentUser)
    await this.loadCurrentUserProfile()
  }

  async loadCurrentUserProfile () {
    this.currentUserProfile = await this.libfritter.social.getProfile(this.currentUser)
    this.currentUserProfile.isCurrentUser = true
  }

  async setView (view, param) {
    this.currentView = view
    this.currentSubview = null
    this.viewedProfile = null
    this.viewedPost = null
    this.viewError = null
    this.notifications = null

    // render "loading..."
    this.render()

    try {
      // use `runInnerLoad` to only apply the updates if setView() isnt called again while loading
      await this.runInnerLoad(async (apply) => {
        if (view === 'feed') {
          apply({posts: await this.loadFeedPosts()})
        }
        if (view === 'user') {
          try {
            await this.libfritter.db.indexArchive(param, {watch: false}) // index in case not already indexed
            let viewedProfile = await this.libfritter.social.getProfile(param)
            let posts = await this.loadFeedPosts(viewedProfile)
            apply({viewedProfile, posts})
          } catch (e) {
            apply({
              viewError: yo`<div>
                <p><strong>${renderErrorIcon()} Failed to load user at <a href=${param}>the given URL</a>.</strong></p>
                <p>${e.toString()}</p>
              </div>`
            })
          }
        }
        if (view === 'thread') {
          await this.libfritter.db.indexFile(param) // index in case not already indexed
          let viewedPost = await this.loadViewedPost(param)
          if (viewedPost) apply({viewedPost})
          else {
            apply({
              viewError: yo`<div>
                <p><strong>${renderErrorIcon()} Failed to load thread at <a href=${param}>the given URL</a>.</strong></p>
                <p>Post not found.</p>
              </div>`
            })
          }
        }
        if (view === 'notifications') {
          let notifications = await this.libfritter.notifications.listNotifications({
            reverse: true,
            fetchAuthor: true,
            fetchPost: true
          })
          apply({
            notifications,
            unreadNotifications: 0,
            notificationsLastReadTS: (+localStorage.notificationsLastReadTS || 0)
          })
          localStorage.notificationsLastReadTS = Date.now()
        }
      })
    } catch (e) {
      this.viewError = e.toString()
    }

    this.render()
    window.scrollTo(0, 0)
  }

  setSubview (subview) {
    this.currentSubview = subview
    this.render()
  }

  render () {
    views.render()
  }

  // loaders
  // =

  // helper to make sure a setView() only applies transactionally
  // without this, if a view is slow to load and the user clicks away, the load could finish and then mess up the page
  // with this, only the most recent setView() is applied to the app state
  async runInnerLoad (fn) {
    // abort any existing load process
    if (this.currentLoaderPromise) {
      this.currentLoaderPromise.abort()
    }

    // run the inner process with a guarded apply method
    var isAborted = false
    const apply = updates => {
      if (isAborted) return
      for (var k in updates) {
        this[k] = updates[k]
      }
    }
    this.currentLoaderPromise = fn(apply)
    this.currentLoaderPromise.abort = () => { isAborted = true }

    // now wait for it to finish
    await this.currentLoaderPromise
  }

  async loadFeedPosts (viewedProfile) {
    var query = {
      fetchAuthor: true,
      countVotes: true,
      reverse: true,
      rootPostsOnly: true,
      countReplies: true
    }
    if (viewedProfile) {
      query.rootPostsOnly = false
      query.author = viewedProfile.getRecordOrigin()
    } else {
      query.authors = this.getAuthorWhitelist()
    }
    var posts = await this.libfritter.feed.listPosts(query)
    posts = await Promise.all(posts.map(async p => {
      if (p.threadParent) {
        p.threadParent = await this.libfritter.feed.getPost(p.threadParent)
      }
      return p
    }))
    return posts
  }

  async loadViewedPost (href) {
    try {
      var viewedPost = await this.libfritter.feed.getThread(href)
      if (viewedPost) {
        if (viewedPost.author) {
          viewedPost.author.isCurrentUser = viewedPost.author.getRecordOrigin() === this.currentUserProfile.getRecordOrigin()
        } else {
          let url = getURLOrigin(href)
          viewedPost.author = {url, name: shortenDatURL(url)}
        }
      }
      return viewedPost
    } catch (e) {
      console.error(e)
    }
  }

  async checkForNewPosts () {
    const indicatorEl = document.querySelector('.new-posts-indicator')
    if (!indicatorEl) return

    var query = {
      limit: 1,
      reverse: true,
      rootPostsOnly: true,
      authors: this.getAuthorWhitelist()
    }

    if (this.viewedProfile) {
      query.rootPostsOnly = false
      query.author = this.viewedProfile.getRecordOrigin()
    }

    let newestPost = await this.libfritter.feed.listPosts(query)
    newestPost = newestPost[0]

    if (newestPost && this.posts[0] && newestPost.getRecordURL() !== this.posts[0].getRecordURL()) {
      const reloadFeed = async () => {
        this.posts = await this.loadFeedPosts(this.viewedProfile)
        this.render()
      }
      yo.update(
        indicatorEl,
        yo`<div class="new-posts-indicator" onclick=${reloadFeed}>New posts</div>`
      )
    }
  }

  async checkForNotifications () {
    const oldCount = this.unreadNotifications
    const after = (+localStorage.notificationsLastReadTS)
    this.unreadNotifications = await this.libfritter.notifications.countNotifications({after})
    if (oldCount !== this.unreadNotifications) {
      this.render()
    }
  }

  // mutators
  // =

  setAppColors () {
    const themeColor = cssColorToHsla(this.settings.themeColor)
    this.appColors = {
      base: themeColor,
      border: Object.assign({}, themeColor, {l: 75}),
      boxShadow: Object.assign({}, themeColor, {l: 85}),
      faded: Object.assign({}, themeColor, {l: 97}),
      hover: Object.assign({}, themeColor, {l: 99})
    }
  }

  updateSettings (settings={}) {
    this.settings = Object.assign(this.settings, settings)
    localStorage.settings = JSON.stringify(this.settings)
  }

  async updateProfile ({name, bio} = {}) {
    // create user if needed
    if (!this.currentUser) {
      this.currentUser = await DatArchive.create({
        title: 'Fritter User: ' + name,
        description: 'User profile for the Fritter example app'
      })
      await this.libfritter.prepareArchive(this.currentUser)
      await this.libfritter.db.indexArchive(this.currentUser)
      window.localStorage.userUrl = this.currentUser.url
    }

    // update profile
    await this.libfritter.social.setProfile(this.currentUser, {name, bio})

    // if the avatar's changed, update the profile avatar
    if (this.tmpAvatar) {
      await this.libfritter.social.setAvatar(this.currentUser, this.tmpAvatar.imgData, this.tmpAvatar.imgExtension)
    }
    this.tmpAvatar = undefined

    // reload user data
    await this.loadCurrentUserProfile()
  }

  async loadWhoToFollow () {
    if (this.whoToFollow) {
      return // only load who to follow once
    }
    this.whoToFollow = []

    // construct list of 'who to follow's
    let whoToFollowUrls = new Set()
    if (this.currentUserProfile) {
      // iterate followed users' urls
      let fu = this.currentUserProfile.followUrls
      for (let i = 0; i < fu.length; i++) {
        // get followed user's profile
        let profile = await this.libfritter.social.getProfile(fu[i])
        if (profile && profile.followUrls && profile.followUrls.length) {
          // iterate followed user's followed users
          let fu2 = profile.followUrls
          for (let j = 0; j < fu2.length; j++) {
            let url = fu2[j]
            // add to who to follow if not already followed, and not the current user
            if (fu.indexOf(url) === -1 && url !== this.currentUser.url) {
              whoToFollowUrls.add(url)
            }
          }
        }
      }
    }

    // add defaults
    whoToFollowSeedUrls.forEach(url => {
      if (this.currentUserProfile.followUrls.indexOf(url) === -1 && url !== this.currentUser.url) {
        whoToFollowUrls.add(url)
      }
    })

    // apply limit
    whoToFollowUrls = Array.from(whoToFollowUrls).slice(0, MAX_WHO_TO_FOLLOWS)

    // load profiles of 'who to follow's and add them to the list as they arrive
    await Promise.all(whoToFollowUrls.map(async (url) => {
      await this.libfritter.db.indexFile(url + '/profile.json')
      const profile = await this.libfritter.social.getProfile(url)
      if (profile) {
        this.whoToFollow.push(profile)
      }
    }))
    this.render()
  }

  removeFromWhoToFollow (userUrl) {
    this.whoToFollow = this.whoToFollow.filter(profile => profile.getRecordOrigin() !== userUrl)
  }

  async toggleFollowing (user) {
    var userUrl = user.getRecordOrigin ? user.getRecordOrigin() : user.url // we may be given a profile record or a follows record
    if (this.isCurrentUserFollowing(user)) {
      await this.libfritter.social.unfollow(this.currentUser, userUrl)
    } else {
      await this.libfritter.social.follow(this.currentUser, userUrl, user.name || '')
      this.removeFromWhoToFollow(userUrl)
    }
    await this.loadCurrentUserProfile()
    this.render()
  }

  async toggleLiked (p) {
    const vote = p.votes.upVoters.includes(this.currentUser.url) ? 0 : 1
    await this.libfritter.feed.vote(this.currentUser, {vote, subject: p.getRecordURL()})
    p.votes = await this.libfritter.feed.countVotesFor(p.getRecordURL())
    this.render()
  }

  // helpers
  // =

  isCurrentUser (url) {
    if (!this.currentUserProfile) return false
    return this.currentUserProfile.getRecordOrigin() === url
  }

  isCurrentUserFollowing (url) {
    if (!this.currentUserProfile) return false
    if (typeof url !== 'string') {
      url = url.getRecordOrigin ? url.getRecordOrigin() : url.url
    }
    return this.currentUserProfile.followUrls.includes(url)
  }

  getAuthorWhitelist () {
    if (!this.currentUserProfile) return []
    return this.currentUserProfile.followUrls.concat(this.currentUser.url)
  }

  gotoFeed (e) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    window.history.pushState({}, null, '/')
  }

  gotoNotifications (e) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    window.history.pushState({}, null, '/notifications')
  }

  gotoSettings (e) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    window.history.pushState({}, null, '/settings')
  }

  threadUrl (post) {
    return '/thread/' + post.getRecordURL()
  }

  gotoThread (post, e) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    window.history.pushState({}, null, this.threadUrl(post))
  }

  profileUrl (profile) {
    if (!profile) return
    const url = profile.getRecordOrigin ? profile.getRecordOrigin() : profile.url
    return '/user/' + url
  }

  gotoProfile (profile, e) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    window.history.pushState({}, null, this.profileUrl(profile))
  }
}
