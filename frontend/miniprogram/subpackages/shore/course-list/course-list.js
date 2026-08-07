Page({
  data: { cats:['全 部','录 播','直 播','线 下'], catIdx:0, courses:[] },
  onLoad(){this.setData({courses:[
    {id:1,title:'冥想初阶 · 21 天入门',instructor:'林一沐',lessons:'21 课时',typeName:'录 播',price:'¥199',bg:'linear-gradient(135deg,#5B7B8A,#3F5E5A)'},
    {id:2,title:'艺术疗愈 · 曼陀罗绘画',instructor:'陈知微',lessons:'8 课时',typeName:'直 播',price:'¥299',bg:'linear-gradient(135deg,#C9B59A,#8a7558)'},
    {id:3,title:'哲学话疗 · 关系里的自己',instructor:'周临川',lessons:'6 课时',typeName:'线 下',price:'¥588',bg:'linear-gradient(135deg,#3F5E5A,#2B3A42)'},
    {id:4,title:'亲密关系 · 七日共修',instructor:'苏砚',lessons:'7 课时',typeName:'直 播',price:'¥159',bg:'linear-gradient(135deg,#B8746A,#7a4a42)'}
  ]})},
  onCat(e){this.setData({catIdx:parseInt(e.currentTarget.dataset.idx)})},
  onCourse(e){wx.navigateTo({url:'/subpackages/shore/course-detail/course-detail?id='+e.currentTarget.dataset.id})}
})
