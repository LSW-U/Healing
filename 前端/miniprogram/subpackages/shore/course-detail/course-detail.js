Page({
  data:{course:{}},
  onLoad(o){const id=parseInt(o.id)||1;const all=[
    {id:1,title:'冥想初阶 · 21 天入门',instructor:'林一沐',lessons:'21 课时',typeName:'录 播',price:'¥199',origPrice:'¥299',intro:'21 天，每天 10-15 分钟，从呼吸开始建立冥想习惯。无需基础，跟随引导循序渐进。',suits:['零基础','压力人群','睡眠困扰','想建立习惯'],outline:[{no:'一',t:'认识呼吸 · 安顿身体',d:'3 课时'},{no:'二',t:'观察思绪 · 不评判',d:'5 课时'},{no:'三',t:'情绪共处 · 温柔接纳',d:'6 课时'},{no:'四',t:'日常正念 · 融入生活',d:'7 课时'}],notice:'报名后 365 天内有效，可反复观看。'},
    {id:2,title:'艺术疗愈 · 曼陀罗绘画',instructor:'陈知微',lessons:'8 课时',typeName:'直 播',price:'¥299',intro:'曼陀罗是圆，是秩序，是你在色彩中照见自己。',suits:['无需绘画基础','自我探索'],outline:[],notice:'虚拟商品不支持退款。'}
  ];this.setData({course:all.find(c=>c.id===id)||all[0]})},
  onFav(){wx.showToast({title:'已收藏',icon:'none'})},
  onSignup(){wx.navigateTo({url:'/subpackages/shore/signup-success/signup-success'})}
})
