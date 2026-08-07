const util = require('../../../../utils/util')

Page({
  data: {
    tideText: '微 澜',
    streak: 1,
    checkedToday: false,
    records: []
  },
  onLoad () {
    this.setData({
      tideText: util.formatTideLevel(2),
      records: [
        { id:1, date:'8.7', mood:'微 光', note:'今晨的呼吸很慢，海好像也停了一下…' },
        { id:2, date:'8.6', mood:'沉 静', note:'' },
        { id:3, date:'8.5', mood:'温 暖', note:'雨声里睡了很久' }
      ]
    })
  }
})
