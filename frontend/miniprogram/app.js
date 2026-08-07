const { login, getToken } = require('./utils/auth')
const config = require('./config')

App({
  globalData: {
    token: '',
    baseUrl: config.baseUrl,
    env: config.env
  },

  onLaunch () {
    this.globalData.token = getToken()
    this.doLogin()
  },

  doLogin () {
    login()
      .then((data) => {
        this.globalData.token = data.token
      })
      .catch(() => {})
  }
})
