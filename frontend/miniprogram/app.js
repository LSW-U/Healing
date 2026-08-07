const { ensureLogin, getToken } = require('./utils/auth')
const { setOnUnauthorized } = require('./utils/request')
const config = require('./config')

App({
  globalData: {
    token: '',
    baseUrl: config.baseUrl,
    env: config.env,
    // 全局播放浮窗状态（player-bar 监听，player 页同步）
    player: { show: false, title: '', playing: false, contentId: null }
  },

  // —— 全局播放浮窗的简单事件机制 ——
  // player 页改状态后调 notifyPlayer()，player-bar 在 attached 里 watchPlayer(fn) 接收
  _playerListener: null,
  watchPlayer (fn) { this._playerListener = fn; fn(this.globalData.player) },
  notifyPlayer () { this._playerListener && this._playerListener(this.globalData.player) },

  onLaunch () {
    // 401 时由 request 静默触发重登（回调注入，避免循环依赖）
    setOnUnauthorized(() => ensureLogin())
    this.globalData.token = getToken()
    // 暴露 loginPromise：需鉴权的页面可 `await getApp().loginPromise` 再发请求
    this.loginPromise = getToken()
      ? Promise.resolve()
      : ensureLogin().then((data) => {
        this.globalData.token = data.token
      }).catch(() => {
        wx.showToast({ title: '登录失败，部分功能可能受限', icon: 'none' })
      })
  }
})
