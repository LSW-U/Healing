const { request } = require('../../utils/request')
const { api } = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    greeting: '下午好，',
    highlight: '潮汐将至',
    suffix: '留 5 分钟给自己',
    recommend: { title: '晨间苏醒 ·\n跟随海的呼吸', duration: '8 分钟', typeName: '冥想引导', id: null },
    columns: [],
    contents: [],
    apiFailed: false
  },

  onLoad () {
    this.setData({ greeting: util.getGreetingTime() })
    // 1. 先用静态数据确保页面立即可见
    this.setStaticData()
    // 2. 再异步尝试 API，成功则覆盖
    this.loadFromApi()
  },

  onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  setStaticData () {
    this.setData({
      columns: [
        { id: 1, title: '二十四节气疗愈', subtitle: '立秋 · 凉风至', bg: 'linear-gradient(135deg,#C9B59A,#8a7558)' },
        { id: 2, title: '深夜电台', subtitle: '睡前陪伴 · 更至第 12 期', bg: 'linear-gradient(135deg,#3F5E5A,#2B3A42)' },
        { id: 3, title: '东方器物', subtitle: '颂钵 · 古琴 · 手碟', bg: 'linear-gradient(135deg,#5B7B8A,#3F5E5A)' }
      ],
      contents: [
        { id: 1, title: '冥想初级 · 呼吸锚定', duration: '10分钟', typeName: '冥想引导', bg: 'linear-gradient(135deg,#9CB0B8,#5B7B8A)' },
        { id: 2, title: '颂钵深度放松', duration: '20分钟', typeName: '声音疗愈', bg: 'linear-gradient(135deg,#C9B59A,#8a7558)' },
        { id: 3, title: '4-7-8 助眠引导', duration: '8分钟', typeName: '助眠', bg: 'linear-gradient(135deg,#3F5E5A,#2B3A42)' },
        { id: 4, title: '晨间唤醒冥想', duration: '10分钟', typeName: '冥想引导', bg: 'linear-gradient(135deg,#5B7B8A,#4A6B7A)' },
        { id: 5, title: '雨声白噪音', duration: '30分钟', typeName: '自然声', bg: 'linear-gradient(135deg,#7A9A8A,#3F5E5A)' }
      ]
    })
  },

  loadFromApi () {
    Promise.all([
      request(api.columns, { auth: false }).catch(() => null),
      request(api.contents + '?sort=hot', { auth: false }).catch(() => null),
      request(api.recommendToday, { auth: false }).catch(() => null)
    ]).then(([cols, contents, rec]) => {
      // 三接口全挂：温和提示（静态数据仍显示，不阻塞）
      if (!cols && !contents && !rec) {
        this.setData({ apiFailed: true })
        return
      }
      this.setData({ apiFailed: false })
      // 后端 recommendToday 返回 { hero, list }，取 hero 作今日推荐
      if (rec && rec.hero) {
        this.setData({
          recommend: {
            title: rec.hero.title || '今日共时推荐',
            duration: util.formatDuration(rec.hero.duration || 480),
            typeName: typeLabel(rec.hero.type),
            id: rec.hero.id
          }
        })
      }
      if (cols && cols.length) this.setData({ columns: cols.map(c => ({ ...c, bg: gradBg(c.id) })) })
      if (contents && contents.length) this.setData({ contents: contents.map(c => ({ ...c, bg: gradBg(c.id), duration: util.formatDuration(c.duration), typeName: typeLabel(c.type) })) })
    }).catch(() => {})
  },

  onSearch () {
    wx.navigateTo({ url: '/subpackages/phase3/search/search' })
  },

  onHeroTap () {
    const id = this.data.recommend.id
    if (!id) {
      // API 还没回来，避免跳到错误的 id=1
      wx.showToast({ title: '推荐内容加载中', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/content-detail/content-detail?id=' + id })
  },

  onColumnTap (e) {
    wx.showToast({ title: '专栏详情（二期实现）', icon: 'none' })
  },

  onColumnsMore () {
    wx.switchTab({ url: '/pages/practice/practice' })
  },

  onContentTap (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/content-detail/content-detail?id=' + id })
  },

  onShareAppMessage () {
    return { title: '共时海 · 潮起潮落，你都在' }
  }
})

function typeLabel (type) {
  const map = { meditation: '冥想引导', breathing: '呼吸练习', sound: '声音疗愈', sleep: '助眠', music: '音乐' }
  return map[type] || '疗愈内容'
}

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
