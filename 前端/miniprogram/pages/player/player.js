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
    const id = options.id || 1
    this.loadAudio(id)
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
      this.setData({
        durationText: '08:00',
        duration: 480
      })
    })
  },

  playAudio (url, title) {
    const bg = wx.getBackgroundAudioManager()
    bg.title = title || '共时海'
    bg.src = url
    bg.onTimeUpdate(() => {
      const pct = bg.duration > 0 ? (bg.currentTime / bg.duration * 100) : 0
      this.setData({
        progress: pct,
        currentText: formatTime(Math.floor(bg.currentTime)),
        playing: !bg.paused
      })
    })
    bg.onEnded(() => {
      this.setData({ progress: 100, playing: false })
    })
  },

  onToggle () {
    const bg = wx.getBackgroundAudioManager()
    if (this.data.playing) { bg.pause() } else { bg.play() }
    this.setData({ playing: !this.data.playing })
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
    return { title: '共时海 · ' + (this.data.content.title || '') }
  }
})

function formatTime (s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
}
