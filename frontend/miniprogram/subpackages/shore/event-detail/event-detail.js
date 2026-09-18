// 活动详情：优先取线上 /api/events/:id（批3c），失败回退内置示例（原型兜底）
const { request } = require('../../../utils/request')
const api = require('../../../utils/api')

Page({
  data: { event: {}, hasLocation: false },
  onLoad (options) {
    const id = parseInt(options.id) || 1
    request(api.eventDetail(id), { auth: false })
      .then((ev) => this.applyEvent(ev))
      .catch(() => {
        // 线上数据不可达时回退内置示例，保持页面可用
        const all = [
          { id:1, symbol:'茶', title:'立 秋 · 凉 风 至 茶 会', guide:'一盏秋茶，等你来。', time:'8.7 周五 19:30—21:00', location:'共时海工作室', total:12, remaining:2, fee:'免费 · 公益', description:['立秋之夜，我们在共时海设一盏茶席。不设议程，不讲道理，就喝茶，就呼吸，就让秋天的第一缕凉意从杯沿落到心里。','适合所有愿意慢下来的人。着装舒适即可。'], refund:'报名后如需取消，请提前 24 小时告知。名额有限，请确认后再提交。' },
          { id:2, symbol:'月', title:'新 月 · 静 默 共 修', guide:'新月初生，是开始的时候。', time:'8.14 周四 21:00—21:45', location:'线上 · 腾讯会议', total:20, remaining:8, fee:'免费 · 公益', description:['新月之夜，我们静默共修。关掉灯光，只留呼吸的声音。'], refund:'线上活动，报名后索取会议链接。' },
        ]
        this.applyEvent(all.find(e => e.id === id) || all[0])
      })
  },
  // 统一映射线上/示例两路数据；hasLocation 决定「查看位置」入口显隐（有经纬度才显示）
  applyEvent (ev) {
    const hasLocation = !!(ev && ev.latitude != null && ev.longitude != null &&
      ev.latitude !== '' && ev.longitude !== '')
    this.setData({
      event: {
        id: ev.id,
        symbol: ev.symbol || ev.title ? (ev.title || '').trim().charAt(0) : '海',
        title: ev.title || '',
        guide: ev.guide_text || ev.guide || '',
        time: (ev.start_time || ev.time || '').replace('T', ' ').slice(0, 16),
        location: ev.location || '',
        total: ev.total_slots != null ? ev.total_slots : ev.total,
        remaining: ev.remaining_slots != null ? ev.remaining_slots : ev.remaining,
        fee: ev.fee === 0 || ev.fee == null ? '免费 · 公益' : '¥' + (ev.fee / 100).toFixed(2),
        description: Array.isArray(ev.description) ? ev.description
          : (ev.description ? String(ev.description).split('\n') : []),
        refund: ev.refund_policy || ev.refund || '',
        latitude: ev.latitude,
        longitude: ev.longitude,
      },
      hasLocation,
    })
  },
  // 查看位置：wx.openLocation 打开内置地图（无新增依赖）
  onOpenLocation () {
    const ev = this.data.event
    if (!this.data.hasLocation) return
    wx.openLocation({
      latitude: Number(ev.latitude),
      longitude: Number(ev.longitude),
      name: ev.location || ev.title,
      address: ev.location || '',
    })
  },
  onSignup () {
    wx.navigateTo({ url: '/subpackages/shore/signup-success/signup-success?id=' + (this.data.event.id || 1) })
  }
})
