Page({
  data:{circle:{currentDay:14,cycleDays:21,progress:66,todayCount:12,avatars:['#C9B59A','#5B7B8A','#3F5E5A','#B8746A','#8A8A8A'],extraCount:7},
  posts:[
    {id:1,name:'小 满',time:'08:12',mood:'沉 静',text:'今早的呼吸很顺，好像跟着海一起涨落',avBg:'#C9B59A'},
    {id:2,name:'青 舟',time:'07:45',mood:'微 光',text:'醒来第一件事是呼吸，今天是新的海',avBg:'#5B7B8A'}
  ]},
  onReact(e){wx.showToast({title:e.currentTarget.dataset.type,icon:'none'})},
  onPost(){wx.showToast({title:'发打卡/感受（三期实现）',icon:'none'})}
})
