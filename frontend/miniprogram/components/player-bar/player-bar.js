// 全局播放浮窗：监听 app.globalData.player 状态，点击回到 player 页
Component({
  data: { show: false, title: '', playing: false },
  lifetimes: {
    attached () {
      const app = getApp()
      app.watchPlayer((state) => {
        this.setData({
          show: !!state.show,
          title: state.title || '',
          playing: !!state.playing
        })
      })
    }
  },
  methods: {
    // 点击浮窗 → 回到播放器
    onTap () {
      const app = getApp()
      const id = app.globalData.player.contentId
      if (id) wx.navigateTo({ url: '/pages/player/player?id=' + id })
    },
    // 浮窗上的播放/暂停（状态由 player 页 onPlay/onPause 回调同步，不本地推算）
    onToggle () {
      const bg = wx.getBackgroundAudioManager()
      if (bg.paused) bg.play(); else bg.pause()
    }
  }
})
