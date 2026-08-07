const { request } = require('../../../utils/request')
const { api } = require('../../../utils/api')

Page({
  onProfile () { wx.navigateTo({ url: '/subpackages/island/profile/profile' }) },
  onReminders () { wx.navigateTo({ url: '/subpackages/island/reminders/reminders' }) },

  onPrivacy () {
    wx.showModal({
      title: '隐私与通知',
      content: '你的日记、感受、打卡数据默认仅你可见，加密存储。我们不会未经许可向第三方分享你的个人信息。如需导出或删除，见下方入口。',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 导出我的数据（隐私合规接口）
  onExport () {
    wx.showModal({
      title: '导出我的数据',
      content: '将打包导出你的打卡、日记、感受等数据。提交后我们会在 24 小时内通过服务通知提供下载链接。',
      confirmText: '提交请求',
      success: (r) => {
        if (!r.confirm) return
        request(api.userExport, { method: 'POST' }).then(() => {
          wx.showToast({ title: '请求已提交', icon: 'success' })
        }).catch((err) => {
          wx.showToast({ title: (err && err.message) || '提交失败', icon: 'none' })
        })
      }
    })
  },

  // 删除账号与数据（二次确认 + 清 token 退出）
  onDelete () {
    wx.showModal({
      title: '删除账号与数据',
      content: '此操作不可恢复，将永久删除你的账号和所有数据。确定继续？',
      confirmText: '继续',
      confirmColor: '#e64340',
      success: (r) => {
        if (!r.confirm) return
        wx.showModal({
          title: '再次确认',
          content: '真的要删除吗？删除后无法找回。',
          confirmText: '确认删除',
          confirmColor: '#e64340',
          success: (r2) => {
            if (!r2.confirm) return
            request(api.userDelete, { method: 'DELETE' }).then(() => {
              wx.showToast({ title: '已删除，即将退出', icon: 'none' })
              setTimeout(() => {
                wx.removeStorageSync('token')
                wx.reLaunch({ url: '/pages/greet/greet' })
              }, 1200)
            }).catch((err) => {
              wx.showToast({ title: (err && err.message) || '删除失败', icon: 'none' })
            })
          }
        })
      }
    })
  },

  onCrisis () {
    wx.showModal({
      title: '心理援助热线',
      content: '北京心理危机研究与干预中心\n010-82951332\n\n全国心理援助热线\n12356',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  onAbout () { wx.navigateTo({ url: '/subpackages/island/about/about' }) }
})
