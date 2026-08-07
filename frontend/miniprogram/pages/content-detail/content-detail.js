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
    // 优先拉真实数据
    request(api.contentDetail(id), { auth: false }).then((data) => {
      this.setData({
        content: {
          id: data.id,
          title: data.title || '海的呼吸',
          subtitle: (data.subtitle || '颂钵引导') + ' · ' + (data.duration ? Math.floor(data.duration / 60) + ' 分钟' : '8 分钟'),
          healerName: '林一沐',
          healerRole: '颂钵疗愈师 · 从业 8 年',
          healerBg: 'linear-gradient(135deg,#C9B59A,#8a7558)',
          tags: ['颂钵', '助眠', '8 分钟', '睡前'],
          description: ['跟随颂钵的低频共振，让呼吸慢下来。海的潮汐藏在每一次钵音的起落里，你只需顺着它，一呼一吸。', '适合在睡前或情绪起伏时聆听。建议佩戴耳机，找一个安静的地方。']
        }
      })
    }).catch(() => {
      // 后端未连时使用占位
      this.setData({
        content: {
          id: id || 1,
          title: '海的呼吸',
          subtitle: '颂钵引导 · 8 分钟',
          healerName: '林一沐',
          healerRole: '颂钵疗愈师 · 从业 8 年',
          healerBg: 'linear-gradient(135deg,#C9B59A,#8a7558)',
          tags: ['颂钵', '助眠', '8 分钟', '睡前'],
          description: ['跟随颂钵的低频共振，让呼吸慢下来。海的潮汐藏在每一次钵音的起落里，你只需顺着它，一呼一吸。', '适合在睡前或情绪起伏时聆听。建议佩戴耳机，找一个安静的地方。']
        }
      })
    })

    // 相关推荐
    this.setData({
      related: [
        { id: 2, title: '深夜电台 · 第 12 期', subtitle: '人声引导 · 12 分钟', bg: 'linear-gradient(135deg,#3F5E5A,#2B3A42)' },
        { id: 3, title: '雨声 · 檐下的午后', subtitle: '自然声 · 30 分钟', bg: 'linear-gradient(135deg,#C9B59A,#8a7558)' }
      ]
    })
  },

  onHealer () {
    wx.showToast({ title: '疗愈师详情（二期实现）', icon: 'none' })
  },

  onFav () {
    wx.showToast({ title: '已收藏', icon: 'none' })
  },

  onTimer () {
    wx.showToast({ title: '定时关闭（二期实现）', icon: 'none' })
  },

  onShare () {
    wx.showToast({ title: '分享给朋友', icon: 'none' })
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
    return { title: this.data.content.title || '共时海 · 海的呼吸' }
  }
})
