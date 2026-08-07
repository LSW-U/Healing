Component({
  properties: {
    pattern: {
      type: Object,
      value: { inhale: 4, hold_in: 7, exhale: 8, hold_out: 0, name: '呼吸' }
    },
    running: {
      type: Boolean,
      value: true
    }
  },
  data: {
    phaseText: '吸气',
    phaseIdx: 0
  },
  lifetimes: {
    attached () {
      this._rebuild(this.properties.pattern)
      if (this.properties.running) this._tick()
    },
    // 必须在 lifetimes 内，新基础库才稳定触发，避免定时器泄漏
    detached () {
      if (this._timer) clearTimeout(this._timer)
    }
  },
  observers: {
    // pattern 变化时重建阶段并重启（支持切换呼吸法）
    'pattern': function (p) {
      this._rebuild(p)
      if (this._timer) { clearTimeout(this._timer); this._timer = null }
      this.setData({ phaseIdx: 0 })
      if (this.properties.running) this._tick()
    }
  },
  methods: {
    _rebuild (p) {
      // 过滤 dur<=0 的 phase，避免空转（默认 hold_out=0 会被滤掉）
      this._phases = [
        { text: '吸气', dur: p.inhale },
        { text: '屏息', dur: p.hold_in || 0 },
        { text: '呼气', dur: p.exhale },
        { text: '屏息', dur: p.hold_out || 0 }
      ].filter(ph => ph.dur > 0)
    },
    _tick () {
      const phases = this._phases
      if (!phases || !phases.length) return
      const idx = this.data.phaseIdx % phases.length
      const phase = phases[idx]
      this.setData({ phaseText: phase.text, phaseIdx: idx })
      this._timer = setTimeout(() => {
        this.setData({ phaseIdx: (idx + 1) % phases.length })
        this._tick()
      }, phase.dur * 1000)
    }
  }
})
