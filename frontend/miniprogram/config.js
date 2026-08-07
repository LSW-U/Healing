// 环境配置：上线时改 env 为 'prod'，并填入真实 HTTPS 域名
const env = 'dev'

const config = {
  dev:  { baseUrl: 'http://localhost:3300' },
  prod: { baseUrl: '' }  // ⚠️ 上线前必填：真实 HTTPS 域名（需先在小程序后台配 request 合法域名白名单）
}

const baseUrl = config[env].baseUrl
if (env === 'prod' && !baseUrl) {
  // 显式报错，防止忘改域名就上线
  throw new Error('[config] prod 环境 baseUrl 未配置，请在 config.js 填入真实 HTTPS 域名')
}

module.exports = { baseUrl, env }
