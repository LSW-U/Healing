// 打卡卡：canvas 合成 + 真分享 + 保存相册
Page({
  data: {
    solarTerm: '立秋',
    moonPhase: '满月',
    quote: '潮起潮落，你都在',
    practice: '晨间苏醒 · 8 分钟冥想',
    streak: 7   // 连续打卡天数（待接 /api/checkins/tide 拉真实值）
  },

  onLoad (options) {
    // 打卡页可传入连续天数；缺省 7
    if (options && options.s) this.setData({ streak: parseInt(options.s) || 7 })
    this.drawCard()
  },

  // canvas 2d 绘制 → 导出临时图片供分享
  drawCard () {
    const query = wx.createSelectorQuery()
    query.select('#cardCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0]) return
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      const w = res[0].width
      const h = res[0].height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)

      // 背景渐变
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, '#5B7B8A')
      grad.addColorStop(1, '#2B3A42')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // 节气 · 月相
      ctx.fillStyle = '#C9D6DB'
      ctx.font = '13px sans-serif'
      ctx.fillText(this.data.solarTerm + ' · ' + this.data.moonPhase, 28, 44)

      // 连续天数（主视觉）
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 56px sans-serif'
      ctx.fillText(this.data.streak + ' 天', 28, 132)
      ctx.fillStyle = '#9CB0B8'
      ctx.font = '14px sans-serif'
      ctx.fillText('持 续 与 海 同 频', 28, 160)

      // 引文（换行）
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '18px sans-serif'
      this.wrapText(ctx, '"' + this.data.quote + '"', 28, 224, w - 56, 28)

      // 练习 + 品牌（底部）
      ctx.fillStyle = '#9CB0B8'
      ctx.font = '13px sans-serif'
      ctx.fillText(this.data.practice, 28, h - 72)
      ctx.fillStyle = '#C9D6DB'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('共 时 海', 28, h - 40)

      // 导出图片
      wx.canvasToTempFilePath({
        canvas,
        success: (r) => { this._shareImg = r.tempFilePath },
        fail: () => {}
      })
    })
  },

  // 中文按字符换行
  wrapText (ctx, text, x, y, maxWidth, lineHeight) {
    let line = ''
    let curY = y
    for (const ch of text) {
      const test = line + ch
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, curY)
        line = ch
        curY += lineHeight
      } else {
        line = test
      }
    }
    if (line) ctx.fillText(line, x, curY)
  },

  onShare () {
    if (!this._shareImg) {
      wx.showToast({ title: '卡片生成中，请稍候', icon: 'none' })
      return
    }
    wx.showToast({ title: '点右上角 · 分享给朋友/朋友圈', icon: 'none', duration: 2200 })
  },

  onSave () {
    if (!this._shareImg) {
      wx.showToast({ title: '卡片生成中', icon: 'none' })
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath: this._shareImg,
      success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: (err) => {
        const msg = (err.errMsg || '').indexOf('auth') > -1 ? '请授权相册权限' : '保存失败'
        wx.showToast({ title: msg, icon: 'none' })
      }
    })
  },

  onShareAppMessage () {
    return {
      title: '我在共时海连续打卡 ' + this.data.streak + ' 天 · ' + this.data.quote,
      path: '/pages/discover/discover',
      imageUrl: this._shareImg || ''
    }
  },

  onShareTimeline () {
    return {
      title: '我在共时海连续打卡 ' + this.data.streak + ' 天',
      imageUrl: this._shareImg || ''
    }
  }
})
