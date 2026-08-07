Page({data:{cats:['内 容','疗 愈 师','课 程'],catIdx:0,groups:[
  {name:'睡 前',items:[{id:1,title:'海 的 呼 吸',subtitle:'颂钵引导 · 8 分钟',bg:'linear-gradient(135deg,#5B7B8A,#3F5E5A)'},{id:2,title:'深夜电台·第12期',subtitle:'人声引导 · 12 分钟',bg:'linear-gradient(135deg,#3F5E5A,#2B3A42)'}]},
  {name:'通 勤',items:[{id:3,title:'雨声·檐下的午后',subtitle:'自然声 · 30 分钟',bg:'linear-gradient(135deg,#C9B59A,#8a7558)'}]}
]},onCat(e){this.setData({catIdx:parseInt(e.currentTarget.dataset.idx)})},onItem(e){wx.navigateTo({url:'/pages/content-detail/content-detail?id='+e.currentTarget.dataset.id})}})
