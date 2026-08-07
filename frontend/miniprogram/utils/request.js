// 统一请求封装：对接后端 { code, data, message }
// BASE 由 config.js 管理，dev=localhost prod=HTTPS域名
const config = require('../config')

// 401 回调：由 app.js 启动时注入 ensureLogin（避免 request ↔ auth 循环依赖）
let _onUnauthorized = null
function setOnUnauthorized (fn) { _onUnauthorized = fn }

function request (path, { method = 'GET', data, auth = true, _retried = false } = {}) {
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
      timeout: 10000,
      success: (res) => {
        const b = res.data
        if (b && b.code === 0) {
          resolve(b.data)
        } else if (b && b.code === 401) {
          // token 失效：清掉，首次静默重登一次后重试，避免用户感知
          wx.removeStorageSync('token')
          if (!_retried && _onUnauthorized) {
            _onUnauthorized()
              .then(() => request(path, { method, data, auth, _retried: true }))
              .then(resolve)
              .catch(() => reject(new Error((b && b.message) || '未登录')))
          } else {
            reject(new Error((b && b.message) || '未登录'))
          }
        } else {
          reject(new Error((b && b.message) || '请求失败'))
        }
      },
      fail: (err) => {
        // 归一化错误，避免业务层 toast 显示 [object Object]
        const e = (err && err.errMsg) || ''
        const msg = /timeout/i.test(e) ? '请求超时，请稍后再试'
          : /fail/i.test(e) ? '网络异常，请检查连接'
          : '请求失败，请稍后再试'
        reject(new Error(msg))
      }
    })
  })
}

module.exports = { request, setOnUnauthorized }
