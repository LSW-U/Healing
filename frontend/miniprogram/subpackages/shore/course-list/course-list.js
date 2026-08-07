const { request } = require('../../../utils/request')
const { api } = require('../../../utils/api')

Page({
  data: {
    cats: ['全 部', '录 播', '直 播', '线 下'],
    catIdx: 0,
    courses: [],
    filtered: []
  },

  onLoad () {
    this.setData({
      courses: [
        { id: 1, title: '冥想初阶 · 21 天入门', instructor: '林一沐', lessons: '21 课时', typeName: '录 播', price: '¥199', bg: 'linear-gradient(135deg,#5B7B8A,#3F5E5A)' },
        { id: 2, title: '艺术疗愈 · 曼陀罗绘画', instructor: '陈知微', lessons: '8 课时', typeName: '直 播', price: '¥299', bg: 'linear-gradient(135deg,#C9B59A,#8a7558)' },
        { id: 3, title: '哲学话疗 · 关系里的自己', instructor: '周临川', lessons: '6 课时', typeName: '线 下', price: '¥588', bg: 'linear-gradient(135deg,#3F5E5A,#2B3A42)' },
        { id: 4, title: '亲密关系 · 七日共修', instructor: '苏砚', lessons: '7 课时', typeName: '直 播', price: '¥159', bg: 'linear-gradient(135deg,#B8746A,#7a4a42)' }
      ]
    })
    this.applyFilter()
    this.loadFromApi()
  },

  loadFromApi () {
    request(api.columns, { auth: false }).then((list) => {
      if (list && list.length) {
        this.setData({
          courses: list.map(c => ({
            id: c.id,
            title: c.title || '',
            instructor: c.instructor || '',
            lessons: c.lessons || '',
            typeName: c.typeName || c.type || '录 播',
            price: c.price || '',
            bg: 'linear-gradient(135deg,#5B7B8A,#3F5E5A)'
          }))
        })
        this.applyFilter()
      }
    }).catch(() => {})
  },

  // 按 catIdx 过滤（catIdx=0 全部；其余按 typeName 匹配，去空格后包含即命中）
  applyFilter () {
    const { catIdx, cats, courses } = this.data
    const cat = cats[catIdx].replace(/ /g, '')
    const filtered = catIdx === 0 ? courses : courses.filter(c => (c.typeName || '').replace(/ /g, '').indexOf(cat) > -1)
    this.setData({ filtered })
  },

  onCat (e) {
    this.setData({ catIdx: parseInt(e.currentTarget.dataset.idx) })
    this.applyFilter()
  },

  onCourse (e) {
    wx.navigateTo({ url: '/subpackages/shore/course-detail/course-detail?id=' + e.currentTarget.dataset.id })
  }
})
