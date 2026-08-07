// 登录态管理
const { request } = require('./request')

// 并发去重：同一时刻只跑一次 login（避免启动 + 多个 401 同时触发撞多次 /login）
let _loginPromise = null

function login () {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        request('/login', {
          method: 'POST',
          data: { code: res.code || 'dev' },
          auth: false
        }).then((data) => {
          wx.setStorageSync('token', data.token)
          resolve(data)
        }).catch(reject)
      },
      fail: reject
    })
  })
}

// 单例登录：已在进行中则复用同一 promise
function ensureLogin () {
  if (_loginPromise) return _loginPromise
  _loginPromise = login().finally(() => { _loginPromise = null })
  return _loginPromise
}

function getToken () {
  return wx.getStorageSync('token') || ''
}

function isLogin () {
  return !!getToken()
}

function logout () {
  wx.removeStorageSync('token')
}

module.exports = { login, ensureLogin, getToken, isLogin, logout }
