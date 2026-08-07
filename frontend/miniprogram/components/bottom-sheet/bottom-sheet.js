Component({
  properties: {
    show: { type: Boolean, value: false }
  },
  methods: {
    close () { this.triggerEvent('close') },
    onMask () { this.close() }
  }
})
