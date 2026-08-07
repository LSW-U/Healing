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
      this._phases = [
        { text: '吸气', dur: this.properties.pattern.inhale },
        { text: '屏息', dur: this.properties.pattern.hold_in || 0 },
        { text: '呼气', dur: this.properties.pattern.exhale },
        { text: '屏息', dur: this.properties.pattern.hold_out || 0 }
      ]
      if (this.properties.running) this._tick()
    }
  },
  methods: {
    _tick () {
      const phases = this._phases
      const idx = this.data.phaseIdx
      const phase = phases[idx % phases.length]
      if (!phase || phase.dur <= 0) {
        const next = (idx + 1) % phases.length
        this.setData({ phaseIdx: next, phaseText: phases[next].text })
        this._timer = setTimeout(() => this._tick(), 200)
        return
      }
      this.setData({ phaseText: phase.text })
      this._timer = setTimeout(() => {
        const next = (idx + 1) % phases.length
        this.setData({ phaseIdx: next })
        this._tick()
      }, phase.dur * 1000)
    }
  },
  detached () {
    if (this._timer) clearTimeout(this._timer)
  }
})
