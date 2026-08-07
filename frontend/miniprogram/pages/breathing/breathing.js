Page({
  data: {
    pattern: { inhale: 4, hold_in: 7, exhale: 8, hold_out: 0 },
    phaseText: '吸 气',
    cycle: 1,
    elapsed: '0 分 0 秒',
    seconds: 0
  },

  onLoad () {
    this._phases = [
      { text: '吸 气', dur: this.data.pattern.inhale },
      { text: '屏 息', dur: this.data.pattern.hold_in },
      { text: '呼 气', dur: this.data.pattern.exhale },
      { text: '屏 息', dur: this.data.pattern.hold_out }
    ]
    this._idx = 0
    this._started = Date.now()
    this._tick()
    this._timer = setInterval(() => {
      const s = Math.floor((Date.now() - this._started) / 1000)
      this.setData({
        elapsed: Math.floor(s / 60) + ' 分 ' + (s % 60) + ' 秒',
        seconds: s
      })
    }, 1000)
  },

  _tick () {
    const phase = this._phases[this._idx % 4]
    if (phase.dur <= 0) {
      this._idx++
      this._tick()
      return
    }
    this.setData({ phaseText: phase.text })
    setTimeout(() => {
      this._idx++
      if (this._idx > 0 && this._idx % 4 === 0) {
        this.setData({ cycle: Math.floor(this._idx / 4) + 1 })
      }
      this._tick()
    }, phase.dur * 1000)
  },

  onStop () {
    if (this._timer) clearInterval(this._timer)
    wx.redirectTo({ url: '/pages/feedback/feedback?s=' + this.data.seconds })
  },

  onUnload () {
    if (this._timer) clearInterval(this._timer)
  }
})
