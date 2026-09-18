// 危机援助浮层（全局组件）：优先用外部注入的 crisis 列表（高危词告警场景，避免二次请求），无注入时拉取 GET /api/crisis
// 顶部固定 120/110 紧急入口，底部固定合规声明（04-D1/D3/D15）
const { request } = require('../../utils/request')
const { api } = require('../../utils/api')

Component({
  properties: {
    show: { type: Boolean, value: false },
    crisis: { type: Array, value: null }  // 可选：外部注入的热线列表
  },
  data: {
    loading: false,
    error: '',
    list: []
  },
  observers: {
    show (v) {
      if (!v) return
      if (this.data.crisis && this.data.crisis.length) {
        this.setData({ loading: false, error: '', list: this.data.crisis })
      } else {
        this.fetchList()
      }
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
