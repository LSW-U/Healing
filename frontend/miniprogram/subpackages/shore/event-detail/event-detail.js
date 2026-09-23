// 活动详情：优先取线上 /api/events/:id（批3c），失败回退内置示例（原型兜底）
const { request } = require('../../../utils/request')
const api = require('../../../utils/api')

Page({
  data: { event: {}, hasLocation: false, fallback: false,
    // 报名半屏弹层（方案 05 批 2）
    showSignup: false, form: { name: '', phone: '' }, agree: false, submitting: false },
  onLoad (options) {
    this.eventId = parseInt(options.id) || 1
    request(api.eventDetail(this.eventId), { auth: false })
      .then((ev) => this.applyEvent(ev))
      .catch(() => {
        // 线上数据不可达时回退内置示例，保持页面可用；兜底态禁止报名
        this.setData({ fallback: true })
        const all = [
          { id:1, symbol:'茶', title:'立 秋 · 凉 风 至 茶 会', guide:'一盏秋茶，等你来。', time:'8.7 周五 19:30—21:00', location:'共时海工作室', total:12, remaining:2, fee:'免费 · 公益', description:['立秋之夜，我们在共时海设一盏茶席。不设议程，不讲道理，就喝茶，就呼吸，就让秋天的第一缕凉意从杯沿落到心里。','适合所有愿意慢下来的人。着装舒适即可。'], refund:'报名后如需取消，请提前 24 小时告知。名额有限，请确认后再提交。' },
          { id:2, symbol:'月', title:'新 月 · 静 默 共 修', guide:'新月初生，是开始的时候。', time:'8.14 周四 21:00—21:45', location:'线上 · 腾讯会议', total:20, remaining:8, fee:'免费 · 公益', description:['新月之夜，我们静默共修。关掉灯光，只留呼吸的声音。'], refund:'线上活动，报名后索取会议链接。' },
        ]
        this.applyEvent({ ...(all.find(e => e.id === id) || all[0]), __fallback: true })
      })
  },
  // 统一映射线上/示例两路数据；hasLocation 决定「查看位置」入口显隐（有经纬度才显示）
  applyEvent (ev) {
    const hasLocation = !!(ev && ev.latitude != null && ev.longitude != null &&
      ev.latitude !== '' && ev.longitude !== '')
    // 报名按钮态：兜底 / 非 open / 满员 → 置灰 + 文案（批3 ③，与批2 表单同源）
    let btn = { disabled: false, text: '立 即 报 名' }
    if (!ev || ev.__fallback) {
      btn = { disabled: true, text: '活 动 信 息 加 载 失 败' }
    } else if (ev.status && ev.status !== 'open') {
      btn = { disabled: true, text: ev.status === 'ended' ? '活 动 已 结 束' : '活 动 已 截 止' }
    } else if (ev.remaining_slots != null && ev.remaining_slots <= 0) {
      btn = { disabled: true, text: '名 额 已 满' }
    }
    this.setData({
      event: {
        id: ev.id,
        symbol: ev.symbol || ev.title ? (ev.title || '').trim().charAt(0) : '海',
        title: ev.title || '',
        guide: ev.guide_text || ev.guide || '',
        start_time: ev.start_time || '',
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
      btn,
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
  // 报名按钮：置灰态（兜底/非open/满员）toast 提示不弹表单；正常态弹半屏表单
  onSignup () {
    if (this.data.btn && this.data.btn.disabled) {
      wx.showToast({ title: '活动信息加载失败，请稍后重试', icon: 'none' })
      return
    }
    this.setData({ showSignup: true, form: { name: '', phone: '' }, agree: false })
  },
  onCloseSignup () { this.setData({ showSignup: false }) },
  noop () {},
  onNameInput (e) { this.setData({ 'form.name': e.detail.value }) },
  onPhoneInput (e) { this.setData({ 'form.phone': e.detail.value }) },
  onToggleAgree () { this.setData({ agree: !this.data.agree }) },
  // 点协议文案弹半屏展示该活动 refund_policy
  onShowPolicy () { this.setData({ showPolicy: true }) },
  onClosePolicy () { this.setData({ showPolicy: false }) },
  // 提交报名：必填+协议校验 → POST api.signup → 成功跳 signup-success，失败 toast 停留
  onSubmitSignup () {
    const { name, phone } = this.data.form
    if (!name) { wx.showToast({ title: '请填写姓名', icon: 'none' }); return }
    if (!phone) { wx.showToast({ title: '请填写手机号', icon: 'none' }); return }
    if (!/^1\d{10}$/.test(phone)) { wx.showToast({ title: '手机号格式不正确', icon: 'none' }); return }
    if (!this.data.agree) { wx.showToast({ title: '请先勾选同意活动安排', icon: 'none' }); return }
    if (this.data.submitting) return
    this.setData({ submitting: true })
    const ev = this.data.event
    request(api.signup(ev.id), { method: 'POST', data: { name, phone } })
      .then(() => {
        this.setData({ showSignup: false, submitting: false })
        const qs = 'eventId=' + ev.id +
          '&name=' + encodeURIComponent(name) +
          '&date=' + encodeURIComponent(ev.start_time || '') +
          '&location=' + encodeURIComponent(ev.location || '')
        wx.navigateTo({ url: '/subpackages/shore/signup-success/signup-success?' + qs })
      })
      .catch((err) => {
        // 名额满/已报名/未登录等业务错误：toast 停留本页，不跳转不登出
        this.setData({ submitting: false })
        wx.showToast({ title: (err && err.message) || '报名失败，请稍后再试', icon: 'none' })
      })
  },
})
