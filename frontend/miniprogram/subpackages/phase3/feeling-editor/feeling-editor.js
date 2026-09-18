// 感受编辑器（接真 POST /api/feelings；mode=journal 复用为日记编辑，POST /api/journals）
const { request } = require('../../utils/request')
const { api } = require('../../utils/api')

Page({
  data: {
    moods: ['起 伏', '沉 静', '微 光', '澄 澈', '温 暖'],
    moodIdx: 2,
    text: '',
    submitting: false
  },
  onLoad (options) {
    this._cid = options.cid || ''            // related_content_id 透传（练习完成反馈页进入时携带）
    this._mode = options.mode === 'journal' ? 'journal' : 'feeling'
  },
  onMood (e) { this.setData({ moodIdx: parseInt(e.currentTarget.dataset.idx) }) },
  onInput (e) { this.setData({ text: e.detail.value }) },
  onCrisis () { this.setData({ crisisShow: true }) },
  onCrisisClose () { this.setData({ crisisShow: false }) },
  onSubmit () {
    if (this.data.submitting) return
    const { moodIdx, moods, text } = this.data
    if (this._mode === 'journal') {
      // 日记复用：date 取今天，后端同日重复写入会更新
      request(api.journals, {
        method: 'POST',
        data: { date: new Date().toISOString().slice(0, 10), mood: moods[moodIdx], text }
      }).then((res) => this.afterSubmit(res)).catch((err) => this.onError(err))
    } else {
      request(api.feelings, {
        method: 'POST',
        data: { mood: moods[moodIdx], text, is_private: 1, related_content_id: this._cid || null }
      }).then((res) => this.afterSubmit(res)).catch((err) => this.onError(err))
    }
    this.setData({ submitting: true })
  },
  afterSubmit (res) {
    this.setData({ submitting: false })
    // 高危词命中（04-D7）：弹出危机援助浮层，热线列表用响应内嵌数据避免二次请求
    if (res && res.crisisAlert) {
      this.setData({ crisisShow: true, crisisList: (res.crisis || []) })
      return
    }
    wx.navigateBack()
  },
  onError (err) {
    this.setData({ submitting: false })
    wx.showToast({ title: (err && err.message) || '发布失败，请重试', icon: 'none' })
  }
})
