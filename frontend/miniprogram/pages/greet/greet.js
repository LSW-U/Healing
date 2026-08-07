const { request } = require('../../utils/request')
const { api } = require('../../utils/api')

Page({
  data: {
    greeting: {}
  },

  onLoad() {
    // 拉取启动问候（节气 + 每日一语）
    request(api.dailyGreeting, { auth: false })
      .then((data) => this.setData({ greeting: data }))
      .catch(() => {})
  },

  // 进入共时海 → 切换到「潮」Tab
  enter() {
    wx.switchTab({ url: '/pages/discover/discover' })
  }
})
