Page({
  data: { month: '八 月', solarTerms: '立 秋 · 处 暑', weeks: ['日', '一', '二', '三', '四', '五', '六'], cells: [], currentEvent: null },

  onLoad () {
    // 默认定位到当前真实月份（不再是写死的 2026-8）
    const now = new Date()
    this._y = now.getFullYear()
    this._m = now.getMonth() + 1
    this.buildCal(this._y, this._m)
  },

  buildCal (y, m) {
    const days = new Date(y, m, 0).getDate()
    const first = new Date(y, m - 1, 1).getDay()
    // 活动数据：当前写死 2026-8（待接 /api/events 按月拉取）；其他月份留空
    const events = (y === 2026 && m === 8) ? {
      6: { title: '颂 钵 音 疗 沙 龙', time: '19:30—21:00', location: '共时海工作室', remaining: 2, date: '8月6日 · 周四' },
      7: { title: '立秋 · 凉风至茶会', time: '19:30—21:00', location: '共时海工作室', remaining: 2, date: '8月7日 · 周五' },
      12: { title: '芳香颂钵·沉浸之夜', time: '20:00—21:30', location: '共时海工作室', remaining: 5, date: '8月12日·周二' },
      15: { title: '色彩与情绪·表达性绘画', time: '14:00—16:00', location: '共时海工作室', remaining: 6, date: '8月15日·周日' },
      23: { title: '处暑·节气茶会', time: '15:00—16:30', location: '共时海工作室', remaining: 8, date: '8月23日·周日' },
      28: { title: '满月冥想圈', time: '19:30—21:00', location: '共时海工作室', remaining: 3, date: '8月28日·周五' }
    } : {}
    const solar = (y === 2026 && m === 8) ? { 7: '立秋', 23: '处暑' } : {}
    const monthNames = ['一 月', '二 月', '三 月', '四 月', '五 月', '六 月', '七 月', '八 月', '九 月', '十 月', '十一月', '十二月']
    const today = new Date()
    const cells = []
    for (let i = 0; i < first; i++) cells.push({ empty: true })
    for (let d = 1; d <= days; d++) {
      const isToday = today.getFullYear() === y && today.getMonth() + 1 === m && today.getDate() === d
      cells.push({ day: d, hasEvent: !!events[d], solar: solar[d] || '', empty: false, today: isToday, selected: false, event: events[d] || null })
    }
    while (cells.length % 7 !== 0) cells.push({ empty: true })
    this.setData({ cells, month: monthNames[m - 1] })
  },

  onDay (e) {
    const idx = parseInt(e.currentTarget.dataset.idx)
    const cell = this.data.cells[idx]
    if (cell.empty) return
    const cells = this.data.cells.map((c, i) => ({ ...c, selected: i === idx }))
    this.setData({ cells, currentEvent: cell.event || { title: '暂无活动', date: '点击日期', time: '', location: '', remaining: 0 } })
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

  onSignup () { wx.navigateTo({ url: '/subpackages/shore/event-detail/event-detail' }) }
})
