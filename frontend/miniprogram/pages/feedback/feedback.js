const { request } = require('../../utils/request')
const { api } = require('../../utils/api')

Page({
  data: {
    exerciseName: '晨间苏醒',
    duration: '8 分钟',
    moodIndex: 2,
    moods: ['起 伏', '沉 静', '微 光', '澄 澈', '温 暖'],
    note: ''
  },

  onLoad (options) {
    const s = parseInt(options.s || '0')
    this.setData({ duration: Math.floor(s / 60) + ' 分 ' + (s % 60) + ' 秒' })
  },

  onMood (e) {
    this.setData({ moodIndex: parseInt(e.currentTarget.dataset.idx) })
  },

  onNoteInput (e) {
    this.setData({ note: e.detail.value })
  },

  onInputFocus () {},

  onAgain () {
    wx.redirectTo({ url: '/pages/breathing/breathing' })
  },

  onDone () {
    const { moodIndex, moods, note } = this.data
    // 提交打卡
    request(api.checkins, {
      method: 'POST',
      data: { content_id: 1, mood: moods[moodIndex], note }
    }).then(() => {
      wx.showToast({ title: '已记下', icon: 'none' })
      setTimeout(() => { wx.switchTab({ url: '/pages/discover/discover' }) }, 800)
    }).catch(() => {
      wx.showToast({ title: '已记下（离线）', icon: 'none' })
      setTimeout(() => { wx.switchTab({ url: '/pages/discover/discover' }) }, 800)
    })
  }
})
