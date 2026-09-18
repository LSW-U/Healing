// 危机援助浮层（全局组件）：打开时拉取 GET /api/crisis 渲染热线列表
// 顶部固定 120/110 紧急入口，底部固定合规声明（04-D1/D3/D15）
const { request } = require('../../utils/request')
const { api } = require('../../utils/api')

Component({
  properties: {
    show: { type: Boolean, value: false }
  },
  data: {
    loading: false,
    error: '',
    list: []
  },
  observers: {
    show (v) {
      if (v) this.fetchList()
    }
  },
  methods: {
    fetchList () {
      this.setData({ loading: true, error: '' })
      request(api.crisis, { method: 'GET', auth: false }).then((list) => {
        this.setData({ loading: false, list: list || [] })
      }).catch((err) => {
        this.setData({ loading: false, error: (err && err.message) || '加载失败，请稍后再试' })
      })
    },
    // 每条热线（含 120/110）点击拨号；真机弹拨号盘
    onCall (e) {
      const phone = e.currentTarget.dataset.phone
      if (!phone) return
      wx.makePhoneCall({ phoneNumber: phone })
    },
    close () { this.triggerEvent('close') },
    onMask () { this.close() }
  }
})
