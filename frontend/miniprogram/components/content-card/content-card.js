Component({
  properties: {
    item: { type: Object, value: {} },
    showArrow: { type: Boolean, value: true }   // wxml 已用 showArrow，补声明避免警告
  },
  methods: {
    onTap () {
      this.triggerEvent('tap', { id: this.properties.item.id })
    }
  }
})
