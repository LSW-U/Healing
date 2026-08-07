// 登录态管理
const { request } = require('./request')

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

function getToken () {
  return wx.getStorageSync('token') || ''
}

function isLogin () {
  return !!getToken()
}

function logout () {
  wx.removeStorageSync('token')
}

module.exports = { login, getToken, isLogin, logout }
