// 我的报名：GET /api/signups 全量渲染（方案 05 批 2）
const { request } = require('../../../utils/request')
const api = require('../../../utils/api')
const { formatEventDate } = require('../../../utils/util')

// 状态映射：paid→已报名 / cancelled→已取消 / pending→待支付 / refunded→已退款
const STATUS_TEXT = { paid: '已报名', cancelled: '已取消', pending: '待支付', refunded: '已退款' }

Page({
  data: { orders: [], loading: true },
  onShow () { this.load() },
  load () {
    request(api.signups)
      .then((rows) => {
        const orders = (rows || []).map((r) => ({
          id: r.id,
          title: r.title || '',
          date: r.start_time ? formatEventDate(r.start_time) : '',
          location: r.location || '',
          // 按 amount 判价（接口无 fee 字段）：amount=0/缺省 → 免费·公益；否则 amount/100 元
          price: (r.amount === 0 || r.amount == null) ? '免费 · 公益'
            : '¥' + (r.amount / 100).toFixed(2),
          status: r.status,
          statusText: STATUS_TEXT[r.status] || r.status,
          // 仅 paid 且活动未开始（event_status 非 ongoing/ended/cancelled）可取消
          canCancel: r.status === 'paid' &&
            !['ongoing', 'ended', 'cancelled'].includes(r.event_status),
        }))
        this.setData({ orders, loading: false })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: (err && err.message) || '加载失败，请稍后再试', icon: 'none' })
      })
  },
  // 取消报名：二次确认 → POST signupCancel → 成功刷新列表
  onCancel (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '取消报名',
      content: '确定取消本次报名吗？名额将释放给其他同修。',
      confirmText: '取消报名',
      cancelText: '再想想',
      success: (res) => {
        if (!res.confirm) return
        request(api.signupCancel(id), { method: 'POST' })
          .then(() => {
            wx.showToast({ title: '已取消报名', icon: 'success' })
            this.load()
          })
          .catch((err) => wx.showToast({ title: (err && err.message) || '取消失败，请稍后再试', icon: 'none' }))
      },
    })
  },
  onGoStream () { wx.navigateTo({ url: '/subpackages/shore/event-stream/event-stream' }) },
})
