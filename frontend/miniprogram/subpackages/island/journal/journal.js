Page({
  data: {
    viewMode: 'list',
    month: '八 月',
    solarTerms: '立 秋 · 处 暑',
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    cells: [],
    entries: [
      { id: 1, date: '8.7 周四', mood: '微 光', text: '今晨的呼吸很慢，海好像也停了一下…', rel: '海的呼吸 · 颂钵引导', moon: '满月' },
      { id: 2, date: '8.5 周二', mood: '沉 静', text: '雨声里写了几行字，今天不用说话', rel: '雨声·檐下的午后' },
      { id: 3, date: '8.3 周日', mood: '温 暖', text: '第一次尝试呼吸练习，眼眶有点湿', rel: '冥想初级·呼吸锚定' }
    ]
  },

  onLoad () { this.buildCal() },

  buildCal () {
    // 用当前真实月份生成日历（不再写死 d=31/f=5/today=7）
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const days = new Date(y, m, 0).getDate()
    const first = new Date(y, m - 1, 1).getDay()
    const today = now.getDate()
    // 有日记的日期：当前写死 8 月（待接 /api/journals 按月拉取）
    const hasDays = (m === 8) ? [3, 5, 7] : []
    const monthNames = ['一 月', '二 月', '三 月', '四 月', '五 月', '六 月', '七 月', '八 月', '九 月', '十 月', '十一月', '十二月']
    const cells = []
    for (let i = 0; i < first; i++) cells.push({ empty: true })
    for (let i = 1; i <= days; i++) cells.push({ day: i, has: hasDays.includes(i), today: i === today, empty: false })
    this.setData({ cells, month: monthNames[m - 1] })
  },

  onToggle () { this.setData({ viewMode: this.data.viewMode === 'cal' ? 'list' : 'cal' }) },
  onPrev () { wx.showToast({ title: '上月（待接日记 API）', icon: 'none' }) },
  onDay (e) {
    const c = this.data.cells[e.currentTarget.dataset.idx]
    if (!c.empty && c.has) wx.showToast({ title: c.day + '日已记', icon: 'none' })
  },
  onAdd () { wx.showToast({ title: '写日记（三期实现）', icon: 'none' }) }
})
