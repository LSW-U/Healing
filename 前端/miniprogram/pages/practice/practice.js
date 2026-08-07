Page({
  data: {
    breathPattern: { inhale: 4, hold_in: 7, exhale: 8, hold_out: 0, name: '4-7-8 助眠呼吸' }
  },
  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },
  onBreath () {
    wx.navigateTo({ url: '/pages/breathing/breathing' })
  },
  onMeditate () {
    wx.showToast({ title: '冥想练习（二期实现）', icon: 'none' })
  },
  onSound () {
    wx.showToast({ title: '声音疗愈（二期实现）', icon: 'none' })
  },
  onSleep () {
    wx.showToast({ title: '助眠模式（二期实现）', icon: 'none' })
  }
})
