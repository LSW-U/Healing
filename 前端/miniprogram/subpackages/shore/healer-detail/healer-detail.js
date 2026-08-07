Page({
  data: { healer: {} },
  onLoad (options) {
    const id = parseInt(options.id) || 1
    const all = [
      { id:1, name:'林 一 沐', title:'颂钵疗愈师 · 从业 8 年', bg:'linear-gradient(135deg,#C9B59A,#8a7558)', tags:['颂钵','声音疗愈','线下','线上'], about:'受训于尼泊尔颂钵传承体系，八年来在声音的共振里陪伴许多人卸下紧绷。相信声音能抵达言语到不了的地方。', specialties:'颂钵音疗沙龙 · 一对一声音疗愈 · 睡前助眠引导 · 情绪释放', services:[{name:'一对一声音疗愈',desc:'60 分钟 · 线下',price:'¥388'},{name:'颂钵沙龙（小班）',desc:'90 分钟 · 线下',price:'¥128'},{name:'睡前助眠音频',desc:'线上 · 已上线',price:'¥19.9'}] },
      { id:2, name:'苏 砚', title:'正念冥想引导师 · 从业 6 年', bg:'linear-gradient(135deg,#5B7B8A,#3F5E5A)', tags:['正念','冥想','线上'], about:'六年来在正念修习中陪伴都市人回到当下。', specialties:'正念减压 · 呼吸练习 · 正念饮食', services:[{name:'正念减压课程',desc:'60 分钟 · 线下',price:'¥298'}] },
      { id:3, name:'陈 知 微', title:'艺术疗愈师 · 从业 5 年', bg:'linear-gradient(135deg,#3F5E5A,#2B3A42)', tags:['艺术疗愈','绘画','线下'], about:'用画笔和色彩陪伴你安放情绪。', specialties:'表达性绘画 · 曼陀罗 · 团体工作坊', services:[{name:'表达性绘画工作坊',desc:'90 分钟 · 线下',price:'¥198'}] },
      { id:4, name:'周 临 川', title:'哲学话疗师 · 从业 7 年', bg:'linear-gradient(135deg,#B8746A,#7a4a42)', tags:['哲学话疗','自我探索'], about:'在思辨里照见自己。', specialties:'哲学对话 · 一对一话疗 · 小组沙龙', services:[{name:'一对一话疗',desc:'60 分钟 · 线下/线上',price:'¥288'}] },
    ]
    this.setData({ healer: all.find(h => h.id === id) || all[0] })
  },
  onBook () { wx.showToast({ title: '预约咨询（二期实现）', icon: 'none' }) }
})
