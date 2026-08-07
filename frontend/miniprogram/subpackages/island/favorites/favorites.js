const { request } = require('../../../utils/request')
const { api } = require('../../../utils/api')

Page({
  data: {
    cats: ['内 容', '疗 愈 师', '课 程'],
    catIdx: 0,
    groups: [
      {
        name: '睡 前',
        items: [
          { id: 1, title: '海 的 呼 吸', subtitle: '颂钵引导 · 8 分钟', type: '内容', bg: 'linear-gradient(135deg,#5B7B8A,#3F5E5A)' },
          { id: 2, title: '深夜电台·第12期', subtitle: '人声引导 · 12 分钟', type: '内容', bg: 'linear-gradient(135deg,#3F5E5A,#2B3A42)' }
        ]
      },
      {
        name: '通 勤',
        items: [
          { id: 3, title: '雨声·檐下的午后', subtitle: '自然声 · 30 分钟', type: '内容', bg: 'linear-gradient(135deg,#C9B59A,#8a7558)' }
        ]
      }
    ],
    filtered: []
  },

  onLoad () {
    this.applyFilter()
    this.loadFromApi()
  },

  loadFromApi () {
    request(api.favorites, { auth: true }).then((list) => {
      if (list && list.length) {
        // 后端返回扁平列表，按类型聚合成「我的收藏」单组
        this.setData({
          groups: [{
            name: '我 的 收 藏',
            items: list.map(f => ({
              id: f.id,
              title: f.title || '',
              subtitle: f.subtitle || '',
              type: (f.type || '内容').replace(/ /g, ''),
              bg: 'linear-gradient(135deg,#5B7B8A,#3F5E5A)'
            }))
          }]
        })
        this.applyFilter()
      }
    }).catch(() => {})
  },

  // 按 catIdx 过滤（catIdx=0 全部；其余按 cats[catIdx] 去空格后包含 type 即命中）
  // 保留时段分组结构：每个分组只保留命中 item
  applyFilter () {
    const { catIdx, cats, groups } = this.data
    const cat = cats[catIdx].replace(/ /g, '')
    const filtered = catIdx === 0
      ? groups
      : groups.map(g => ({
          name: g.name,
          items: (g.items || []).filter(it => (it.type || '').replace(/ /g, '').indexOf(cat) > -1)
        }))
    const hasItems = filtered.some(g => (g.items || []).length > 0)
    this.setData({ filtered, hasItems })
  },

  onCat (e) {
    this.setData({ catIdx: parseInt(e.currentTarget.dataset.idx) })
    this.applyFilter()
  },

  onItem (e) {
    wx.navigateTo({ url: '/pages/content-detail/content-detail?id=' + e.currentTarget.dataset.id })
  }
})
