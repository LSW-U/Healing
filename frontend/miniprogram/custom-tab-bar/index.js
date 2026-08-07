Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/discover/discover', text: '潮', icon: '~' },
      { pagePath: '/pages/practice/practice', text: '海', icon: '≈' },
      { pagePath: '/pages/shore/shore', text: '岸', icon: '⌂' },
      { pagePath: '/pages/me/me', text: '岛', icon: '◉' }
    ]
  },
  methods: {
    switchTab (e) {
      const { path, index } = e.currentTarget.dataset
      // selected 统一由目标页 onShow 设置，不在本地 setData，避免快速切 tab 时高亮错乱
      if (this.data.selected === index) return  // 已在当前 tab，不重复跳
      wx.switchTab({ url: path })
    }
  }
})
