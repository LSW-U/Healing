const { request } = require('../../../utils/request')
const { api } = require('../../../utils/api')
const { formatEventDate } = require('../../../utils/util')

Page({
  data: { month: '', solarTerms: '', weeks: ['日', '一', '二', '三', '四', '五', '六'], cells: [], currentEvent: null },

  onLoad () {
    // 默认定位到当前真实月份
    const now = new Date()
    this._y = now.getFullYear()
    this._m = now.getMonth() + 1
    this._solar = {}          // 节气表（按月懒取，格式 {日: 名}）
    this.buildCal(this._y, this._m)
  },

  buildCal (y, m) {
    const monthNames = ['一 月', '二 月', '三 月', '四 月', '五 月', '六 月', '七 月', '八 月', '九 月', '十 月', '十一月', '十二月']
    this.setData({ month: monthNames[m - 1], currentEvent: null })
    const mm = String(m).padStart(2, '0')
    // 按月拉真实活动（strftime 口径，方案 05 批3）；失败不阻塞格子渲染
    request(api.events + '?month=' + y + '-' + mm, { auth: false })
      .then((list) => {
        this._events = {}
        ;(list || []).forEach((e) => {
          // 按 start_time 的「日」挂格子，cell.event 带详情跳转所需 id
          const d = parseInt(String(e.start_time || '').slice(8, 10))
          if (!d) return
          const day = {
            id: e.id,
            title: e.title || '',
            time: formatEventDate(e.start_time).split(' ').slice(2).join(' ') || '',
            location: e.location || '',
            remaining: e.remaining_slots || 0,
            date: `${m}月${d}日 · ${['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(e.start_time.replace(' ', 'T')).getDay()]}`,
          }
          if (!this._events[d]) this._events[d] = day
        })
        this.renderCells(y, m)
      })
      .catch(() => { this._events = {}; this.renderCells(y, m) })
  },

  renderCells (y, m) {
    const days = new Date(y, m, 0).getDate()
    const first = new Date(y, m - 1, 1).getDay()
    const events = this._events || {}
    const solar = this._solar
    const today = new Date()
    const cells = []
    for (let i = 0; i < first; i++) cells.push({ empty: true })
    for (let d = 1; d <= days; d++) {
      const isToday = today.getFullYear() === y && today.getMonth() + 1 === m && today.getDate() === d
      cells.push({ day: d, hasEvent: !!events[d], solar: solar[d] || '', empty: false, today: isToday, selected: false, event: events[d] || null })
    }
    while (cells.length % 7 !== 0) cells.push({ empty: true })
    this.setData({ cells })
  },

  onDay (e) {
    const idx = parseInt(e.currentTarget.dataset.idx)
    const cell = this.data.cells[idx]
    if (cell.empty) return
    const cells = this.data.cells.map((c, i) => ({ ...c, selected: i === idx }))
    this.setData({ cells, currentEvent: cell.event || { title: '暂无活动', date: '点击日期', time: '', location: '', remaining: 0, id: null } })
  },

  onPrev () {
    this._m--
    if (this._m < 1) { this._m = 12; this._y-- }
    this.buildCal(this._y, this._m)
  },

  onNext () {
    this._m++
    if (this._m > 12) { this._m = 1; this._y++ }
    this.buildCal(this._y, this._m)
  },

  // 点击活动跳详情（带 ?id=，S12）；无 id（占位）不动
  onSignup () {
    const id = this.data.currentEvent && this.data.currentEvent.id
    if (!id) return
    wx.navigateTo({ url: '/subpackages/shore/event-detail/event-detail?id=' + id })
  }
})
