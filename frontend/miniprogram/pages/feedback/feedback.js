const { request } = require('../../utils/request')
const { api } = require('../../utils/api')

Page({
  data: {
    exerciseName: '晨间苏醒',
    duration: '8 分钟',
    moodIndex: 2,
    moods: ['起 伏', '沉 静', '微 光', '澄 澈', '温 暖'],
    note: '',
    done: false,
    doneCid: ''
  },

  onLoad (options) {
    const s = parseInt(options.s || '0') || 0  // 防止 NaN 显示 "NaN 分 NaN 秒"
    this._cid = options.cid || ''  // 练习内容 id（breathing 传入；缺省兜底 1）
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
    // 返回 breathing（breathing 用 navigateTo 进来），不再 redirectTo 清栈
    wx.navigateBack()
  },

  // 记下此刻感受 → 感受编辑器（cid 透传）
  onFeel () {
    wx.navigateTo({ url: '/subpackages/phase3/feeling-editor/feeling-editor?cid=' + (this.data.doneCid || '') })
  },

  onDone () {
    const { moodIndex, moods, note } = this.data
    const cid = parseInt(this._cid) || 1
    request(api.checkins, {
      method: 'POST',
      data: { content_id: cid, mood: moods[moodIndex], note }
    }).then(() => {
      // 成功后展示「记下此刻感受」入口（不自动跳走，用户可自行选择）
      this.setData({ done: true, doneCid: cid })
      wx.showToast({ title: '已记下', icon: 'none' })
    }).catch((err) => {
      // 失败停留 + 提示，不再假装成功跳走
      wx.showToast({ title: (err && err.message) || '提交失败，请重试', icon: 'none' })
    })
  }
})
