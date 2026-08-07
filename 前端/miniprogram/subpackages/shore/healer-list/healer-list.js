Page({
  data: {
    cats: ['全 部', '颂 钵', '正 念', '艺 术 疗 愈', '哲 学 话 疗'],
    catIdx: 0,
    healers: []
  },
  onLoad () {
    // 静态占位 + 异步拉 API
    this.setData({ healers: [
      { id:1, name:'林 一 沐', title:'颂钵疗愈师 · 从业 8 年', quote:'"声音是温柔的手，抚过每一寸紧绷"', tags:['颂钵','声音疗愈'], bg:'linear-gradient(135deg,#C9B59A,#8a7558)' },
      { id:2, name:'苏 砚', title:'正念冥想引导师 · 从业 6 年', quote:'"呼吸是最小的舟，渡你回到此刻"', tags:['正念','冥想'], bg:'linear-gradient(135deg,#5B7B8A,#3F5E5A)' },
      { id:3, name:'陈 知 微', title:'艺术疗愈师 · 从业 5 年', quote:'"画笔下藏着你还没说出口的话"', tags:['艺术疗愈','绘画'], bg:'linear-gradient(135deg,#3F5E5A,#2B3A42)' },
      { id:4, name:'周 临 川', title:'哲学话疗师 · 从业 7 年', quote:'"有些困惑，说出来海就宽了"', tags:['哲学话疗'], bg:'linear-gradient(135deg,#B8746A,#7a4a42)' }
    ]})
  },
  onCat (e) { this.setData({ catIdx: parseInt(e.currentTarget.dataset.idx) }) },
  onHealer (e) {
    wx.navigateTo({ url: '/subpackages/shore/healer-detail/healer-detail?id=' + e.currentTarget.dataset.id })
  }
})
