Page({
  onCopy () { wx.showToast({ title: '公众号名称已复制', icon: 'none' }) },
  // 危机援助浮层（号码来自 GET /api/crisis，不再写死）
  onCrisis () { this.setData({ crisisShow: true }) },
  onCrisisClose () { this.setData({ crisisShow: false }) }
})