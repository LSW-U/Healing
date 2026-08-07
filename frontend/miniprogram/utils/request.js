// 统一请求封装：对接后端 { code, data, message }
// BASE 由 config.js 管理，dev=localhost prod=HTTPS域名
const config = require('../config')

function request (path, { method = 'GET', data, auth = true } = {}) {
  return new Promise((resolve, reject) => {
    const header = { 'Content-Type': 'application/json' }
    if (auth) {
      const token = wx.getStorageSync('token')
      if (token) header.Authorization = 'Bearer ' + token
    }
    wx.request({
      url: config.baseUrl + path,
      method,
      data,
      header,
      success: (res) => {
        const b = res.data
        if (b && b.code === 0) resolve(b.data)
        else if (b && b.code === 401) {
          // Token 过期，触发重登
          wx.removeStorageSync('token')
          reject(b && b.message || '未登录')
        } else reject((b && b.message) || '请求失败')
      },
      fail: reject
    })
  })
}

module.exports = { request }
