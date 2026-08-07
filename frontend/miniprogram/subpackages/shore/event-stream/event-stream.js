const { request } = require('../../../utils/request')
const { api } = require('../../../utils/api')

Page({
  data: {
    cats: ['全 部', '节 气 茶 会', '颂 钵 沙 龙', '正 念 徒 步', '艺 术 疗 愈'],
    catIdx: 0,
    leftCol: [],
    rightCol: []
  },

  onLoad () {
    this._all = [
      { id: 1, tag: '节 气 茶 会', title: '立 秋 · 凉 风 至 茶 会', date: '8.7 周五 19:30', location: '共时海工作室', total: 12, remaining: 2, bg: 'linear-gradient(135deg,#C9B59A 0%,#5B7B8A 100%)' },
      { id: 2, tag: '月 相 共 修', title: '新 月 · 静 默 共 修', date: '8.14 周四 21:00', location: '线上 · 腾讯会议', total: 20, remaining: 8, bg: '#3F5E5A' },
      { id: 3, tag: '艺 术 疗 愈', title: '色 彩 与 情 绪 · 表 达 性 绘 画', date: '8.15 周日 14:00', location: '共时海工作室', total: 15, remaining: 6, bg: 'linear-gradient(135deg,#3F5E5A 0%,#2B3A42 100%)' },
      { id: 4, tag: '颂 钵 沙 龙', title: '深 夜 颂 钵 · 放 松 与 沉 浸', date: '8.22 周五 20:00', location: '共时海工作室', total: 10, remaining: 3, bg: 'linear-gradient(135deg,#5B7B8A,#4A6B7A)' },
      { id: 5, tag: '正 念 徒 步', title: '城 市 潮 汐 · 午 间 正 念 行 走', date: '8.20 周三 12:00', location: '锦城湖公园', total: 20, remaining: 15, bg: 'linear-gradient(135deg,#8a7558,#C9B59A)' }
    ]
    this.applyFilter()
    this.loadFromApi()
  },

  loadFromApi () {
    request(api.events, { auth: false }).then((list) => {
      if (list && list.length) {
        this._all = list.map(e => ({
          id: e.id,
          tag: e.category || e.type || '',
          title: e.title || '',
          date: e.start_time || '',
          location: e.location || '',
          total: e.capacity || 0,
          remaining: e.remaining || 0,
          bg: 'linear-gradient(135deg,#5B7B8A,#3F5E5A)'
        }))
        this.applyFilter()
      }
    }).catch(() => {})
  },

  // 按 catIdx 过滤后重新分左右两列
  applyFilter () {
    const { catIdx, cats } = this.data
    const cat = cats[catIdx].replace(/ /g, '')
    const filtered = catIdx === 0 ? this._all : this._all.filter(e => (e.tag || '').replace(/ /g, '').indexOf(cat) > -1)
    this.setData({
      leftCol: filtered.filter((_, i) => i % 2 === 0),
      rightCol: filtered.filter((_, i) => i % 2 === 1)
    })
  },

  onCat (e) {
    this.setData({ catIdx: parseInt(e.currentTarget.dataset.idx) })
    this.applyFilter()
  },

  onEvent (e) {
    wx.navigateTo({ url: '/subpackages/shore/event-detail/event-detail?id=' + e.currentTarget.dataset.id })
  }
})
