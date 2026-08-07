Page({
  data: { event: {} },
  onLoad (options) {
    const id = parseInt(options.id) || 1
    const all = [
      { id:1, symbol:'茶', title:'立 秋 · 凉 风 至 茶 会', guide:'一盏秋茶，等你来。', time:'8.7 周五 19:30—21:00', location:'共时海工作室', total:12, remaining:2, fee:'免费 · 公益', description:['立秋之夜，我们在共时海设一盏茶席。不设议程，不讲道理，就喝茶，就呼吸，就让秋天的第一缕凉意从杯沿落到心里。','适合所有愿意慢下来的人。着装舒适即可。'], refund:'报名后如需取消，请提前 24 小时告知。名额有限，请确认后再提交。' },
      { id:2, symbol:'月', title:'新 月 · 静 默 共 修', guide:'新月初生，是开始的时候。', time:'8.14 周四 21:00—21:45', location:'线上 · 腾讯会议', total:20, remaining:8, fee:'免费 · 公益', description:['新月之夜，我们静默共修。关掉灯光，只留呼吸的声音。'], refund:'线上活动，报名后索取会议链接。' },
    ]
    this.setData({ event: all.find(e => e.id === id) || all[0] })
  },
  onSignup () {
    wx.navigateTo({ url: '/subpackages/shore/signup-success/signup-success?id=' + (this.data.event.id || 1) })
  }
})
