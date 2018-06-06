/* globals window DatArchive */

const yo = require('yo-yo')
const nanorouter = require('nanorouter')
const LibFritter = require('@beaker/libfritter')
const views = require('../views/index')
const renderErrorIcon = require('../com/icons/error')
const {toCSSColor, polyfillHistoryEvents, getURLOrigin, shortenDatURL, cssColorToHsla} = require('./util')
const defaultAvatarBase64Png = require('./default-avatar-base64-png')

const MAX_WHO_TO_FOLLOWS = 10
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
    this.viewedProfilePostsCount = null
    this.viewedPost = null
    this.viewIsLoading = false
    this.viewError = null

    this.postDraftText = ''
    this.isEditingPost = false
    this.tmpAvatar = null

    this.draftMentions = []

    this.possibleMentions = null
    this.mentionCoordinates = '0, 0'
    this.selectedMention = 0

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
      this.settings.themeColor = '#1992FB'
    }
    this.setAppColors()

    // load database
    var userUrl = window.localStorage.userUrl
    if (userUrl) {
      this.currentUser = new DatArchive(userUrl)
      this.libfritter.setUser(this.currentUser)
      await this.libfritter.prepareArchive(this.currentUser)
    }
    await this.libfritter.db.open()
    if (userUrl) {
      await this.libfritter.db.indexArchive(this.currentUser)
      await this.loadCurrentUserProfile()
    }
    onRouteChange()

    // set up secondary data
    await this.checkForNotifications()

    // fetch new posts and notifications every 10 seconds
    window.setInterval(this.checkForNewPosts.bind(this), 10e3)
    window.setInterval(this.checkForNotifications.bind(this), 10e3)

    // kick off who-to-follow loads
    setTimeout(this.loadWhoToFollow.bind(this), 5e3)

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

  async loadCurrentUserProfile () {
    this.currentUserProfile = await this.libfritter.social.getProfile(this.currentUser)
    if ( this.currentUserProfile !== undefined) {
    this.currentUserProfile.isCurrentUser = true
    }
  }

  async setView (view, param) {
    this.currentView = view
    this.currentSubview = null
    this.viewedProfile = null
    this.viewedPost = null
    this.viewError = null
    this.notifications = null

    // render "loading..."
    this.viewIsLoading = true
    this.render()

    try {
      // use `runInnerLoad` to only apply the updates if setView() isn't called again while loading
      await this.runInnerLoad(async (apply) => {
        if (view === 'feed') {
          if (this.currentUserProfile !== undefined) {
            apply({ posts: await this.loadFeedPosts() });
            document.title = "Fritter";
          } else {
            window.localStorage.removeItem("userUrl");
            this.currentUser = null;
            apply({
              viewError: yo`<div>
                ${renderErrorIcon()} Selected profile is empty or is not a Fritter Profile. <a href="/"> Try again! </a>
              </div>`
            });
          }
        } else if (view === 'user') {
          try {
            // resolve the name in case a shortname is used
            param = `dat://${await DatArchive.resolveName(param)}`
            await this.libfritter.db.indexArchive(param, {watch: false}) // index in case not already indexed
            let viewedProfile = await this.libfritter.social.getProfile(param)
            let posts = await this.loadFeedPosts(viewedProfile)
            let viewedProfilePostsCount = await this.libfritter.feed.countPosts({author: viewedProfile})
            apply({viewedProfile, posts, viewedProfilePostsCount})
          } catch (e) {
            apply({
              viewError: yo`<div>
                <p><strong>${renderErrorIcon()} Failed to load user at <a href=${param}>the given URL</a>.</strong></p>
                <p>${e.toString()}</p>
              </div>`
            })
          }
          document.title = 'Fritter'
        } else if (view === 'thread') {
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
          document.title = 'Fritter'
        } else if (view === 'notifications') {
          document.title = 'Fritter - Notifications'
          apply({
            notifications: await this.loadNotifications(),
            unreadNotifications: 0,
            notificationsLastReadTS: (+window.localStorage.notificationsLastReadTS || 0)
          })
          window.localStorage.notificationsLastReadTS = Date.now()
        } else if (view === 'settings') {
          document.title = 'Fritter - Settings'
        }
      })
    } catch (e) {
      this.viewError = e.toString()
    }

    this.viewIsLoading = false
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

  async loadFeedPosts (viewedProfile, opts = {}) {
    var query = {
      fetchAuthor: true,
      countVotes: true,
      reverse: true,
      rootPostsOnly: false,
      countReplies: true,
      limit: 20,
      before: opts.before || 0
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
        p.threadParentPost = await this.libfritter.feed.getPost(p.threadParent)
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
    const indicatorEl = document.querySelector('.show-posts-btn.new-posts')
    if (!indicatorEl) return

    var query = {
      limit: 1,
      reverse: true,
      rootPostsOnly: false,
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
        yo`<div class="show-posts-btn new-posts" onclick=${reloadFeed}>New posts</div>`
      )
    }
  }

  async loadMorePosts () {
    this.isLoadingPosts = true
    this.render()

    this.posts = this.posts || []
    // using the timestamp as the cursor means there's a small chance that a
    // post will be excluded if two posts have the same timestamp AND the limit
    // falls on the first post
    let before = 0
    if (this.posts.length) {
      before = this.posts[this.posts.length - 1].createdAt
    }

    await this.runInnerLoad(async (apply) => {
      const newPosts = await this.loadFeedPosts(this.viewedProfile, {before})
      this.isLoadingPosts = false
      apply({posts: this.posts.concat(newPosts)})
    })
    this.render()
  }

  async loadNotifications () {
    // using the timestamp as the cursor means there's a small chance that
    // a notification will be excluded if two notifications have the same
    // timestamp
    let before = 0
    if (this.notifications && this.notifications.length) {
      before = this.notifications[this.notifications.length - 1].createdAt
    }

    let notifications = await this.libfritter.notifications.listNotifications({
      reverse: true,
      fetchAuthor: true,
      fetchPost: true,
      limit: 15,
      before
    })
    return notifications
  }

  async loadMoreNotifications () {
    this.notifications = this.notifications || []
    await this.runInnerLoad(async (apply) => {
      const newNotifications = await this.loadNotifications()
      apply({notifications: this.notifications.concat(newNotifications)})
    })
    this.render()
  }

  async checkForNotifications () {
    const oldCount = this.unreadNotifications
    const after = (+window.localStorage.notificationsLastReadTS)
    this.unreadNotifications = await this.libfritter.notifications.countNotifications({after})
    if (oldCount !== this.unreadNotifications) {
      document.title = `Fritter - Notifications (${this.unreadNotifications})`
      this.render()
    }
  }

  isAllowedImage (url) {
    const imageSetting = this.settings.imageEmbed || 'none'

    // no images allowed
    if( imageSetting === 'none' ){
      return false
    }

    // all images allowed
    if( imageSetting === 'all' ){
      return true
    }

    // only dats allowed
    if( imageSetting === 'dat' ){
      return url.startsWith('dat://')
    }

    // only followed dats allowed
    if( imageSetting === 'dat-followed' ){
      const targetUser = getURLOrigin(url)
      return url.startsWith('dat://') && this.currentUserProfile.follows.filter(user => user.url == targetUser).length
    }

    // default false
    return false
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
      hover: Object.assign({}, themeColor, {l: 99}),
      primaryBtnHover: Object.assign({}, themeColor, {l: themeColor.l - 6})
    }
  }

  updateSettings (settings = {}) {
    this.settings = Object.assign(this.settings, settings)
    window.localStorage.settings = JSON.stringify(this.settings)
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
      this.tmpAvatar = this.tmpAvatar || {imgData: defaultAvatarBase64Png, imgExtension: 'png'}
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
    if (this.currentUserProfile && this.currentUser) {
      whoToFollowSeedUrls.forEach(url => {
        if (this.currentUserProfile.followUrls.indexOf(url) === -1 && url !== this.currentUser.url) {
          whoToFollowUrls.add(url)
        }
      })
    } else {
      whoToFollowSeedUrls.forEach(url => {
        whoToFollowUrls.add(url)
      })
    }

    // randomize order and apply limit
    whoToFollowUrls = Array.from(whoToFollowUrls).sort(() => Math.random() - 0.5).slice(0, MAX_WHO_TO_FOLLOWS)

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
    return vote
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
    const threadUrl = post.getRecordURL ? post.getRecordURL() : post
    return '/thread/' + threadUrl
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

  copyProfileUrl () {
    var profileUrl = document.getElementById('profile-url')
    profileUrl.select()
    document.execCommand('copy')
  }
}
