Page({
  data: {
    pattern: { inhale: 4, hold_in: 7, exhale: 8, hold_out: 0 },
    phaseText: '吸 气',
    cycle: 1,
    elapsed: '0 分 0 秒',
    seconds: 0
  },

  onLoad () {
    // 过滤 dur<=0 的 phase，避免空转 / 同步递归栈溢出
    this._phases = [
      { text: '吸 气', dur: this.data.pattern.inhale },
      { text: '屏 息', dur: this.data.pattern.hold_in },
      { text: '呼 气', dur: this.data.pattern.exhale },
      { text: '屏 息', dur: this.data.pattern.hold_out }
    ].filter(p => p.dur > 0)
    this._idx = 0
    this._started = Date.now()
    if (this._phases.length) this._tick()
    this._timer = setInterval(() => {
      const s = Math.floor((Date.now() - this._started) / 1000)
      this.setData({
        elapsed: Math.floor(s / 60) + ' 分 ' + (s % 60) + ' 秒',
        seconds: s
      })
    }, 1000)
  },

  _tick () {
    if (!this._phases.length) return
    const phase = this._phases[this._idx % this._phases.length]
    this.setData({ phaseText: phase.text })
    this._phaseTimer = setTimeout(() => {
      this._idx++
      if (this._idx > 0 && this._idx % this._phases.length === 0) {
        this.setData({ cycle: Math.floor(this._idx / this._phases.length) + 1 })
      }
      this._tick()
    }, phase.dur * 1000)
  },

  _clearTimers () {
    if (this._timer) { clearInterval(this._timer); this._timer = null }
    if (this._phaseTimer) { clearTimeout(this._phaseTimer); this._phaseTimer = null }
  },

  onStop () {
    this._clearTimers()
    // navigateTo 保留 breathing 在栈底，feedback 关闭即回；不再 redirectTo 清栈
    wx.navigateTo({ url: '/pages/feedback/feedback?s=' + this.data.seconds })
  },

  onUnload () {
    this._clearTimers()
  }
})
