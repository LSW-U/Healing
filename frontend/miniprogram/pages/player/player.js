const { request } = require('../../utils/request')
const { api } = require('../../utils/api')

Page({
  data: {
    content: { title: '海的呼吸', subtitle: '颂钵引导 · 8 分钟 · 助眠' },
    playing: false,
    progress: 0,
    currentText: '00:00',
    durationText: '08:00',
    duration: 480
  },

  onLoad (options) {
    const id = options.id
    if (!id) {
      wx.showToast({ title: '内容不存在', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    this._contentId = id
    this._bg = wx.getBackgroundAudioManager()
    this._bindAudio()
    this.loadAudio(id)
  },

  // 监听一次性注册（避免累积），状态同步走 onPlay/onPause 回调而非本地推算
  _bindAudio () {
    const bg = this._bg
    const app = getApp()
    const sync = (playing) => {
      this.setData({ playing })
      app.globalData.player.playing = playing
      app.notifyPlayer()
    }
    this._onPlay = () => sync(true)
    this._onPause = () => sync(false)
    this._onEnded = () => { this.setData({ progress: 100 }); sync(false) }
    this._lastUpdate = 0
    this._onTimeUpdate = () => {
      const now = Date.now()
      if (now - this._lastUpdate < 1000) return  // 节流到 1s，避免 setData 风暴
      this._lastUpdate = now
      const pct = bg.duration > 0 ? (bg.currentTime / bg.duration * 100) : 0
      this.setData({
        progress: pct,
        currentText: formatTime(Math.floor(bg.currentTime))
      })
    }
    bg.onPlay(this._onPlay)
    bg.onPause(this._onPause)
    bg.onEnded(this._onEnded)
    bg.onTimeUpdate(this._onTimeUpdate)
  },

  loadAudio (id) {
    request(api.contentDetail(id), { auth: false }).then((data) => {
      this.setData({
        content: {
          title: data.title || '海的呼吸',
          subtitle: (data.subtitle || '颂钵引导') + ' · ' + (data.duration ? Math.floor(data.duration / 60) + ' 分钟' : '8 分钟')
        },
        duration: data.duration || 480,
        durationText: formatTime(data.duration || 480)
      })
      if (data.audio_url) this.playAudio(data.audio_url, data.title)
    }).catch(() => {
      this.setData({ durationText: '08:00', duration: 480 })
    })
  },

  playAudio (url, title) {
    const bg = this._bg
    const t = title || '共时海'
    // title 必须先于 src 赋值，否则 iOS 报 "title is required" 并停止播放
    bg.title = t
    bg.src = url
    // 同步全局播放浮窗
    const app = getApp()
    app.globalData.player = { show: true, title: t, playing: true, contentId: this._contentId }
    app.notifyPlayer()
  },

  onToggle () {
    const bg = this._bg
    // 不本地推算，等 onPlay/onPause 回调同步，避免竞态
    if (bg.paused) bg.play(); else bg.pause()
  },

  onBack () { wx.navigateBack() },
  onMore () {},
  onPrev () { wx.showToast({ title: '上一段', icon: 'none' }) },
  onRewind () { wx.showToast({ title: '快退', icon: 'none' }) },
  onForward () { wx.showToast({ title: '快进', icon: 'none' }) },
  onLoop () { wx.showToast({ title: '循环模式', icon: 'none' }) },
  onTimer () { wx.showToast({ title: '定时关闭·30分钟', icon: 'none' }) },
  onFav () { wx.showToast({ title: '已收藏', icon: 'none' }) },
  onSections () { wx.showToast({ title: '分段跳转', icon: 'none' }) },
  onProgressStart () {},
  onProgressMove () {},
  onProgressEnd () {},

  onShareAppMessage () {
    return {
      title: '共时海 · ' + (this.data.content.title || ''),
      path: '/pages/player/player?id=' + this._contentId
    }
  },

  onUnload () {
    // off 监听避免累积；不 stop()——保留后台播放（锁屏续播）
    const bg = this._bg
    if (bg) {
      bg.offPlay && bg.offPlay(this._onPlay)
      bg.offPause && bg.offPause(this._onPause)
      bg.offEnded && bg.offEnded(this._onEnded)
      bg.offTimeUpdate && bg.offTimeUpdate(this._onTimeUpdate)
    }
  }
})

function formatTime (s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
}
