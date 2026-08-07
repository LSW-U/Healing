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
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})
