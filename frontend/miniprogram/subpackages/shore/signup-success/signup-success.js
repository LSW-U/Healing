// 报名成功：接收 event-detail 传参（eventId/name/date/location）真实渲染（方案 05 批 2）
const { formatEventDate } = require('../../../utils/util')

Page({
  data: { event: { title: '', time: '', location: '' } },
  onLoad (options) {
    const title = '报名成功 · ' + (options.eventId ? '活动 #' + options.eventId : '')
    // 有 eventId 时拉活动名；拿不到就用传参兜底渲染（不写死）
    const time = options.date ? formatEventDate(decodeURIComponent(options.date)) : ''
    const location = options.location ? decodeURIComponent(options.location) : ''
    let data = { event: { title, time, location } }
    this.setData(data)
    if (options.eventId) {
      const { request } = require('../../../utils/request')
      const api = require('../../../utils/api')
      request(api.eventDetail(parseInt(options.eventId)), { auth: false })
        .then((ev) => {
          this.setData({
            event: {
              title: ev.title || title,
              time: ev.start_time ? formatEventDate(ev.start_time) : time,
              location: ev.location || location,
              start_time: ev.start_time || '',
            },
          })
        })
        .catch(() => {}) // 详情拉不到时保留传参渲染
    }
  },
  // 加入日历：wx.addPhoneCalendar，失败降级 toast 可重试，不阻断
  onCalendar () {
    const ev = this.data.event
    const start = ev.start_time || ''
    // start 为空时直接走失败文案，不调 addPhoneCalendar（防写入 1970 时间戳）
    const startTime = start ? Math.floor(new Date(start.replace(' ', 'T')).getTime() / 1000) : 0
    if (!startTime) {
      wx.showToast({ title: '未能加入日历，可手动记下活动时间', icon: 'none' })
      return
    }
    wx.addPhoneCalendar({
      title: ev.title || '共时海活动',
      startTime,
      location: ev.location || '',
      success: () => wx.showToast({ title: '已加入日历', icon: 'success' }),
      fail: () => wx.showToast({ title: '未能加入日历，可手动记下活动时间', icon: 'none' }),
    })
  },
  onView () { wx.switchTab({ url: '/pages/me/me' }) },
  onBack () { wx.switchTab({ url: '/pages/discover/discover' }) }
})
