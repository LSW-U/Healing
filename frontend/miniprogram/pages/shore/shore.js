Page({
  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },
  onCircle () { wx.navigateTo({ url: '/subpackages/shore/circle/circle' }) },
  onHealers () { wx.navigateTo({ url: '/subpackages/shore/healer-list/healer-list' }) },
  onCourses () { wx.navigateTo({ url: '/subpackages/shore/course-list/course-list' }) },
  onEvents () { wx.navigateTo({ url: '/subpackages/shore/event-stream/event-stream' }) },
  onAbout () { wx.navigateTo({ url: '/subpackages/island/about/about' }) }
})
