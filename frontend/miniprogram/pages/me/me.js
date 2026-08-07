Page({
  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
  },
  onStats () { wx.navigateTo({ url: '/subpackages/island/tide-checkin/tide-checkin' }) },
  onJournal () { wx.navigateTo({ url: '/subpackages/island/journal/journal' }) },
  onFavorites () { wx.navigateTo({ url: '/subpackages/island/favorites/favorites' }) },
  onReminders () { wx.navigateTo({ url: '/subpackages/island/reminders/reminders' }) },
  onOrders () { wx.navigateTo({ url: '/subpackages/island/orders/orders' }) },
  onSettings () { wx.navigateTo({ url: '/subpackages/island/settings/settings' }) },
  onAbout () { wx.navigateTo({ url: '/subpackages/island/about/about' }) }
})
