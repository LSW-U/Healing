Page({
  data: { event: { title:'立秋 · 凉风至茶会', time:'8.7 周五 19:30—21:00', location:'共时海工作室' } },
  onCalendar () { wx.showToast({ title: '已加入日历（模拟）', icon: 'none' }) },
  onView () { wx.switchTab({ url: '/pages/me/me' }) },
  onBack () { wx.switchTab({ url: '/pages/discover/discover' }) }
})
