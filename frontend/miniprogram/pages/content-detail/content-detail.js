const { request } = require('../../utils/request')
const { api } = require('../../utils/api')

Page({
  data: {
    content: {},
    related: []
  },

  onLoad (options) {
    const { id } = options
    this.loadDetail(id)
  },

  loadDetail (id) {
    // 内容详情
    request(api.contentDetail(id), { auth: false }).then((data) => {
      this.setData({
        content: {
          id: data.id,
          title: data.title || '海的呼吸',
          subtitle: (data.subtitle || '颂钵引导') + ' · ' + (data.duration ? Math.floor(data.duration / 60) + ' 分钟' : '8 分钟'),
          healerId: data.healer_id,
          healerName: '疗愈师',   // 默认通用文案，下面拉 healer 详情覆盖（不再硬编码"林一沐"）
          healerRole: '',
          healerBg: 'linear-gradient(135deg,#C9B59A,#8a7558)',
          tags: (data.scene_tags && data.scene_tags.length) ? data.scene_tags : ['疗愈'],
          description: data.description ? [data.description] : ['跟随引导，让呼吸慢下来。']
        }
      })
      // 如有疗愈师，拉详情拿名字
      if (data.healer_id) {
        request(api.healerDetail(data.healer_id), { auth: false }).then((h) => {
          this.setData({
            'content.healerName': h.name || '疗愈师',
            'content.healerRole': h.title || ''
          })
        }).catch(() => {})
      }
    }).catch(() => {
      this.setData({
        content: {
          id: id || 1,
          title: '海的呼吸',
          subtitle: '颂钵引导 · 8 分钟',
          healerName: '疗愈师',
          healerBg: 'linear-gradient(135deg,#C9B59A,#8a7558)',
          tags: ['颂钵', '助眠'],
          description: ['内容暂不可用，请稍后再试']
        }
      })
    })

    // 相关推荐：从内容列表拿同类（替代硬编码 2 条）
    request(api.contents, { auth: false }).then((list) => {
      if (list && list.length) {
        const related = list.filter(c => c.id != id).slice(0, 3).map(c => ({
          id: c.id,
          title: c.title,
          subtitle: (c.subtitle || '疗愈内容') + ' · ' + Math.floor((c.duration || 480) / 60) + ' 分钟',
          bg: gradBg(c.id)
        }))
        this.setData({ related })
      }
    }).catch(() => {
      // 后端未连：兜底 2 条静态
      this.setData({
        related: [
          { id: 2, title: '深夜电台 · 第 12 期', subtitle: '人声引导 · 12 分钟', bg: 'linear-gradient(135deg,#3F5E5A,#2B3A42)' },
          { id: 3, title: '雨声 · 檐下的午后', subtitle: '自然声 · 30 分钟', bg: 'linear-gradient(135deg,#C9B59A,#8a7558)' }
        ]
      })
    })
  },

  onHealer () {
    const hid = this.data.content.healerId
    if (hid) wx.navigateTo({ url: '/subpackages/shore/healer-detail/healer-detail?id=' + hid })
    else wx.showToast({ title: '疗愈师详情（二期实现）', icon: 'none' })
  },

  onFav () {
    wx.showToast({ title: '已收藏', icon: 'none' })
  },

  onTimer () {
    wx.showToast({ title: '定时关闭（二期实现）', icon: 'none' })
  },

  onShare () {
    wx.showToast({ title: '点右上角分享', icon: 'none' })
  },

  onPlay () {
    const id = this.data.content.id || 1
    wx.navigateTo({ url: '/pages/player/player?id=' + id })
  },

  onRelated (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/content-detail/content-detail?id=' + id })
  },

  onShareAppMessage () {
    return {
      title: this.data.content.title || '共时海 · 海的呼吸',
      path: '/pages/content-detail/content-detail?id=' + (this.data.content.id || '')
    }
  }
})

function gradBg (id) {
  const colors = [
    'linear-gradient(135deg,#9CB0B8,#5B7B8A)',
    'linear-gradient(135deg,#C9B59A,#8a7558)',
    'linear-gradient(135deg,#3F5E5A,#2B3A42)',
    'linear-gradient(135deg,#5B7B8A,#4A6B7A)',
    'linear-gradient(135deg,#7A9A8A,#3F5E5A)'
  ]
  return colors[(id || 0) % colors.length]
}
