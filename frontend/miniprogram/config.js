// 环境配置：上线时改 env 为 'prod'，填入真实域名
const env = 'dev'

const config = {
  dev:  { baseUrl: 'http://localhost:3300' },
  prod: { baseUrl: 'https://你的域名.com' }
}

module.exports = { baseUrl: config[env].baseUrl, env }
