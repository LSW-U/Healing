// 疗愈日记（接真 GET /api/journals?month=YYYY-MM；长按删除）
const { request } = require('../../utils/request')
const { api } = require('../../utils/api')

const monthNames = ['一 月', '二 月', '三 月', '四 月', '五 月', '六 月', '七 月', '八 月', '九 月', '十 月', '十一月', '十二月']

Page({
  data: {
    viewMode: 'list',
    month: '',
    solarTerms: '',
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    cells: [],
    entries: []
  },

  onLoad () {
    const now = new Date()
    this._y = now.getFullYear()
    this._m = now.getMonth() + 1
    this.loadMonth()
  },

  // 拉当月记录并渲染日历 + 列表
  loadMonth () {
    const ym = `${this._y}-${String(this._m).padStart(2, '0')}`
    this.setData({ month: `${this._y} 年 ${monthNames[this._m - 1]}`, loading: true })
    request(api.journals + '?month=' + ym, { method: 'GET' }).then((list) => {
      const entries = (list || []).map((e) => ({
        id: e.id,
        date: e.date,          // YYYY-MM-DD，展示与标记都用它
        mood: e.mood || '',
        text: e.text || ''
        // weather/rel/moon：接口暂无数据源，不显示
      }))
      this.setData({ entries, loading: false })
      this.buildCal()
    }).catch((err) => {
      this.setData({ loading: false })
      wx.showToast({ title: (err && err.message) || '加载失败', icon: 'none' })
    })
  },

  buildCal () {
    const y = this._y
    const m = this._m
    const days = new Date(y, m, 0).getDate()
    const first = new Date(y, m - 1, 1).getDay()
    const today = new Date()
    const isThisMonth = today.getFullYear() === y && today.getMonth() + 1 === m
    const todayDate = today.getDate()
    // hasDays 由当月真实记录派生（替换写死）
    const hasDays = this.data.entries.map((e) => parseInt(String(e.date).slice(8, 10), 10))
    const cells = []
    for (let i = 0; i < first; i++) cells.push({ empty: true })
    for (let i = 1; i <= days; i++) {
      cells.push({ day: i, has: hasDays.includes(i), today: isThisMonth && i === todayDate, empty: false })
    }
    this.setData({ cells })
  },

  onToggle () { this.setData({ viewMode: this.data.viewMode === 'cal' ? 'list' : 'cal' }) },

  onPrev () {
    this._m--
    if (this._m === 0) { this._m = 12; this._y-- }
    this.loadMonth()
  },
  onNext () {
    this._m++
    if (this._m === 13) { this._m = 1; this._y++ }
    this.loadMonth()
  },

  onDay (e) {
    const c = this.data.cells[e.currentTarget.dataset.idx]
    if (c.empty || !c.has) return
    // 简单实现：切到列表视图并 scroll-into-view 到该日记录
    const day = String(c.day).padStart(2, '0')
    const entry = this.data.entries.find((en) => String(en.date).slice(8, 10) === day)
    if (!entry) return
    this.setData({ viewMode: 'list', scrollInto: 'jr-' + entry.id })
  },

  // 长按删除：二次确认后 DELETE 再刷新当月
  onDelete (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除这篇日记？',
      content: '删除后不可恢复',
      confirmText: '删除',
      confirmColor: '#B0533A',
      success: (res) => {
        if (!res.confirm) return
        request(api.journalItem(id), { method: 'DELETE' })
          .then(() => { wx.showToast({ title: '已删除', icon: 'none' }); this.loadMonth() })
          .catch((err) => wx.showToast({ title: (err && err.message) || '删除失败', icon: 'none' }))
      }
    })
  },

  onAdd () { wx.navigateTo({ url: '/subpackages/phase3/feeling-editor/feeling-editor?mode=journal' }) },

  // 危机援助浮层（04-D9 常驻入口）
  onCrisis () { this.setData({ crisisShow: true }) },
  onCrisisClose () { this.setData({ crisisShow: false }) }
})
